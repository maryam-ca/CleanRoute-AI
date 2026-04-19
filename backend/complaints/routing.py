from math import atan2, ceil, cos, radians, sin, sqrt

import numpy as np
from django.contrib.auth.models import User
from django.utils import timezone
from sklearn.cluster import KMeans

from .models import Complaint


EARTH_RADIUS_KM = 6371.0
ROAD_SPEED_KMH = 25

AREA_BOUNDS = {
    "attock": {
        "label": "Attock",
        "lat_min": 33.68,
        "lat_max": 33.96,
        "lng_min": 72.14,
        "lng_max": 72.52,
    },
    "mehria town": {
        "label": "Mehria Town",
        "lat_min": 33.804,
        "lat_max": 33.819,
        "lng_min": 72.345,
        "lng_max": 72.357,
    },
}


def haversine_distance_km(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return EARTH_RADIUS_KM * 2 * atan2(sqrt(a), sqrt(1 - a))


def get_testers():
    return list(User.objects.filter(username__startswith="tester").order_by("id"))


def get_area_definition(area_name):
    if not area_name:
        return AREA_BOUNDS["attock"]
    return AREA_BOUNDS.get(area_name.strip().lower(), AREA_BOUNDS["attock"])


def get_area_queryset(area_name):
    area = get_area_definition(area_name)
    return Complaint.objects.filter(
        latitude__isnull=False,
        longitude__isnull=False,
        latitude__gte=area["lat_min"],
        latitude__lte=area["lat_max"],
        longitude__gte=area["lng_min"],
        longitude__lte=area["lng_max"],
    ).exclude(status="completed")


def get_active_route_anchor(tester):
    complaints = list(
        Complaint.objects.filter(
            assigned_to=tester,
            status="assigned",
            latitude__isnull=False,
            longitude__isnull=False,
        )
    )
    if not complaints:
        return None

    avg_lat = sum(float(c.latitude) for c in complaints) / len(complaints)
    avg_lng = sum(float(c.longitude) for c in complaints) / len(complaints)
    return (avg_lat, avg_lng, len(complaints))


def choose_best_tester_for_point(latitude, longitude, testers=None):
    testers = testers or get_testers()
    if not testers:
        return None

    ranked = []
    for tester in testers:
        active_count = Complaint.objects.filter(assigned_to=tester, status="assigned").count()
        anchor = get_active_route_anchor(tester)

        if anchor:
            anchor_lat, anchor_lng, route_load = anchor
            distance_km = haversine_distance_km(latitude, longitude, anchor_lat, anchor_lng)
            proximity_score = max(0, 70 - (distance_km * 10))
            load_penalty = route_load * 4
        else:
            distance_km = None
            proximity_score = 25
            load_penalty = 0

        workload_score = max(0, 30 - (active_count * 5))
        total_score = proximity_score + workload_score - load_penalty

        ranked.append(
            {
                "tester": tester,
                "score": round(total_score, 2),
                "distance_km": round(distance_km, 2) if distance_km is not None else None,
                "active_count": active_count,
            }
        )

    ranked.sort(
        key=lambda item: (
            -item["score"],
            item["distance_km"] is None,
            item["distance_km"] if item["distance_km"] is not None else 999999,
            item["active_count"],
            item["tester"].id,
        )
    )
    return ranked[0]


def auto_assign_complaint(complaint):
    if not complaint.latitude or not complaint.longitude:
        return None

    match = choose_best_tester_for_point(float(complaint.latitude), float(complaint.longitude))
    if not match:
        return None

    complaint.assigned_to = match["tester"]
    complaint.status = "assigned"
    complaint.assigned_at = timezone.now()
    complaint.save(update_fields=["assigned_to", "status", "assigned_at"])
    return match


def nearest_neighbor_order(complaints):
    route = list(complaints)
    if len(route) <= 2:
        return route

    remaining = route[:]
    ordered = [remaining.pop(0)]

    while remaining:
        current = ordered[-1]
        next_item = min(
            remaining,
            key=lambda candidate: haversine_distance_km(
                float(current.latitude),
                float(current.longitude),
                float(candidate.latitude),
                float(candidate.longitude),
            ),
        )
        ordered.append(next_item)
        remaining.remove(next_item)

    return ordered


def compute_path_distance_km(points):
    if isinstance(points, dict):
        coordinates = points.get("coordinates") or []
        normalized_points = [(lat, lng) for lng, lat in coordinates]
    else:
        normalized_points = list(points)

    if len(normalized_points) < 2:
        return 0.0

    total = 0.0
    for index in range(1, len(normalized_points)):
        prev_lat, prev_lng = normalized_points[index - 1]
        curr_lat, curr_lng = normalized_points[index]
        total += haversine_distance_km(prev_lat, prev_lng, curr_lat, curr_lng)
    return total


def get_road_route_geometry(points):
    coordinates = [[lng, lat] for lat, lng in points]

    if len(coordinates) == 1:
        coordinates.append(coordinates[0][:])

    return {
        "type": "LineString",
        "coordinates": coordinates,
    }


def build_clustered_routes(complaints, area_name):
    if not complaints:
        return {
            "success": True,
            "area": get_area_definition(area_name)["label"],
            "total_clusters": 0,
            "total_complaints": 0,
            "time_saved": 0,
            "complaints": [],
            "routes": [],
        }

    testers = get_testers()
    coords = np.array([[float(c.latitude), float(c.longitude)] for c in complaints])
    complaints_count = len(complaints)
    testers_count = max(1, len(testers))
    cluster_target = max(1, min(testers_count, complaints_count, ceil(complaints_count / 4)))

    if complaints_count == 1 or cluster_target == 1:
        labels = np.zeros(complaints_count, dtype=int)
    else:
        kmeans = KMeans(n_clusters=cluster_target, random_state=42, n_init=10)
        labels = kmeans.fit_predict(coords)

    routes = []
    used_tester_ids = set()

    for cluster_index in sorted(set(labels.tolist())):
        cluster_items = [complaints[idx] for idx, label in enumerate(labels) if label == cluster_index]
        ordered_items = nearest_neighbor_order(cluster_items)
        center_lat = sum(float(c.latitude) for c in ordered_items) / len(ordered_items)
        center_lng = sum(float(c.longitude) for c in ordered_items) / len(ordered_items)

        assigned_match = None
        if testers:
            available_testers = [tester for tester in testers if tester.id not in used_tester_ids] or testers
            assigned_match = choose_best_tester_for_point(center_lat, center_lng, available_testers)
            if assigned_match:
                used_tester_ids.add(assigned_match["tester"].id)
                for complaint in ordered_items:
                    complaint.assigned_to = assigned_match["tester"]
                    complaint.status = "assigned"
                    complaint.assigned_at = timezone.now()
                    complaint.save(update_fields=["assigned_to", "status", "assigned_at"])

        ordered_points = [[float(c.latitude), float(c.longitude)] for c in ordered_items]
        road_path = get_road_route_geometry(ordered_points)
        distance_km = compute_path_distance_km(road_path)
        estimated_minutes = max(5, round((distance_km / ROAD_SPEED_KMH) * 60)) if distance_km else max(5, len(ordered_items) * 6)

        routes.append(
            {
                "route_id": f"R{len(routes) + 1:03d}",
                "assigned_tester": assigned_match["tester"].username if assigned_match else None,
                "center": {"lat": round(center_lat, 6), "lng": round(center_lng, 6)},
                "complaints": [
                    {
                        "id": complaint.id,
                        "latitude": float(complaint.latitude),
                        "longitude": float(complaint.longitude),
                        "priority": complaint.priority,
                        "complaint_type": complaint.complaint_type,
                        "fill_level_before": complaint.fill_level_before,
                        "status": complaint.status,
                        "assigned_to_username": complaint.assigned_to.username if complaint.assigned_to else None,
                        "description": complaint.description,
                    }
                    for complaint in ordered_items
                ],
                "total_complaints": len(ordered_items),
                "high_priority": sum(1 for complaint in ordered_items if complaint.priority in {"urgent", "high"}),
                "distance": f"{distance_km:.1f} km",
                "estimated_time": f"{estimated_minutes} min",
                "path": road_path,
            }
        )

    time_saved = min(40, 10 + (len(routes) * 4))
    return {
        "success": True,
        "area": get_area_definition(area_name)["label"],
        "total_clusters": len(routes),
        "total_complaints": complaints_count,
        "time_saved": time_saved,
        "complaints": [
            {
                "id": complaint.id,
                "latitude": float(complaint.latitude),
                "longitude": float(complaint.longitude),
                "priority": complaint.priority,
                "complaint_type": complaint.complaint_type,
                "fill_level_before": complaint.fill_level_before,
                "status": complaint.status,
                "assigned_to_username": complaint.assigned_to.username if complaint.assigned_to else None,
                "description": complaint.description,
            }
            for complaint in complaints
        ],
        "routes": routes,
    }
