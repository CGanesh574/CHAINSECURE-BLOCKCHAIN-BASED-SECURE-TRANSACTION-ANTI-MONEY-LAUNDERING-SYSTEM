# QR Code Payment System - Feature Documentation

## Overview
ChainSecure now supports UPI-style QR code payments for cryptocurrency transactions. Users can generate wallet QR codes, scan them with their camera, or upload QR images to quickly initiate transactions.

## Features Implemented

### 1. **Generate QR Code** 📱
- Click "QR Code" card on dashboard
- View your wallet address as a QR code
- Add amount to embed payment details
- Download QR code as PNG image
- Share with others for quick payments

**How it works:**
- Without amount: QR contains only wallet address
- With amount: QR contains JSON `{address: "0x...", amount: "0.5"}`
- Recipients scan to auto-fill transaction details

### 2. **Scan QR Code** 📷
- Click "Scan QR Code" button
- Camera opens automatically
- Point at any ChainSecure wallet QR
- Transaction form auto-fills
- Confirm and send payment

**Camera Features:**
- Real-time QR detection
- Permission handling
- Error messages if invalid QR
- Fallback to upload if camera fails

### 3. **Upload QR Image** 📁
- Click "Upload QR Image" button (or use upload in scanner modal)
- Select QR code image from device
- Extracts wallet address and amount
- Opens transaction form with details
- Complete the payment

## User Flow

### Scenario A: Requesting Payment
1. Connect your wallet on dashboard
2. Click "QR Code" card
3. Enter amount (e.g., 0.5 ETH)
4. Click "Update QR"
5. Download or screenshot the QR
6. Share with payer

### Scenario B: Making Payment (Camera)
1. Connect your wallet on dashboard
2. Click "Scan QR Code"
3. Allow camera permission
4. Point camera at QR code
5. Transaction form opens with pre-filled details
6. Click "Send" to complete payment

### Scenario C: Making Payment (Upload)
1. Connect your wallet on dashboard
2. Click "Upload QR Image"
3. Select saved QR code image
4. Transaction form opens with pre-filled details
5. Verify and send payment

## Technical Details

### QR Data Format
```json
// With amount
{
  "address": "0x1234567890abcdef...",
  "amount": "0.5"
}

// Without amount (plain address)
"0x1234567890abcdef..."
```

### Components Created
1. **QRCodeModal.tsx** - Generate and download QR codes
2. **QRScannerModal.tsx** - Scan with camera or upload image
3. **QRCodeModal.css** - Styling for QR generation modal
4. **QRScannerModal.css** - Styling for scanner interface

### Libraries Used
- `qrcode` - Generate QR code images
- `html5-qrcode` - Camera scanning and image parsing
- `qrcode-parser` - Parse QR from uploaded images

### Integration
- **UserDashboard.tsx** - QR buttons and modal management
- **SendMoneyModal.tsx** - Accepts pre-filled recipient and amount
- State management for scanned data flow

## Security Features
- ✅ Wallet must be connected to use QR features
- ✅ Validates QR data format before processing
- ✅ Shows clear error if invalid QR detected
- ✅ Requires user confirmation before sending
- ✅ All standard blockchain security measures apply

## Browser Permissions
### Camera Access Required
- First time: Browser will ask for camera permission
- Grant permission to enable scanning
- Can revoke and re-grant in browser settings

### Camera Denied?
- Use "Upload QR Image" as alternative
- Works without camera permission
- Upload previously downloaded QR codes

## Benefits Over Traditional Send
1. **Speed** - No manual address copying
2. **Accuracy** - Eliminates typos in addresses
3. **Convenience** - Amount pre-filled automatically
4. **Familiar** - Works like UPI/payment apps
5. **Offline** - Download QR, share later

## Error Handling
- Invalid QR format → "Invalid QR code" message
- Camera denied → Prompts to use upload
- No camera found → Auto-suggests upload
- Network issues → Standard error handling

## Future Enhancements (Potential)
- Multi-currency QR codes
- Request payment with memo/description
- QR code expiry timestamps
- Payment history from QR scans
- Bulk QR generation for businesses

## Testing Instructions
1. Start both frontend and backend servers
2. Login to user dashboard
3. Connect MetaMask wallet
4. Test Generate:
   - Click "QR Code" card
   - Add amount: 0.1
   - Click "Update QR"
   - Download QR code
5. Test Scan:
   - Click "Scan QR Code"
   - Allow camera access
   - Show downloaded QR to camera
   - Verify form auto-fills
6. Test Upload:
   - Click "Upload QR Image"
   - Select downloaded QR
   - Verify form auto-fills

## Troubleshooting

### Camera Not Working?
- Check browser permissions
- Ensure HTTPS or localhost
- Try different browser
- Use upload as alternative

### QR Not Scanning?
- Ensure good lighting
- Hold steady
- QR code should be clear
- Try upload instead

### Amount Not Pre-filling?
- Verify QR was generated with amount
- Check QR image quality
- Re-generate QR with amount

## Notes
- Only works with ChainSecure generated QR codes
- Standard Ethereum addresses (0x...) also supported
- QR codes don't expire
- Can be reused multiple times
- No personal data stored in QR

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready
