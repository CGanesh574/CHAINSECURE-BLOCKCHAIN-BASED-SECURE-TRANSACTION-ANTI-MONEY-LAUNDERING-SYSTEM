# Algorithms Used in ChainSecure Project

## Overview
This document lists all algorithms implemented and utilized in the ChainSecure blockchain-based secure transaction and Anti-Money Laundering (AML) system.

---

## 1. Cryptographic Algorithms

### 1.1 Password Hashing - bcrypt
- **Location**: `backend/routes/auth.js`, `backend/server.js`
- **Purpose**: Secure password storage and verification
- **Implementation**: Salt rounds = 10
- **Algorithm Details**: bcrypt uses Blowfish cipher with salt
- **Usage**:
  - User registration: `bcrypt.hash(password, 10)`
  - Login verification: `bcrypt.compare(password, hashedPassword)`

### 1.2 JWT (JSON Web Tokens)
- **Location**: `backend/routes/auth.js`, `backend/middleware/auth.js`
- **Purpose**: Stateless authentication and session management
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Implementation**:
  - Token generation: `jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })`
  - Token verification: `jwt.verify(token, JWT_SECRET)`
- **Payload**: userId, email, role, kycStatus, accountStatus

### 1.3 ECDSA (Elliptic Curve Digital Signature Algorithm)
- **Location**: `backend/routes/auth.js`, `frontend/src/services/web3.ts`
- **Purpose**: Ethereum wallet ownership verification
- **Implementation**: Uses secp256k1 curve (Ethereum standard)
- **Process**:
  1. User signs message with private key (MetaMask)
  2. Backend recovers address from signature: `ethers.verifyMessage(message, signature)`
  3. Compares recovered address with claimed wallet address

### 1.4 Keccak-256 (SHA-3)
- **Location**: Ethereum blockchain (implicit in ethers.js)
- **Purpose**: Transaction hashing, address generation
- **Implementation**: Built into Ethereum protocol
- **Usage**: Transaction hash generation, address checksum validation

---

## 2. Blockchain Algorithms

### 2.1 Ethereum Consensus Algorithm
- **Type**: Proof of Stake (Ethereum 2.0) / Proof of Work (legacy)
- **Purpose**: Network consensus and block validation
- **Implementation**: External (Ganache for local development)

### 2.2 Smart Contract Execution
- **Location**: `blockchain/contracts/SecureTransaction.sol`
- **Algorithm**: EVM (Ethereum Virtual Machine) bytecode execution
- **Gas Calculation**: Dynamic gas pricing based on operation complexity

### 2.3 Transaction Hash Generation
- **Algorithm**: Keccak-256 hash of transaction data
- **Input**: nonce, gasPrice, gasLimit, to, value, data, v, r, s
- **Output**: 32-byte transaction hash

---

## 3. AML Detection Algorithms

### 3.1 Risk Score Calculation Algorithm
- **Location**: `backend/services/amlEngine.js` (lines 18-85)
- **Type**: Multi-factor weighted scoring system
- **Implementation**:
  ```
  For each active AML rule:
    - Evaluate rule conditions
    - If violated, add risk points based on severity:
      * Critical: 30 points
      * High: 20 points
      * Medium: 10 points
      * Low: 5 points
  Total Risk Score = Sum of all violation points (capped at 100)
  Risk Level:
    - High: 81-100
    - Medium: 41-80
    - Low: 0-40
  ```

### 3.2 Rule-Based Pattern Matching
- **Location**: `backend/services/amlEngine.js` (checkRule method)
- **Algorithm Types**:
  - **Threshold Detection**: `amount > threshold`
  - **Velocity Analysis**: `(frequency in time_window) > limit`
  - **Pattern Matching**: Sequential or time-based patterns
- **Rule Types**:
  - Large transaction detection
  - High-frequency transaction detection
  - Unusual pattern detection
  - Round amount detection
  - Time-based anomalies

### 3.3 Transaction Velocity Algorithm
- **Implementation**:
  ```javascript
  const timeWindow = rule.timeWindowMinutes * 60 * 1000;
  const recentTransactions = allUserTransactions.filter(tx => 
    (currentTime - tx.timestamp) <= timeWindow
  );
  const transactionCount = recentTransactions.length;
  if (transactionCount > rule.maxTransactions) {
    // Violation detected
  }
  ```

### 3.4 Large Transaction Detection
- **Algorithm**: Simple comparison
- **Implementation**: `transaction.amount >= threshold`
- **Configurable**: Admin sets threshold per rule

---

## 4. Data Processing Algorithms

### 4.1 Sorting Algorithms
- **Implementation**: JavaScript Array.sort() (Timsort)
- **Complexity**: O(n log n)
- **Locations**:
  - `backend/routes/aml.js`: `.sort({ priority: -1, createdAt: -1 })`
  - Transaction history sorting by timestamp
  - User list sorting by various fields

### 4.2 Filtering Algorithms
- **Implementation**: Linear search with predicate matching
- **Complexity**: O(n)
- **Locations**:
  - `frontend/src/pages/AdminDashboard.tsx`: KYC submissions filtering
  - SAR report filtering by status
  - Transaction filtering by date range
