import React from 'react';
import Navbar from '../components/Navbar';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-page">
      <Navbar />
      
      <div className="page-content">
        <div className="container">
          <h1 className="page-title">About ChainSecure</h1>
          
          <div className="about-content">
            <section className="about-section">
              <h2>What is ChainSecure?</h2>
              <p>
                ChainSecure is a next-generation blockchain-based financial platform that combines the security 
                of Ethereum smart contracts with comprehensive compliance and user protection features. Built on 
                decentralized technology, our platform ensures every transaction is immutable, transparent, and 
                verifiable while maintaining the highest standards of financial security.
              </p>
              <p>
                Beyond basic cryptocurrency transactions, ChainSecure integrates advanced KYC verification, 
                real-time AML monitoring, intelligent fraud detection, and a complete support system to provide 
                users with a safe, compliant, and user-friendly experience for managing digital assets. Our mission 
                is to make blockchain technology accessible and trustworthy for everyone.
              </p>
            </section>

            <section className="about-section">
              <h2>Blockchain Technology</h2>
              <p>
                Blockchain is a distributed ledger technology that records transactions across
                multiple computers in a way that makes it nearly impossible to alter retroactively.
                Each transaction is cryptographically signed and verified by the network.
              </p>
              <div className="blockchain-features">
                <div className="blockchain-feature">
                  <h3>🔒 Immutability</h3>
                  <p>Once recorded, transactions cannot be altered or deleted</p>
                </div>
                <div className="blockchain-feature">
                  <h3>🌐 Decentralization</h3>
                  <p>No single point of control or failure</p>
                </div>
                <div className="blockchain-feature">
                  <h3>👁️ Transparency</h3>
                  <p>All transactions are visible and verifiable</p>
                </div>
                <div className="blockchain-feature">
                  <h3>🔐 Security</h3>
                  <p>Cryptographic signatures ensure authenticity</p>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>How It Works</h2>
              <div className="how-it-works">
                <div className="step">
                  <div className="step-number">1</div>
                  <h3>Register & Verify</h3>
                  <p>Create an account and verify your MetaMask wallet ownership</p>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <h3>Connect Wallet</h3>
                  <p>Connect your MetaMask wallet to access the dashboard</p>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <h3>Send Transactions</h3>
                  <p>Send ETH securely to any valid Ethereum address</p>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <h3>Track History</h3>
                  <p>View complete transaction history with all details</p>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>Key Features</h2>
              <ul className="features-list">
                <li>💎 Blockchain-based secure transactions with MetaMask integration</li>
                <li>💎 KYC verification and AML monitoring for compliance</li>
                <li>💎 Real-time fraud detection and automatic account protection</li>
                <li>💎 QR code payments for instant and easy transactions</li>
                <li>💎 Comprehensive admin dashboard for monitoring and management</li>
                <li>💎 24/7 support ticket system with document sharing</li>
              </ul>
            </section>

            <section className="about-section">
              <h2>Our Team</h2>
              <div className="team-section">
                <div className="team-member">
                  <div className="team-member-info">
                    <h3>Buddhapriya Meghana</h3>
                    <p className="team-member-description">A passionate Computer Science Engineer pursuing B.Tech at MGIT, specializing in blockchain technology and secure financial systems.</p>
                  </div>
                </div>
                <div className="team-member">
                  <div className="team-member-info">
                    <h3>Chandapur Ganesh</h3>
                    <p className="team-member-description">A dedicated Computer Science Engineer pursuing B.Tech at MGIT, focused on building innovative blockchain solutions and decentralized applications.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>Technology Stack</h2>
              <div className="tech-stack">
                <div className="tech-category">
                  <h3>Frontend</h3>
                  <ul>
                    <li>React</li>
                    <li>TypeScript</li>
                    <li>MetaMask</li>
                  </ul>
                </div>
                <div className="tech-category">
                  <h3>Backend</h3>
                  <ul>
                    <li>Node.js</li>
                    <li>Express</li>
                    <li>MongoDB</li>
                  </ul>
                </div>
                <div className="tech-category">
                  <h3>Blockchain</h3>
                  <ul>
                    <li>Solidity</li>
                    <li>Ethereum</li>
                    <li>Ganache</li>
                    <li>Smart Contracts</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
