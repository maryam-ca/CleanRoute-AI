"""
CleanRoute-AI - Complete Statistics Audit Script
Checks: Total Complaints, Pending, Assigned, Completed
Per Tester: Workload distribution
Route Optimization: Cluster distribution
Ensures all figures match
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from complaints.models import Complaint
from django.contrib.auth.models import User
from sklearn.cluster import KMeans
import numpy as np

print("=" * 70)
print("📊 CLEANROUTE-AI COMPLETE STATISTICS AUDIT")
print("=" * 70)

# ============================================
# 1. OVERALL COMPLAINT STATISTICS
# ============================================
print("\n" + "=" * 70)
print("📈 1. OVERALL COMPLAINT STATISTICS")
print("=" * 70)

total_complaints = Complaint.objects.count()
pending_count = Complaint.objects.filter(status='pending').count()
assigned_count = Complaint.objects.filter(status='assigned').count()
completed_count = Complaint.objects.filter(status='completed').count()

print(f"\n📊 Total Complaints: {total_complaints}")
print(f"   ├── Pending: {pending_count}")
print(f"   ├── Assigned: {assigned_count}")
print(f"   └── Completed: {completed_count}")
print(f"\n   ✅ Sum Check: Pending + Assigned + Completed = {pending_count + assigned_count + completed_count}")
print(f"   {'✅ MATCHES' if (pending_count + assigned_count + completed_count) == total_complaints else '❌ MISMATCH'} total complaints")

# ============================================
# 2. TESTER WORKLOAD DISTRIBUTION
# ============================================
print("\n" + "=" * 70)
print("👥 2. TESTER WORKLOAD DISTRIBUTION")
print("=" * 70)

testers = User.objects.filter(username__startswith='tester').order_by('id')
tester_workload = []
total_tester_assigned = 0

print(f"\n📊 Tester Workload Summary:")
print("-" * 50)

for tester in testers:
    assigned_to_tester = Complaint.objects.filter(assigned_to=tester, status='assigned').count()
    completed_by_tester = Complaint.objects.filter(assigned_to=tester, status='completed').count()
    total_by_tester = assigned_to_tester + completed_by_tester
    
    tester_workload.append({
        'username': tester.username,
        'assigned': assigned_to_tester,
        'completed': completed_by_tester,
        'total': total_by_tester
    })
    total_tester_assigned += assigned_to_tester
    
    print(f"   {tester.username}:")
    print(f"      Assigned: {assigned_to_tester}")
    print(f"      Completed: {completed_by_tester}")
    print(f"      Total: {total_by_tester}")

print(f"\n   📊 Total Assigned across all testers: {total_tester_assigned}")
print(f"   {'✅ MATCHES' if total_tester_assigned == assigned_count else '❌ MISMATCH'} overall assigned count ({assigned_count})")

# ============================================
# 3. ROUTE OPTIMIZATION CLUSTER ANALYSIS
# ============================================
print("\n" + "=" * 70)
print("🗺️ 3. ROUTE OPTIMIZATION CLUSTER ANALYSIS")
print("=" * 70)

# Get all active complaints (not completed)
active_complaints = Complaint.objects.filter(
    latitude__isnull=False, 
    longitude__isnull=False
).exclude(status='completed')

active_count = active_complaints.count()
print(f"\n📊 Active Complaints for Route Optimization: {active_count}")

if active_count >= 2:
    # Extract coordinates
    coords = []
    valid_complaints = []
    for c in active_complaints:
        if c.latitude and c.longitude:
            coords.append([c.latitude, c.longitude])
            valid_complaints.append(c)
    
    # Determine number of clusters
    n_clusters = min(5, max(2, len(coords) // 3 + 1))
    
    # Perform K-Means clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(coords)
    
    # Show cluster distribution
    print(f"\n📊 K-Means Cluster Distribution ({n_clusters} clusters):")
    print("-" * 50)
    
    cluster_sizes = {}
    route_complaints = {}
    
    for i in range(n_clusters):
        cluster_indices = np.where(labels == i)[0]
        cluster_complaints = [valid_complaints[idx] for idx in cluster_indices]
        cluster_size = len(cluster_complaints)
        cluster_sizes[i] = cluster_size
        route_complaints[i] = [c.id for c in cluster_complaints]
        
        print(f"   Route {i+1} (Cluster {i+1}): {cluster_size} complaints")
        print(f"      Complaint IDs: {route_complaints[i]}")
    
    total_in_clusters = sum(cluster_sizes.values())
    print(f"\n   📊 Total complaints in clusters: {total_in_clusters}")
    print(f"   {'✅ MATCHES' if total_in_clusters == active_count else '❌ MISMATCH'} active complaints ({active_count})")
    
    # Map clusters to testers
    testers_list = list(testers)
    print(f"\n📊 Recommended Tester Assignment based on Clusters:")
    print("-" * 50)
    
    for i in range(n_clusters):
        tester_idx = i % len(testers_list)
        tester = testers_list[tester_idx]
        print(f"   Route {i+1} ({cluster_sizes[i]} complaints) → {tester.username}")
else:
    print("   Not enough complaints for clustering")

# ============================================
# 4. VERIFICATION SUMMARY
# ============================================
print("\n" + "=" * 70)
print("✅ 4. VERIFICATION SUMMARY")
print("=" * 70)

# Check for orphans (complaints assigned to non-existent testers)
print("\n📊 Data Integrity Checks:")
orphans = Complaint.objects.filter(assigned_to__isnull=False, status='assigned').exclude(assigned_to__in=testers)
if orphans.exists():
    print(f"   ⚠️ Orphan complaints (assigned to deleted testers): {orphans.count()}")
else:
    print(f"   ✅ No orphan complaints found")

# Check for complaints without coordinates
no_coords = Complaint.objects.filter(latitude__isnull=True, longitude__isnull=True)
if no_coords.exists():
    print(f"   ⚠️ Complaints without coordinates: {no_coords.count()}")
else:
    print(f"   ✅ All complaints have coordinates")

# Check for duplicates
all_ids = [c.id for c in Complaint.objects.all()]
unique_ids = set(all_ids)
if len(all_ids) == len(unique_ids):
    print(f"   ✅ No duplicate complaint IDs")
else:
    print(f"   ⚠️ Duplicate complaint IDs found!")

# ============================================
# 5. FINAL SUMMARY TABLE
# ============================================
print("\n" + "=" * 70)
print("📋 5. FINAL SUMMARY TABLE")
print("=" * 70)

print(f"""
┌─────────────────────────────────────────────────────────────────────┐
│                    CLEANROUTE-AI STATISTICS                         │
├─────────────────────────────────────────────────────────────────────┤
│  Total Complaints:        {total_complaints:>5}                                    │
│  ├── Pending:             {pending_count:>5}                                    │
│  ├── Assigned:            {assigned_count:>5}                                    │
│  └── Completed:           {completed_count:>5}                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Tester Workload:                                                   │
""")

for tw in tester_workload:
    print(f"  │  {tw['username']:8}  Assigned: {tw['assigned']:>2}  Completed: {tw['completed']:>2}  Total: {tw['total']:>2}                    │")

print(f"""
├─────────────────────────────────────────────────────────────────────┤
│  Route Clusters:          {n_clusters if active_count >= 2 else 'N/A':>5}                                    │
│  Active for Routes:       {active_count:>5}                                    │
├─────────────────────────────────────────────────────────────────────┤
│  STATUS:                 {'✅ ALL MATCHES' if total_tester_assigned == assigned_count else '❌ MISMATCH'}                             │
└─────────────────────────────────────────────────────────────────────┘
""")

print("\n" + "=" * 70)
print("✅ AUDIT COMPLETE!")
print("=" * 70)