- **Example**:
  ```javascript
  kycSubmissions.filter(k => k.status === 'PENDING')
  ```

### 4.3 Search Algorithms
- **Type**: Substring matching (case-insensitive)
- **Implementation**:
  ```javascript
  searchTerm.toLowerCase().includes(query.toLowerCase())
  ```
- **Locations**:
  - SAR report search by user/wallet/ID
  - KYC search by user/email/document ID
  - Support ticket search

### 4.4 Aggregation Algorithms
- **Purpose**: Statistical calculations and data grouping
- **Implementations**:
  - Count: `.length`
  - Sum: `.reduce((sum, val) => sum + val, 0)`
  - Average: `sum / count`
  - Group by: Object/Map based grouping

---

## 5. Validation Algorithms

### 5.1 Ethereum Address Validation
- **Algorithm**: EIP-55 Checksum validation
- **Implementation**: `ethers.isAddress(address)`
- **Process**:
  1. Check length (42 characters including '0x')
  2. Verify hexadecimal characters
  3. Validate checksum (case-sensitive)

### 5.2 Form Input Validation
- **Library**: express-validator (backend), custom validation (frontend)
- **Algorithms**:
  - Pattern matching (regex)
  - Length validation
  - Type checking
  - Required field validation

### 5.3 Document Format Validation
- **Location**: `backend/routes/kyc.js`, `backend/routes/support.js`
- **Algorithm**: MIME type checking
- **Allowed Types**: image/jpeg, image/png, image/jpg, application/pdf
- **Size Limit**: 5MB per file

---

## 6. PDF Generation Algorithm

### 6.1 PDFKit Document Generation
- **Location**: `backend/routes/user.js`
- **Purpose**: Transaction statement generation
- **Process**:
  1. Create PDF document instance
  2. Add header with metadata
  3. Create table with formatted data
  4. Apply styling (colors, fonts, borders)
  5. Generate buffer output

---

## 7. QR Code Algorithms

### 7.1 QR Code Generation
- **Library**: qrcode.react
- **Algorithm**: ISO/IEC 18004 standard
- **Error Correction**: Reed-Solomon codes
  - Level H: 30% recovery capacity
- **Encoding**: UTF-8 text (wallet address)

### 7.2 QR Code Scanning
- **Library**: html5-qrcode
- **Algorithm**:
  1. Image acquisition from camera/file
  2. Binarization (grayscale conversion)
  3. Pattern detection (finder patterns)
  4. Grid sampling and decoding
  5. Error correction
  6. Data extraction

---

## 8. Image Processing Algorithms

### 8.1 QR Scanner Image Processing
- **Processes**:
  - Grayscale conversion
  - Contrast enhancement
  - Edge detection
  - Pattern recognition

---

## 9. Session Management Algorithms

### 9.1 Token Expiration
- **Algorithm**: Time-based comparison
- **Implementation**:
  ```javascript
  const tokenAge = currentTime - tokenIssuedAt;
  if (tokenAge > expirationTime) {
    // Token expired
  }
  ```
- **Expiration**: 24 hours

---

## 10. Notification Algorithms

### 10.1 Real-time Notification Delivery
- **Type**: Push-based system
- **Implementation**: Database polling or event-based
- **Priority Queue**: High, Medium, Low priorities

---

## Summary Statistics

| Category | Algorithm Count |
|----------|----------------|
| Cryptographic | 4 |
| Blockchain | 3 |
| AML Detection | 4 |
| Data Processing | 4 |
| Validation | 3 |
| PDF Generation | 1 |
| QR Code | 2 |
| Image Processing | 1 |
| Session Management | 1 |
| Notification | 1 |
| **TOTAL** | **24** |

---

## Algorithm Complexity Analysis

| Algorithm | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| bcrypt | O(2^cost) | O(1) |
| JWT Verification | O(n) | O(1) |
| ECDSA Verification | O(1) | O(1) |
| Risk Score Calculation | O(r × t) | O(r) |
| Sorting (Timsort) | O(n log n) | O(n) |
| Filtering | O(n) | O(k) |
| Search | O(n × m) | O(1) |
| QR Generation | O(n) | O(n) |

where:
- n = number of items
- r = number of AML rules
- t = number of user transactions
- k = number of filtered items
- m = search term length
- cost = bcrypt cost factor (10)

---

## Security Considerations

1. **bcrypt**: Adaptive hashing protects against brute-force attacks
2. **JWT**: Secret key must be kept secure; use HTTPS only
3. **ECDSA**: Private keys never leave client; signature-based verification
4. **AML Rules**: Regular updates needed to detect evolving patterns
5. **Input Validation**: Prevents SQL injection, XSS, and other attacks

---

## Performance Optimizations

1. **Database Indexing**: Applied on frequently queried fields
2. **Caching**: Token verification results cached in memory
3. **Batch Processing**: Multiple rule evaluations in single pass
4. **Lazy Loading**: Frontend components loaded on demand
5. **Query Optimization**: Filtered queries at database level

---

**Last Updated**: February 2, 2026
**Version**: 1.0
**Project**: ChainSecure - Blockchain Based Secure Transaction System
