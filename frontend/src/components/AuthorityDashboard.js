import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import api, { authHeaders } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#5a4332',
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#7a5b46',
      },
      grid: {
        color: 'rgba(141, 103, 77, 0.12)',
      },
    },
    y: {
      ticks: {
        color: '#7a5b46',
      },
      grid: {
        color: 'rgba(141, 103, 77, 0.12)',
      },
    },
  },
};

const AuthorityDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [routes, setRoutes] = useState(null);
  const [routeMessage, setRouteMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatLabel = (value) => value.replace(/_/g, ' ');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, complaintsRes, predictionsRes] = await Promise.all([
        api.get('/complaints/dashboard_stats/', { headers: authHeaders() }),
        api.get('/complaints/', { headers: authHeaders() }),
        api.get('/predict-waste/?area=Central&days=7', { headers: authHeaders() })
      ]);
      
      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
      setPredictions(predictionsRes.data.predictions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizeRoutes = async () => {
    try {
      setRouteMessage(null);
      const response = await api.post('/optimize-routes/', {}, { headers: authHeaders() });
      setRoutes(response.data);
      setRouteMessage({ type: 'success', text: 'Routes optimized successfully for the latest pending complaints.' });
    } catch (error) {
      setRouteMessage({
        type: 'error',
        text: error.response?.data?.error || 'Unable to optimize routes right now.',
      });
      console.error('Error optimizing routes:', error);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const wasteTrendData = {
    labels: predictions.map(p => p.date),
    datasets: [
      {
        label: 'Predicted Waste (kg)',
        data: predictions.map(p => p.predicted_waste_kg),
        borderColor: '#7b4f31',
        backgroundColor: 'rgba(123, 79, 49, 0.16)',
        fill: true,
        tension: 0.28
      }
    ]
  };

  const complaintsByTypeData = {
    labels: stats?.complaints_by_type.map(item => item.complaint_type) || [],
    datasets: [
      {
        label: 'Number of Complaints',
        data: stats?.complaints_by_type.map(item => item.count) || [],
        backgroundColor: ['#8f5c3f', '#b98158', '#d3a278', '#efd7c2', '#6a422b'],
        borderRadius: 10
      }
    ]
  };

  const priorityData = {
    labels: stats?.complaints_by_priority.map(item => item.priority) || [],
    datasets: [
      {
        data: stats?.complaints_by_priority.map(item => item.count) || [],
        backgroundColor: ['#8c3f2e', '#c27c3d', '#d39a5d', '#7ea36d']
      }
    ]
  };

  return (
    <div className="authority-dashboard page-shell">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span className="eyebrow">Authority Dashboard</span>
          <h1>Waste Operations Command Center</h1>
          <p>Monitor complaint trends, review priority distribution, and trigger smarter collection routes.</p>
        </div>
        <div className="header-buttons">
          <button onClick={optimizeRoutes} className="optimize-btn">
            Optimize Collection Routes
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Complaints</h3>
          <p className="stat-number">{stats?.total_complaints}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number pending">{stats?.pending_complaints}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number resolved">{stats?.completed_complaints ?? stats?.resolved_complaints}</p>
        </div>
        <div className="stat-card">
          <h3>Urgent</h3>
          <p className="stat-number urgent">{stats?.urgent_complaints}</p>
        </div>
        <div className="stat-card">
          <h3>Resolution Rate</h3>
          <p className="stat-number">{(stats?.resolution_rate ?? 0).toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-card">
          <h3>Waste Prediction Trend (Next 7 Days)</h3>
          <div className="chart-frame">
            <Line data={wasteTrendData} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Complaints by Type</h3>
          <div className="chart-frame">
            <Bar data={complaintsByTypeData} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Priority Distribution</h3>
          <div className="chart-frame">
            <Doughnut
              data={priorityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: '#5a4332',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="route-optimization">
        {routeMessage && <div className={`message ${routeMessage.type}`}>{routeMessage.text}</div>}
        
        {routes && (
          <div className="routes-result">
            <h3>Optimized Routes</h3>
            <p>Total Clusters: {routes.total_clusters}</p>
            <p>Total Complaints: {routes.total_complaints}</p>
            <div className="routes-list">
              {routes.routes.map((route, idx) => (
                <div key={idx} className="route-card">
                  <h4>Route {route.cluster_id + 1}</h4>
                  <p>Stops: {route.num_stops}</p>
                  <p>Distance: {route.distance_km.toFixed(2)} km</p>
                  <p>Est. Time: {route.estimated_time} minutes</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!routes && (
          <div className="route-empty-state">
            <p>Use the route optimizer to group pending complaints into cleaner collection runs.</p>
          </div>
        )}
      </div>
      
      <div className="complaints-list">
        <h3>Recent Complaints</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {complaints.slice(0, 10).map(complaint => (
              <tr key={complaint.id}>
                <td>{complaint.id}</td>
                <td>{formatLabel(complaint.complaint_type)}</td>
                <td className={`priority-${complaint.priority}`}>{formatLabel(complaint.priority)}</td>
                <td>{formatLabel(complaint.status)}</td>
                <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
