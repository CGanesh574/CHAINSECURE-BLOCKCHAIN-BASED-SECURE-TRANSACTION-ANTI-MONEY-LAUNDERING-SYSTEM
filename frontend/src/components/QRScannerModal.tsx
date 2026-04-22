 import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './QRScannerModal.css';

interface QRScannerModalProps {
  onClose: () => void;
  onScanSuccess: (address: string, amount?: string) => void;
  mode?: 'scan' | 'upload' | 'both'; // New prop to control mode
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onScanSuccess, mode = 'both' }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check camera permission
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
        setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
      });
    }
  }, []);

  const parseQRData = (qrData: string) => {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(qrData);
      if (parsed.address) {
        return { address: parsed.address, amount: parsed.amount };
      }
    } catch (e) {
      // Not JSON, treat as plain address or check for URL format
      const trimmedData = qrData.trim();
      
      // Check if it's a plain Ethereum address
      if (trimmedData.startsWith('0x') && trimmedData.length === 42) {
        return { address: trimmedData, amount: undefined };
      }
      
      // Check for ethereum: URI scheme (ethereum:<address>[@<chainId>][?value=<amount>])
      if (trimmedData.startsWith('ethereum:')) {
        const addressMatch = trimmedData.match(/ethereum:([0-9a-fA-Fx]+)/);
        const amountMatch = trimmedData.match(/value=([0-9.]+)/);
        if (addressMatch && addressMatch[1]) {
          return { 
            address: addressMatch[1], 
            amount: amountMatch ? amountMatch[1] : undefined 
          };
        }
      }
      
      // Check if data contains address and amount in simple format
      const lines = trimmedData.split('\n').map(l => l.trim());
      let address = '';
      let amount = '';
      
      for (const line of lines) {
        if (line.startsWith('0x') && line.length === 42 && !address) {
          address = line;
        } else if (line.match(/^[0-9.]+$/) && !amount) {
          amount = line;
        }
      }
      
      if (address) {
        return { address, amount: amount || undefined };
      }
    }
    return null;
  };

  const handleScanSuccess = (decodedText: string) => {
    console.log('QR Code detected:', decodedText);
    
    const parsedData = parseQRData(decodedText);
    if (parsedData) {
      stopScanning();
      onScanSuccess(parsedData.address, parsedData.amount);
      onClose();
    } else {
      setScanError('Invalid QR code. Please scan a valid wallet QR code.');
      setTimeout(() => setScanError(''), 3000);
    }
  };

  const startScanning = async () => {
    try {
      setScanError('');
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleScanSuccess,
        (errorMessage) => {
          // Ignore continuous scan errors, only log
          console.log('Scan error:', errorMessage);
        }
      );

      setIsScanning(true);
      setCameraPermission('granted');
    } catch (error: any) {
      console.error('Camera error:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setScanError('Camera permission denied. Please enable camera access in your browser settings.');
        setCameraPermission('denied');
      } else if (error.name === 'NotFoundError') {
        setScanError('No camera found on your device.');
      } else {
        setScanError('Failed to start camera. Please try again or upload a QR image.');
      }
    }
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current && isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current?.clear();
        setIsScanning(false);
      }).catch((err) => {
        console.error('Error stopping scanner:', err);
        setIsScanning(false);
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setScanError('');

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-upload');
      const result = await html5QrCode.scanFile(file, true);
      
      console.log('QR scan result:', result);
      const parsedData = parseQRData(result);
      if (parsedData) {
        onScanSuccess(parsedData.address, parsedData.amount);
        onClose();
      } else {
        setScanError('Invalid QR code in image. Please upload a valid wallet QR code.');
      }
      
      // Clear the scanner instance
      await html5QrCode.clear();
    } catch (error: any) {
      console.error('File scan error:', error);
      setScanError('Failed to read QR code from image. Please ensure the image contains a valid QR code.');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.stop().catch((err) => {
          console.error('Error stopping scanner:', err);
        });
      }
    };
  }, [isScanning]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="qr-scanner-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-scanner-modal-header">
          <h2>{mode === 'upload' ? 'Upload QR Image' : 'Scan QR Code'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="qr-scanner-modal-body">
          {/* Camera Scanner - only show if mode is 'scan' or 'both' */}
          {(mode === 'scan' || mode === 'both') && (
          <div className="scanner-section">
            <h3>📷 Scan with Camera</h3>
            <div id="qr-reader" className="qr-reader-container"></div>
            
            {!isScanning && (
              <button 
                className="start-scan-btn"
                onClick={startScanning}
                disabled={cameraPermission === 'denied'}
              >
                {cameraPermission === 'denied' ? '❌ Camera Access Denied' : '📸 Start Camera'}
              </button>
            )}

            {isScanning && (
              <button className="stop-scan-btn" onClick={stopScanning}>
                ⏹️ Stop Camera
              </button>
            )}

            {scanError && (
              <div className="scan-error">
                ⚠️ {scanError}
              </div>
            )}
          </div>
          )}

          {/* Divider - only show if mode is 'both' */}
          {mode === 'both' && (
          <div className="scanner-divider">
            <span>OR</span>
          </div>
          )}

          {/* File Upload - only show if mode is 'upload' or 'both' */}
          {(mode === 'upload' || mode === 'both') && (
          <div className="upload-section">
            <h3>📤 Upload QR Image</h3>
            <div id="qr-reader-upload" style={{ display: 'none' }}></div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Choose Image
            </button>

            {uploadFile && (
              <div className="upload-info">
                Selected: {uploadFile.name}
              </div>
            )}

            {scanError && mode === 'upload' && (
              <div className="scan-error">
                ⚠️ {scanError}
              </div>
            )}
          </div>
          )}

          {/* Instructions */}
          <div className="scanner-instructions">
            <h4>📋 Instructions</h4>
            <ul>
              {(mode === 'scan' || mode === 'both') && (
                <>
                  <li>Click <strong>"Start Camera"</strong> to scan QR code in real-time</li>
                  <li>Point your camera at the QR code</li>
                </>
              )}
              {mode === 'both' && <li>Or click <strong>"Choose Image"</strong> to upload a saved QR code</li>}
              {mode === 'upload' && <li>Click <strong>"Choose Image"</strong> to upload a saved QR code</li>}
              <li>The transaction will auto-fill with scanned details</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
