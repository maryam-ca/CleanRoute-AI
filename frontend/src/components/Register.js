import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    phone_number: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getErrorMessage = (err) => {
    const data = err.response?.data;

    if (!data) {
      return 'Registration failed';
    }

    if (typeof data === 'string') {
      return data;
    }

    if (data.message) {
      return data.message;
    }

    const firstError = Object.values(data)[0];
    return Array.isArray(firstError) ? firstError[0] : 'Registration failed';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone_number: formData.phone_number
      });
      
      // Auto login after registration
      const loginResponse = await authAPI.login(formData.username, formData.password);
      
      localStorage.setItem('access_token', loginResponse.data.access);
      localStorage.setItem('refresh_token', loginResponse.data.refresh);
      localStorage.setItem('user_role', formData.role);
      window.dispatchEvent(new Event('auth-change'));
      
      // Redirect based on role
      if (formData.role === 'citizen') {
        navigate('/citizen');
      } else {
        navigate('/authority');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container auth-page">
      <div className="auth-showcase">
        <span className="eyebrow">City Operations</span>
        <h1>Create a workspace for citizens and waste management teams.</h1>
        <p>
          Register as a citizen to report issues or as an authority user to monitor trends,
          optimize routes, and respond faster.
        </p>
        <div className="auth-highlights">
          <span className="highlight-pill">Citizen reporting</span>
          <span className="highlight-pill">Authority dashboard</span>
          <span className="highlight-pill">AI-assisted routing</span>
        </div>
      </div>
      <div className="register-card auth-card">
        <span className="eyebrow">Get Started</span>
        <h2>Create Account</h2>
        <p className="helper-text">Use a strong password so your dashboard and reports stay secure.</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="tel"
              name="phone_number"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="citizen">Citizen</option>
              <option value="authority">Authority</option>
            </select>
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link className="text-link" to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
