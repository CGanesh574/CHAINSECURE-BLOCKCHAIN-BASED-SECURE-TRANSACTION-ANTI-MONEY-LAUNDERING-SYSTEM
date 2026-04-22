import React, { useState, useEffect } from 'react';
import { sendTransaction } from '../services/web3';
import api from '../services/api';
import './SendMoneyModal.css';

interface SendMoneyModalProps {
  userWallet: string;
  onClose: () => void;
  onSuccess: () => void;
  initialRecipient?: string;
  initialAmount?: string;
}

const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  userWallet,
  onClose,
  onSuccess,
  initialRecipient,
  initialAmount,
}) => {
  const [formData, setFormData] = useState({
    recipientAddress: '',
    amount: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');

  // Update form when QR scan data is provided
  useEffect(() => {
    console.log('SendMoneyModal received props:', { initialRecipient, initialAmount });
    if (initialRecipient) {
      setFormData(prev => ({ ...prev, recipientAddress: initialRecipient }));
    }
    if (initialAmount) {
      setFormData(prev => ({ ...prev, amount: initialAmount }));
    }
  }, [initialRecipient, initialAmount]);

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
    setSuccess('');
    setLoading(true);

    try {
      // First, check if account is blocked before allowing transaction
      const statusCheck = await api.get('/api/aml-monitor/check-account-status');
      if (statusCheck.data.isBlocked) {
        setError(
          '🚫 ACCOUNT BLOCKED\n\n' +
          'Your account has been blocked due to AML violations.\n' +
          'You cannot perform transactions until an administrator unblocks your account.\n\n' +
          `Rule Violated: ${statusCheck.data.violatedRuleName || 'N/A'}\n` +
          `Reason: ${statusCheck.data.violationDescription || 'Suspicious activity detected'}`
        );
        setLoading(false);
        return;
      }
      
      // Check KYC status before allowing transaction
      try {
        const kycCheck = await api.get('/api/kyc/status');
        if (kycCheck.data.kycStatus !== 'APPROVED') {
          setError(
            '📄 KYC VERIFICATION REQUIRED\n\n' +
            'You must complete KYC verification before performing transactions.\n' +
            `Current KYC Status: ${kycCheck.data.kycStatus}\n\n` +
            'Please click on "KYC Verification" in the dashboard to submit your documents.'
          );
          setLoading(false);
          return;
        }
      } catch (kycErr: any) {
        console.error('KYC status check failed:', kycErr);
        if (kycErr.response?.status === 403) {
          setError(
            '📄 KYC VERIFICATION REQUIRED\n\n' +
            'You must complete and get approval for KYC verification before performing transactions.\n\n' +
            'Please click on "KYC Verification" in the dashboard to submit your documents.'
          );
        } else {
          setError('Failed to verify KYC status. Please try again.');
        }
        setLoading(false);
        return;
      }
      
      // Validate inputs
      if (!formData.recipientAddress) {
        throw new Error('Recipient address is required');
      }

      // Trim and validate recipient address
      const recipientAddress = formData.recipientAddress.trim();
      
      if (!recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
        throw new Error('Invalid Ethereum address format. Address must start with 0x and be 42 characters long.');
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Get contract details
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address not configured');
      }

      // Load contract ABI
      const contractABI = [
        {
          "inputs": [
            { "internalType": "address", "name": "_to", "type": "address" },
            { "internalType": "uint256", "name": "_amount", "type": "uint256" }
          ],
          "name": "recordTransaction",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        }
      ];

      setTxStatus('⏳ Waiting for MetaMask confirmation...');

      // Send transaction with trimmed address
      const result = await sendTransaction(
        contractAddress,
        contractABI,
        recipientAddress,
        formData.amount
      );

      setTxStatus('⏳ Transaction pending...');
      
      if (result.status === 1) {
        setSuccess(`✅ Transaction successful! Hash: ${result.transactionHash}`);
        setTxStatus('✅ Transaction confirmed! Running AML checks...');
        
        // Evaluate transaction against AML rules
        try {
          const amlResponse = await api.post('/api/aml-monitor/evaluate-transaction', {
            transactionHash: result.transactionHash
          });
          
          if (amlResponse.data.violated) {
            // AML violation detected - account has been blocked
            console.error('🚫 AML VIOLATION - Account blocked');
            console.log('Violations:', amlResponse.data.violations);
            setTxStatus('🚫 AML Violation - Account Blocked');
            setSuccess(''); // Clear success message
            
            // Format all violations for display
            const violationsList = amlResponse.data.violations
              .map((v: any) => `• ${v.name} (${v.severity}): ${v.reason}`)
              .join('\n');
            
            setError(
              `⛔ ${amlResponse.data.violationCount} AML VIOLATION(S) DETECTED\n\n` +
              `${violationsList}\n\n` +
              `🚫 YOUR ACCOUNT HAS BEEN AUTOMATICALLY BLOCKED\n\n` +
              `You cannot perform any more transactions until an administrator reviews and unblocks your account.\n\n` +
              `The dashboard will refresh to show your blocked status.`
            );
            
            // Close modal and refresh dashboard after 4 seconds to show blocked state
            setTimeout(() => {
              setLoading(false);
              onSuccess(); // This triggers dashboard reload
            }, 4000);
            return;
          } else {
            setTxStatus('✅ Transaction confirmed and passed AML checks!');
            
            // Wait for blockchain to index the transaction, then close and refresh
            setTimeout(() => {
              onSuccess();
            }, 3000);
          }
        } catch (amlError: any) {
          console.error('AML evaluation error:', amlError);
          // Transaction succeeded but AML check failed - still notify
          setTxStatus('✅ Transaction confirmed! (AML check inconclusive)');
          // Wait for blockchain to index
          setTimeout(() => {
            onSuccess();
          }, 3000);
        }
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
      setTxStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>💸 Send Money</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        {(initialRecipient || initialAmount) && !success && !error && (
          <div className="qr-scan-info">
            📱 Transaction details pre-filled from QR code scan
          </div>
        )}
        {txStatus && (
          <div className="tx-status">
            {txStatus}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>From (Your Wallet)</label>
            <input
              type="text"
              value={userWallet}
              disabled
              className="input-disabled"
            />
          </div>

          <div className="input-group">
            <label>Recipient Address *</label>
            <input
              type="text"
              name="recipientAddress"
              value={formData.recipientAddress}
              onChange={handleChange}
              placeholder="0x..."
              required
              disabled={loading}
            />
            <small>Enter any valid Ethereum address</small>
          </div>

          <div className="input-group">
            <label>Amount (ETH) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.1"
              step="any"
              min="0.001"
              required
              disabled={loading}
            />
            <small>Minimum: 0.001 ETH</small>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Send ETH'}
            </button>
          </div>
        </form>

        <div className="modal-note">
          <strong>Note:</strong> MetaMask will open for transaction confirmation.
          The transaction will be recorded on the blockchain immutably.
        </div>
      </div>
    </div>
  );
};

export default SendMoneyModal;
