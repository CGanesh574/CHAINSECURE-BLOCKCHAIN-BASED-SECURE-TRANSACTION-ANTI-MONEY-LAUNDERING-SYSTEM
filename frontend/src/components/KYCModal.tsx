import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './KYCModal.css';

interface KYCModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const KYCModal: React.FC<KYCModalProps> = ({ onClose, onSuccess }) => {
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [kycStatus, setKycStatus] = useState<any>(null);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await api.get('/api/kyc/status');
      if (response.data.success) {
        setKycStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch KYC status:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setDocumentFile(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentType || !documentNumber || !documentFile) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('documentNumber', documentNumber);
      formData.append('document', documentFile);

      const response = await api.post('/api/kyc/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('KYC document submitted successfully! Awaiting admin approval.');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit KYC document');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'aadhaar': 'Aadhaar Card',
      'pan': 'PAN Card',
      'driving_license': 'Driving License',
      'passport': 'Passport',
      'voter_id': 'Voter ID'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { className: string; text: string } } = {
      'NOT_SUBMITTED': { className: 'status-not-submitted', text: '📝 Not Submitted' },
      'PENDING': { className: 'status-pending', text: '⏳ Pending Review' },
      'APPROVED': { className: 'status-approved', text: '✅ Approved' },
      'REJECTED': { className: 'status-rejected', text: '❌ Rejected' }
    };
    return badges[status] || { className: '', text: status };
  };

  return (
    <div className="kyc-modal-overlay">
      <div className="kyc-modal-content">
        <div className="kyc-modal-header">
          <h2>📄 KYC Verification</h2>
          <button className="kyc-modal-close" onClick={onClose}>×</button>
        </div>

        {kycStatus && (
          <div className="kyc-current-status">
            <div className="status-row">
              <span className="status-label">Current Status:</span>
              <span className={`status-badge ${getStatusBadge(kycStatus.kycStatus).className}`}>
                {getStatusBadge(kycStatus.kycStatus).text}
              </span>
            </div>
            
            {kycStatus.latestSubmission && kycStatus.latestSubmission.status === 'REJECTED' && (
              <div className="rejection-info">
                <strong>Rejection Reason:</strong> {kycStatus.latestSubmission.rejectionReason}
              </div>
            )}

            {kycStatus.kycStatus === 'APPROVED' && (
              <div className="approval-info">
                ✅ Your KYC is approved! You can now perform transactions.
              </div>
            )}

            {kycStatus.kycStatus === 'PENDING' && (
              <div className="pending-info">
                ⏳ Your KYC document is under review. Please wait for admin approval.
              </div>
            )}
          </div>
        )}

        {(kycStatus?.kycStatus === 'NOT_SUBMITTED' || kycStatus?.kycStatus === 'REJECTED') && (
          <form onSubmit={handleSubmit} className="kyc-form">
            {error && <div className="kyc-error-message">{error}</div>}
            {success && <div className="kyc-success-message">{success}</div>}

            <div className="kyc-form-group">
              <label htmlFor="documentType">Government ID Type *</label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">-- Select ID Type --</option>
                <option value="aadhaar">Aadhaar Card</option>
                <option value="pan">PAN Card</option>
                <option value="driving_license">Driving License</option>
                <option value="passport">Passport</option>
                <option value="voter_id">Voter ID</option>
              </select>
            </div>

            <div className="kyc-form-group">
              <label htmlFor="documentNumber">Document Number *</label>
              <input
                type="text"
                id="documentNumber"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Enter document number"
                required
                disabled={loading}
              />
            </div>

            <div className="kyc-form-group">
              <label htmlFor="documentFile">Upload Document Image *</label>
              <input
                type="file"
                id="documentFile"
                accept="image/*"
                onChange={handleFileChange}
                required
                disabled={loading}
              />
              <small>Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</small>
            </div>

            {preview && (
              <div className="kyc-preview">
                <img src={preview} alt="Document preview" />
              </div>
            )}

            <div className="kyc-form-actions">
              <button type="button" className="kyc-btn-cancel" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="kyc-btn-submit" disabled={loading}>
                {loading ? '⏳ Submitting...' : '✓ Submit KYC'}
              </button>
            </div>
          </form>
        )}

        {kycStatus?.kycStatus === 'PENDING' && (
          <div className="kyc-pending-notice">
            <p>Your KYC document has been submitted and is awaiting approval.</p>
            <p>You will be notified once the admin reviews your document.</p>
            <button className="kyc-btn-close" onClick={onClose}>Close</button>
          </div>
        )}

        {kycStatus?.kycStatus === 'APPROVED' && (
          <div className="kyc-approved-notice">
            <p>✅ Your KYC verification is complete!</p>
            <p>You can now perform all transactions securely.</p>
            <button className="kyc-btn-close" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCModal;
