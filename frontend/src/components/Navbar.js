import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('user_role');
  const token = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  if (!token) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate(userRole === 'citizen' ? '/citizen' : '/authority')}>
        <span className="nav-badge">Brown Theme</span>
        <div className="nav-brand-copy">
          <h2>CleanRoute-AI</h2>
          <p>{userRole === 'citizen' ? 'Citizen Workspace' : 'Authority Workspace'}</p>
        </div>
      </div>
      
      <div className="nav-links">
        {userRole === 'citizen' && (
          <>
            <button type="button" className="nav-action" onClick={() => navigate('/citizen')}>Dashboard</button>
            <button type="button" className="nav-action" onClick={() => navigate('/submit-complaint')}>New Complaint</button>
          </>
        )}
        
        {userRole === 'authority' && (
          <>
            <button type="button" className="nav-action" onClick={() => navigate('/authority')}>Dashboard</button>
          </>
        )}
        
        <button type="button" onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
