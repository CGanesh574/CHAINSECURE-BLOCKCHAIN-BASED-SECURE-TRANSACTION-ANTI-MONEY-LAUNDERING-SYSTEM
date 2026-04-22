import React from 'react';
import './ProfileModal.css';

interface User {
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  walletAddress?: string;
  createdAt?: string;
}

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="modal-overlay">
      <div className="profile-modal-content">
        <div className="profile-modal-header">
          <h2>👤 User Profile</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="profile-modal-body">
          {/* Profile Avatar */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {getInitials(user.name)}
            </div>
            <h3 className="profile-name">{user.name}</h3>
            <p className="profile-email">{user.email}</p>
          </div>

          {/* Profile Information */}
          <div className="profile-info-section">
            <div className="profile-info-item">
              <span className="info-label">📧 Email</span>
              <div className="info-value-with-copy">
                <span className="info-value">{user.email}</span>
                <button 
                  className="copy-btn" 
                  onClick={() => copyToClipboard(user.email)}
                  title="Copy email"
                >
                  📋
                </button>
              </div>
            </div>

            {user.phone && (
              <div className="profile-info-item">
                <span className="info-label">📱 Phone</span>
                <div className="info-value-with-copy">
                  <span className="info-value">{user.phone}</span>
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(user.phone!)}
                    title="Copy phone"
                  >
                    📋
                  </button>
                </div>
              </div>
            )}

            <div className="profile-info-grid">
              {user.age && (
                <div className="profile-info-item-small">
                  <span className="info-label">🎂 Age</span>
                  <span className="info-value">{user.age} years</span>
                </div>
              )}

              {user.gender && (
                <div className="profile-info-item-small">
                  <span className="info-label">⚧ Gender</span>
                  <span className="info-value">{user.gender}</span>
                </div>
              )}
            </div>

            {user.walletAddress && (
              <div className="profile-info-item">
                <span className="info-label">💳 Registered Wallet</span>
                <div className="info-value-with-copy">
                  <span className="info-value wallet-address">{user.walletAddress}</span>
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(user.walletAddress!)}
                    title="Copy wallet address"
                  >
                    📋
                  </button>
                </div>
              </div>
            )}

            {user.createdAt && (
              <div className="profile-info-item">
                <span className="info-label">📅 Member Since</span>
                <span className="info-value">{formatDate(user.createdAt)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <button className="profile-action-btn edit-profile-btn">
              ✏️ Edit Profile
            </button>
            <button className="profile-action-btn change-password-btn">
              🔐 Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
