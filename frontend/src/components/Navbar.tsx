import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <img 
              src="/images/chainsecure-logo.png" 
              alt="ChainSecure Logo" 
              className="brand-logo-img"
              width="60"
              height="60"
            />
            <span className="brand-text">ChainSecure</span>
          </Link>

          <div className="navbar-menu">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="navbar-link">Home</Link>
                <Link to="/about" className="navbar-link">About</Link>
                <Link to="/contact" className="navbar-link">Contact</Link>
                <Link to="/login" className="navbar-link navbar-link-primary">Login</Link>
              </>
            ) : (
              <>
                {user?.role === 'admin' ? (
                  <Link to="/admin" className="navbar-link">Admin Dashboard</Link>
                ) : (
                  <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                )}
                <button onClick={handleLogout} className="navbar-link navbar-link-danger">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
