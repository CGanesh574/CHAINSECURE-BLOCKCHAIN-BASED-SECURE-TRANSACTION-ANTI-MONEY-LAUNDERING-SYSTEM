import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import './QRCodeModal.css';

interface QRCodeModalProps {
  walletAddress: string;
  onClose: () => void;
  initialAmount?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ walletAddress, onClose, initialAmount }) => {
  const [amount, setAmount] = useState(initialAmount || '');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode(initialAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const generateQRCode = async (amountValue?: string) => {
    try {
      // Create QR data: wallet address with optional amount
      const qrData = amountValue 
        ? JSON.stringify({ address: walletAddress, amount: amountValue })
        : walletAddress;

      // Generate QR code
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeUrl(url);

      // Also draw on canvas for download
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: 300,
          margin: 2,
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleUpdateQR = () => {
    if (amount && parseFloat(amount) > 0) {
      generateQRCode(amount);
    } else {
      generateQRCode();
    }
  };

  const handleDownloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `chainsecure-wallet-${amount ? `${amount}ETH-` : ''}qr.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="qr-modal-content">
        <div className="qr-modal-header">
          <h2>💳 Wallet QR Code</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="qr-modal-body">
          {/* QR Code Display */}
          <div className="qr-code-container">
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="Wallet QR Code" className="qr-code-image" />
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </div>

          {/* Wallet Info */}
          <div className="qr-wallet-info">
            <p className="qr-label">Wallet Address:</p>
            <p className="qr-address">{walletAddress}</p>
          </div>

          {/* Amount Input */}
          <div className="qr-amount-section">
            <label className="qr-label">Amount (ETH) - Optional:</label>
            <div className="qr-amount-input-group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (optional)"
                step="0.0001"
                min="0"
                className="qr-amount-input"
              />
              <button onClick={handleUpdateQR} className="qr-update-btn">
                🔄 Update QR
              </button>
            </div>
            {amount && (
              <p className="qr-amount-info">
                QR code will auto-fill {amount} ETH when scanned
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="qr-actions">
            <button onClick={handleDownloadQR} className="qr-download-btn">
              📥 Download QR Code
            </button>
          </div>

          <div className="qr-instructions">
            <h4>📱 How to use:</h4>
            <ul>
              <li>Share this QR code to receive payments</li>
              <li>Add an amount to auto-fill transaction details</li>
              <li>Download and share via messaging apps</li>
              <li>Scan with ChainSecure to send ETH instantly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
