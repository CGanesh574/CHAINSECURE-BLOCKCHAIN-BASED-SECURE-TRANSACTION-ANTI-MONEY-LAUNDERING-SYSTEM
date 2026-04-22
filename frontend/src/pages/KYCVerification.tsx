import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './KYCVerification.css';

interface KYCStatus {
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const KYCVerification: React.FC = () => {
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState('aadhaar');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await api.get('/api/kyc/status');
      console.log('📊 KYC Status Response:', response.data);
      
      // Check if latestSubmission exists and has data
      if (response.data.latestSubmission) {
        setKycStatus({
          status: response.data.latestSubmission.status,
          submittedAt: response.data.latestSubmission.submittedAt,
          reviewedAt: response.data.latestSubmission.reviewedAt,
          rejectionReason: response.data.latestSubmission.rejectionReason
        });
      } else {
        // No submission yet
        setKycStatus({ status: 'NOT_SUBMITTED' });
      }
    } catch (err: any) {
      console.error('Error fetching KYC status:', err);
      setKycStatus({ status: 'NOT_SUBMITTED' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG, and PDF files are allowed');
        return;
      }

      setError('');
      setDocumentFile(file);
      
      // Only show preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, just show filename
        setPreview('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!documentFile) {
      setError('Please select a document to upload');
      return;
    }

    if (!documentNumber.trim()) {
      setError('Please enter document number');
      return;
    }

    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('documentNumber', documentNumber);
    formData.append('document', documentFile);

    setLoading(true);

    try {
      console.log('📤 Submitting KYC...');
      console.log('Document Type:', documentType);
      console.log('Document Number:', documentNumber);
      console.log('File:', documentFile.name, documentFile.type, documentFile.size);
      
      // Don't set Content-Type header - let browser set it with boundary
      const response = await api.post('/api/kyc/submit', formData);

      console.log('✅ KYC submitted successfully:', response.data);
      setMessage(response.data.message || 'KYC submitted successfully!');
      setDocumentNumber('');
      setDocumentFile(null);
      setPreview('');
      
      // Refresh KYC status
      await fetchKYCStatus();
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('❌ KYC submission failed:', err);
      console.error('Response:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit KYC. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { class: string; text: string } } = {
      NOT_SUBMITTED: { class: 'status-not-submitted', text: 'Not Submitted' },
      PENDING: { class: 'status-pending', text: 'Under Review' },
      APPROVED: { class: 'status-approved', text: 'Approved ✓' },
      REJECTED: { class: 'status-rejected', text: 'Rejected ✗' },
    };
    return badges[status] || badges.NOT_SUBMITTED;
  };

  const statusBadge = kycStatus ? getStatusBadge(kycStatus.status) : null;

  return (
    <div className="kyc-verification-page">
      {/* Navigation Header */}
      <div className="dashboard-header">
        <div className="dashboard-nav">
          <button className="nav-tab" onClick={() => navigate('/user-dashboard')}>🏠 Dashboard</button>
          <button className="nav-tab active">📄 KYC Verification</button>
          <button className="nav-tab" onClick={() => navigate('/support-center')}>❓ Support Center</button>
        </div>
      </div>

      <div className="kyc-container">
        <div className="kyc-header">
          <h1>KYC Verification</h1>
          <p>Complete your identity verification to unlock all features</p>
        </div>

        {kycStatus && (
          <div className="kyc-status-card" style={{
            background: kycStatus.status === 'APPROVED' ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' : 
                       kycStatus.status === 'PENDING' ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)' :
                       kycStatus.status === 'REJECTED' ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' :
                       'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
            color: 'white',
            padding: '30px',
            borderRadius: '12px',
            marginBottom: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem', fontWeight: '600' }}>Current Status</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '15px' }}>
              {kycStatus.status === 'APPROVED' && '✅ Verified & Approved'}
              {kycStatus.status === 'PENDING' && '⏳ Under Review'}
              {kycStatus.status === 'REJECTED' && '❌ Rejected'}
              {(!kycStatus.status || kycStatus.status === 'NOT_SUBMITTED') && '📄 Not Submitted'}
            </div>
            
            {kycStatus.status === 'PENDING' && (
              <div style={{ fontSize: '1rem', lineHeight: '1.6', opacity: 0.95 }}>
                <p style={{ margin: '0 0 10px 0' }}>
                  <strong>🔍 Status:</strong> Your KYC document is currently being reviewed by our team.
                </p>
                <p style={{ margin: '0 0 10px 0' }}>
                  <strong>📅 Submitted:</strong> {kycStatus.submittedAt ? new Date(kycStatus.submittedAt).toLocaleString() : 'N/A'}
                </p>
                <p style={{ margin: '0', fontSize: '0.95rem', opacity: 0.9 }}>
                  ℹ️ You'll be notified once your verification is complete. This usually takes 24-48 hours.
                </p>
              </div>
            )}
            
            {kycStatus.status === 'APPROVED' && (
              <div style={{ fontSize: '1rem', lineHeight: '1.6', opacity: 0.95 }}>
                <p style={{ margin: '0 0 10px 0' }}>
                  <strong>🎉 Congratulations!</strong> Your identity has been verified successfully.
                </p>
                <p style={{ margin: '0 0 10px 0' }}>
                  <strong>✅ Verified On:</strong> {kycStatus.reviewedAt ? new Date(kycStatus.reviewedAt).toLocaleString() : 'N/A'}
                </p>
                <p style={{ margin: '0', fontSize: '0.95rem', opacity: 0.9 }}>
                  💼 You now have full access to all platform features including sending and receiving funds.
                </p>
              </div>
            )}
            
            {kycStatus.status === 'REJECTED' && (
              <div style={{ fontSize: '1rem', lineHeight: '1.6', opacity: 0.95 }}>
                <p style={{ margin: '0 0 10px 0' }}>
                  <strong>⚠️ Your KYC submission was rejected.</strong> Please review the reason below and resubmit with correct documents.
                </p>
                {kycStatus.rejectionReason && (
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}>
                    <strong>📋 Rejection Reason:</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '1.05rem' }}>{kycStatus.rejectionReason}</p>
                  </div>
                )}
                <p style={{ margin: '10px 0 0 0', fontSize: '0.95rem', opacity: 0.9 }}>
                  🔄 Please submit your documents again with the corrections mentioned above.
                </p>
              </div>
            )}
          </div>
        )}

        {(!kycStatus || !kycStatus.status || kycStatus.status === 'NOT_SUBMITTED' || kycStatus.status === 'REJECTED') && (
          <div className="kyc-form-card">
            <h2>{kycStatus?.status === 'REJECTED' ? '🔄 Resubmit KYC Document' : 'Submit KYC Document'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="documentType">Document Type *</label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="driving_license">Driving License</option>
                  <option value="passport">Passport</option>
                  <option value="voter_id">Voter ID</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="documentNumber">Document Number *</label>
                <input
                  type="text"
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="form-control"
                  placeholder="Enter your document number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="documentFile">Upload Document (Image or PDF) *</label>
                <input
                  type="file"
                  id="documentFile"
                  onChange={handleFileChange}
                  className="form-control"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  required
                />
                <small className="form-text">
                  ✓ Accepted: JPG, PNG, PDF | Max Size: 5MB
                </small>
              </div>

              {(preview || documentFile) && (
                <div className="preview-container">
                  <h4>Document Preview:</h4>
                  {preview ? (
                    <img src={preview} alt="Document preview" className="document-preview" />
                  ) : documentFile?.type === 'application/pdf' ? (
                    <div className="pdf-preview">
                      <div className="pdf-icon">📄</div>
                      <p><strong>{documentFile.name}</strong></p>
                      <p className="file-size">{(documentFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : null}
                </div>
              )}

              {error && <div className="alert alert-error">{error}</div>}
              {message && <div className="alert alert-success">{message}</div>}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/user-dashboard')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit KYC'}
                </button>
              </div>
            </form>
          </div>
        )}

        {kycStatus?.status === 'PENDING' && (
          <div className="kyc-info-card">
            <h3>What happens next?</h3>
            <ul>
              <li>Our team will review your document within 24-48 hours</li>
              <li>You'll receive a notification once the review is complete</li>
              <li>If approved, you can start making transactions immediately</li>
              <li>If rejected, you can resubmit with correct documents</li>
            </ul>
          </div>
        )}

        {kycStatus?.status === 'APPROVED' && (
          <div className="kyc-info-card success-card">
            <h3>✓ Verification Complete</h3>
            <p>Your account is fully verified. You can now:</p>
            <ul>
              <li>Send and receive funds without limits</li>
              <li>Access all platform features</li>
              <li>Participate in secure blockchain transactions</li>
            </ul>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/user-dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCVerification;
