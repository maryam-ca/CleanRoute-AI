import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { authHeaders } from '../services/api';

const CitizenDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    assigned: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatLabel = (value) => value.replace(/_/g, ' ');

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      const response = await api.get('/complaints/', {
        headers: authHeaders()
      });
      
      const complaintsData = response.data;
      setComplaints(complaintsData);
      
      // Calculate stats
      const pending = complaintsData.filter(c => c.status === 'pending').length;
      const completed = complaintsData.filter(c => c.status === 'completed').length;
      const assigned = complaintsData.filter(c => c.status === 'assigned').length;
      
      setStats({
        total: complaintsData.length,
        pending,
        completed,
        assigned
      });
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ffa502';
      case 'assigned': return '#1e90ff';
      case 'completed': return '#2ed573';
      case 'pending_review': return '#8b5cf6';
      case 'rejected': return '#ff4757';
      default: return '#747d8c';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ffa502';
      case 'medium': return '#ff6348';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading your complaints...</div>;
  }

  return (
    <div className="citizen-dashboard page-shell">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span className="eyebrow">Citizen Dashboard</span>
          <h1>Your Complaint Overview</h1>
          <p>Track every waste report, monitor its status, and raise a new complaint in a few clicks.</p>
        </div>
        <div className="header-buttons">
          <button onClick={() => navigate('/submit-complaint')} className="btn-primary">
            + New Complaint
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Complaints</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number pending">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3>Assigned</h3>
          <p className="stat-number in-progress">{stats.assigned}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number resolved">{stats.completed}</p>
        </div>
      </div>

      <div className="complaints-section">
        <h2>My Complaints</h2>
        {complaints.length === 0 ? (
          <div className="no-complaints">
            <p>You haven't submitted any complaints yet.</p>
            <button onClick={() => navigate('/submit-complaint')} className="btn-primary">
              Submit Your First Complaint
            </button>
          </div>
        ) : (
          <div className="complaints-grid">
            {complaints.map(complaint => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-header">
                  <span className="complaint-id">#{complaint.id}</span>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(complaint.status) }}
                  >
                    {formatLabel(complaint.status)}
                  </span>
                </div>
                
                <div className="complaint-type">
                  <strong>Type:</strong> {formatLabel(complaint.complaint_type)}
                </div>
                
                <div className="complaint-priority">
                  <strong>Priority:</strong>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(complaint.priority) }}
                  >
                    {formatLabel(complaint.priority)}
                  </span>
                </div>
                
                <div className="complaint-description">
                  <strong>Description:</strong>
                  <p>{complaint.description}</p>
                </div>
                
                <div className="complaint-location">
                  <strong>Location:</strong>
                  <p>Lat: {complaint.latitude}, Lng: {complaint.longitude}</p>
                </div>
                
                <div className="complaint-date">
                  <strong>Submitted:</strong>
                  <p>{new Date(complaint.created_at).toLocaleString()}</p>
                </div>
                
                {complaint.ml_confidence > 0 && (
                  <div className="ml-confidence">
                    <strong>AI Confidence:</strong>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{ width: `${complaint.ml_confidence * 100}%` }}
                      />
                    </div>
                    <span>{(complaint.ml_confidence * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
