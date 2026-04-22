import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './Auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Login attempt:', { email: formData.email });

    try {
      console.log('📤 Sending login request to:', 'http://localhost:5000/api/auth/login');
      console.log('📧 Email:', formData.email);
      console.log('🔑 Password length:', formData.password.length);
      
      const response = await api.post('/api/auth/login', formData);
      
      console.log('📥 Login response:', response.data);

      if (response.data.success) {
        console.log('✅ Login successful!');
        console.log('👤 User:', response.data.user.name);
        console.log('📧 Email:', response.data.user.email);
        console.log('🎟️ Token received:', response.data.token ? 'Yes' : 'No');
        
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('💾 Saved to localStorage');

        // Redirect based on role
        if (response.data.user.role === 'admin') {
          console.log('🔀 Redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('🔀 Redirecting to user dashboard');
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('❌ Login failed!');
      console.error('Error details:', err);
      console.error('Response data:', err.response?.data);
      console.error('Status code:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      console.error('Error message:', errorMessage);
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Login to your ChainSecure account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Register here
              </Link>
            </p>
          </div>

          <div className="admin-notice">
            <p style={{ marginBottom: '10px' }}>
              <strong>🔐 Test Accounts:</strong>
            </p>
            <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'left' }}>
              <p style={{ margin: '5px 0' }}>
                <strong>Account 1:</strong><br/>
                📧 Email: <code>abc@gmail.com</code><br/>
                🔑 Password: <code>password123</code>
              </p>
              <p style={{ margin: '15px 0 5px 0' }}>
                <strong>Account 2:</strong><br/>
                📧 Email: <code>bob@gmail.com</code><br/>
                🔑 Password: <code>password123</code>
              </p>
              <p style={{ margin: '15px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                💡 Open browser console (F12) to see detailed login logs
              </p>
            </div>
          </div>
          
          <div className="admin-notice" style={{ marginTop: '15px' }}>
            <p>
              <strong>Admin Login:</strong> admin@chainsecure.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
