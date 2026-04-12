import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RouteMap = ({ complaints, route }) => {
  const [center, setCenter] = useState([24.8607, 67.0011]); // Default Karachi coordinates

  useEffect(() => {
    if (complaints && complaints.length > 0) {
      const avgLat = complaints.reduce((sum, c) => sum + parseFloat(c.latitude), 0) / complaints.length;
      const avgLng = complaints.reduce((sum, c) => sum + parseFloat(c.longitude), 0) / complaints.length;
      setCenter([avgLat, avgLng]);
    }
  }, [complaints]);

  const getMarkerColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'green';
    }
  };

  return (
    <div className="route-map">
      <MapContainer center={center} zoom={12} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {complaints && complaints.map(complaint => (
          <Marker 
            key={complaint.id} 
            position={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}
          >
            <Popup>
              <div>
                <strong>Complaint #{complaint.id}</strong><br />
                Type: {complaint.complaint_type}<br />
                Priority: {complaint.priority}<br />
                Status: {complaint.status}<br />
                <small>{complaint.description}</small>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {route && route.points && (
          <Polyline 
            positions={route.points.map(p => [p[0], p[1]])} 
            color="blue" 
            weight={3}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default RouteMap;