import React from 'react';

const ComplaintList = ({ complaints, onStatusUpdate }) => {
  const formatLabel = (value) => value.replace(/_/g, ' ');

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffa502',
      'assigned': '#1e90ff',
      'pending_review': '#8b5cf6',
      'completed': '#2ed573',
      'rejected': '#ff4757'
    };
    return colors[status] || '#747d8c';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': '#ff4757',
      'high': '#ffa502',
      'medium': '#ff6348',
      'low': '#2ed573'
    };
    return colors[priority] || '#747d8c';
  };

  return (
    <div className="complaint-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Location</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map(complaint => (
            <tr key={complaint.id}>
              <td>#{complaint.id}</td>
              <td>{complaint.complaint_type}</td>
              <td>
                <span 
                  className="priority-badge" 
                  style={{ backgroundColor: getPriorityColor(complaint.priority) }}
                >
                  {formatLabel(complaint.priority)}
                </span>
              </td>
              <td>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(complaint.status) }}
                >
                  {formatLabel(complaint.status)}
                </span>
              </td>
              <td>
                <small>
                  {Number(complaint.latitude).toFixed(4)}, {Number(complaint.longitude).toFixed(4)}
                </small>
              </td>
              <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
              <td>
                {onStatusUpdate && (
                  <select 
                    onChange={(e) => onStatusUpdate(complaint.id, e.target.value)}
                    value={complaint.status}
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintList;
