import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <Navbar />
      
      <div className="hero-section">
        <div className="hero-background">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <h1 className="hero-title">
                Welcome to <span className="gradient-text">ChainSecure</span>
              </h1>
              <p className="hero-subtitle">
                Blockchain Based Secure Transaction and Anti Money Laundering System
              </p>
              <p className="hero-description">
                Experience the future of secure digital transactions with our cutting-edge
                blockchain technology, providing immutable, transparent, and
                decentralized transaction management powered by Ethereum.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary btn-large">
                  <span>Get Started</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 3L14 10L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link to="/about" className="btn btn-secondary btn-large">
                  <span>Learn More</span>
                </Link>
              </div>
            </div>
            
            <div className="hero-illustration">
              <img 
                src="/images/chainsecure-logo.png" 
                alt="ChainSecure Blockchain & AML Solutions" 
                className="hero-main-image"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <div className="hero-images">
            <div className="banking-image-grid">
              <div className="banking-card card-primary">
                <div className="card-icon">💳</div>
                <h4>Secure Payments</h4>
                <p>Encrypted transactions</p>
              </div>
              <div className="banking-card card-secondary">
                <div className="card-icon">🏦</div>
                <h4>Banking Grade</h4>
                <p>Enterprise security</p>
              </div>
              <div className="banking-card card-accent">
                <div className="card-icon">💰</div>
                <h4>Money Transfer</h4>
                <p>Instant settlements</p>
              </div>
              <div className="banking-card card-warning">
                <div className="card-icon">🛡️</div>
                <h4>AML Protection</h4>
                <p>Fraud prevention</p>
              </div>
            </div>
            
            <div className="finance-illustration">
              <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Bank Building */}
                <rect x="100" y="60" width="100" height="80" fill="white" stroke="#667eea" strokeWidth="2"/>
                <rect x="110" y="50" width="80" height="10" fill="#667eea"/>
                <circle cx="150" cy="90" r="8" fill="#764ba2"/>
                <rect x="115" y="105" width="15" height="20" fill="#667eea" opacity="0.3"/>
                <rect x="142.5" y="105" width="15" height="20" fill="#667eea" opacity="0.3"/>
                <rect x="170" y="105" width="15" height="20" fill="#667eea" opacity="0.3"/>
                <rect x="90" y="140" width="120" height="5" fill="#764ba2"/>
                
                {/* Money Coins */}
                <circle cx="50" cy="100" r="20" fill="#FFD700" opacity="0.9"/>
                <circle cx="50" cy="100" r="15" fill="none" stroke="#DAA520" strokeWidth="2"/>
                <text x="50" y="105" textAnchor="middle" fill="#DAA520" fontSize="16" fontWeight="bold">$</text>
                
                <circle cx="250" cy="100" r="20" fill="#FFD700" opacity="0.9"/>
                <circle cx="250" cy="100" r="15" fill="none" stroke="#DAA520" strokeWidth="2"/>
                <text x="250" y="105" textAnchor="middle" fill="#DAA520" fontSize="16" fontWeight="bold">$</text>
                
                {/* Shield */}
                <path d="M150 160 L150 180 L165 185 L165 165 Z" fill="#667eea" opacity="0.7"/>
                <path d="M150 160 L150 180 L135 185 L135 165 Z" fill="#764ba2" opacity="0.7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose ChainSecure?</h2>
            <p className="section-subtitle">Built with cutting-edge blockchain technology for maximum security</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🔒</div>
              </div>
              <h3>Secure Transactions</h3>
              <p>
                All transactions are secured using blockchain technology and
                cryptographic signatures, ensuring maximum security.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">⛓️</div>
              </div>
              <h3>Blockchain Powered</h3>
              <p>
                Built on Ethereum blockchain for immutable and transparent
                transaction records that can never be altered.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">👛</div>
              </div>
              <h3>MetaMask Integration</h3>
              <p>
                Seamlessly connect your MetaMask wallet for easy and secure
                transaction management.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">📊</div>
              </div>
              <h3>Transaction History</h3>
              <p>
                View complete transaction history with detailed information
                including sender, receiver, amount, and timestamps.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">⚡</div>
              </div>
              <h3>Fast & Efficient</h3>
              <p>
                Lightning-fast transactions with real-time balance updates
                and instant confirmations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🛡️</div>
              </div>
              <h3>AML Compliance</h3>
              <p>
                Advanced AML monitoring system to detect and prevent
                suspicious transaction patterns.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get started in 3 simple steps</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Register and complete KYC verification to get started with ChainSecure</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Connect Wallet</h3>
              <p>Link your MetaMask wallet securely to your ChainSecure account</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Start Transacting</h3>
              <p>Send and receive secure blockchain transactions instantly</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of users who trust ChainSecure for secure transactions</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Create Account
          </Link>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 ChainSecure. All rights reserved.</p>
          <p>Blockchain-Based Secure Transaction System</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
