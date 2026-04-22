# Automated AML Account Blocking System

## Overview

The ChainSecure platform now features a fully automated Anti-Money Laundering (AML) system that evaluates transactions **AFTER** blockchain confirmation and automatically blocks user accounts when violations are detected.

## System Flow

### 1. Transaction Process

```
User → MetaMask → Ganache Blockchain → AML Evaluation → Account Action
```

1. **User initiates transaction** via MetaMask
2. **Transaction is mined** on Ganache blockchain
3. **Transaction is confirmed** and recorded
4. **AML engine automatically evaluates** the transaction against all active rules
5. **If violation detected**: Account is blocked and user is notified
6. **If passed**: Transaction completes normally

### 2. AML Evaluation Engine

**Location**: `backend/services/amlEngine.js`

The AML engine:
- Evaluates transactions against ALL active AML rules
- Checks multiple rule types (velocity, threshold, pattern, frequency, etc.)
- Analyzes user's transaction history
- Assigns severity levels (low, medium, high, critical)
- Automatically triggers account blocking on violation

**Rule Types Supported**:
- `transaction_limit`: Max/min transaction amounts
- `velocity`: Transaction frequency in time windows
- `threshold`: Absolute amount thresholds
- `frequency`: Number of transactions per period
- `pattern`: Suspicious patterns (round numbers, repeated amounts)
- `behavioral`: Deviation from user's normal behavior

### 3. Account Blocking

When a violation is detected:

**Backend Actions** (`backend/services/amlEngine.js`):
```javascript
- Set user.accountStatus = 'BLOCKED'
- Store user.violatedRuleName
- Store user.violationDescription
- Record user.blockTimestamp
- Create notification for user
- Log violation to console
```

**User Impact**:
- ✅ Can still log in
- ❌ Cannot send money
- ❌ Cannot use wallet actions (QR scanning)
- ⚠️ Sees "Account Blocked" warning in dashboard
- 📬 Receives notification about the block

## API Endpoints

### AML Monitoring

#### POST `/api/aml-monitor/evaluate-transaction`
Evaluate a confirmed transaction against AML rules.

**Request**:
```json
{
  "transactionHash": "0x..."
}
```

**Response (Violation)**:
```json
{
  "success": true,
  "amlStatus": "VIOLATED",
  "violated": true,
  "rule": {
    "name": "Large Transaction Threshold",
    "severity": "critical"
  },
  "reason": "Transaction amount 10 ETH meets or exceeds threshold of 10 ETH",
  "accountBlocked": true,
  "message": "AML violation detected. Your account has been blocked."
}
```

**Response (Passed)**:
```json
{
  "success": true,
  "amlStatus": "PASSED",
  "violated": false,
  "message": "Transaction complies with all AML rules"
}
```

#### GET `/api/aml-monitor/check-account-status`
Check if user account is blocked.

**Response**:
```json
{
  "success": true,
  "accountStatus": "BLOCKED",
  "isBlocked": true,
  "violatedRuleName": "Large Transaction Threshold",
  "violationDescription": "Transaction amount exceeds limit",
  "blockTimestamp": "2026-02-01T10:30:00.000Z"
}
```

### Admin Endpoints

#### GET `/api/admin/blocked-users`
Get all blocked users (Admin only).

**Response**:
```json
{
  "success": true,
  "users": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "walletAddress": "0x...",
      "accountStatus": "BLOCKED",
      "violatedRuleName": "Large Transaction Threshold",
      "violationDescription": "Transaction amount 15 ETH exceeds limit",
      "blockTimestamp": "2026-02-01T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

#### POST `/api/admin/unblock-user/:userId`
Unblock a user account (Admin only).

**Response**:
```json
{
  "success": true,
  "message": "User account unblocked successfully",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "accountStatus": "ACTIVE"
  }
}
```

### Notifications

#### GET `/api/notifications`
Get all notifications for logged-in user.

**Response**:
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "...",
      "type": "AML_VIOLATION",
      "title": "Account Blocked - AML Violation Detected",
      "message": "Your account has been blocked...",
      "severity": "critical",
      "isRead": false,
      "createdAt": "2026-02-01T10:30:00.000Z",
      "metadata": {
        "ruleName": "Large Transaction Threshold",
        "transactionHash": "0x...",
        "amount": "15"
      }
    }
  ],
  "count": 1,
  "unreadCount": 1
}
```

## Database Schema Updates

### User Model (`backend/models/User.js`)

```javascript
{
  // ... existing fields ...
  
  accountStatus: {
    type: String,
    enum: ['ACTIVE', 'BLOCKED'],
    default: 'ACTIVE'
  },
  violatedRuleName: {
    type: String,
    default: ''
  },
  violationDescription: {
    type: String,
    default: ''
  },
  blockTimestamp: {
    type: Date
  }
}
```

### Notification Model (`backend/models/Notification.js`)

```javascript
{
  userId: ObjectId,
  type: 'AML_VIOLATION' | 'ACCOUNT_UNBLOCKED' | 'SYSTEM',
  title: String,
  message: String,
  severity: 'low' | 'medium' | 'high' | 'critical',
  isRead: Boolean,
  metadata: {
    ruleName: String,
    transactionHash: String,
    amount: String,
    adminId: ObjectId
  },
  createdAt: Date
}
```

## Frontend Implementation

### User Dashboard (`frontend/src/pages/UserDashboard.tsx`)

**Features**:
1. **Account Status Check**: Automatically checks if account is blocked on load
2. **Blocked Warning**: Shows prominent red warning banner when blocked
3. **Disabled Actions**: 
   - "Send ETH" button becomes disabled and shows "🚫 Account Blocked"
   - QR scanning buttons are disabled
4. **Violation Details**: Displays rule name, reason, and timestamp

**UI Components**:
```tsx
{accountBlocked && (
  <div className="account-blocked-warning">
    <div className="blocked-icon">⛔</div>
    <div className="blocked-content">
      <h3>Account Blocked - AML Violation</h3>
      <p><strong>Rule Violated:</strong> {violationInfo.ruleName}</p>
      <p><strong>Reason:</strong> {violationInfo.description}</p>
      <p><strong>Blocked At:</strong> {formatDate(violationInfo.timestamp)}</p>
    </div>
  </div>
)}
```

### Send Money Modal (`frontend/src/components/SendMoneyModal.tsx`)

**Enhanced Flow**:
1. User submits transaction via MetaMask
2. Wait for blockchain confirmation
3. **Automatically call AML evaluation API**
4. If violation detected:
   - Show error message
   - Inform user account is blocked
   - Refresh dashboard to show blocked status
5. If passed: Show success and close

### Admin Dashboard (`frontend/src/pages/AdminDashboard.tsx`)

**New Tab: "🚫 Blocked Users"**

**Features**:
1. **Grid View**: Shows all blocked users in card format
2. **User Details**: 
   - Name, email, wallet address
   - Violated rule name
   - Violation description
   - Block timestamp
3. **Unblock Action**: One-click unblock with confirmation
4. **Auto-Refresh**: Updates blocked user count in real-time

**Card Layout**:
```
┌─────────────────────────────────────┐
│ John Doe                  🚨 BLOCKED │
│ john@example.com                    │
├─────────────────────────────────────┤
│ Wallet: 0x1234...5678              │
│ Rule: Large Transaction Threshold  │
│ Reason: Amount 15 ETH exceeds...   │
│ Blocked: 2/1/2026, 10:30:00 AM    │
├─────────────────────────────────────┤
│ [✅ Unblock User] [👁️ View Details] │
└─────────────────────────────────────┘
```

## Testing the System

### Test Scenario 1: Trigger Large Transaction Block

1. **Create AML rule** (if not exists):
   - Go to Admin Dashboard → AML Rules
   - Create rule: "Large Transaction Threshold"
   - Type: `threshold`
   - Parameters: `{ threshold: 10 }`
   - Severity: `critical`

2. **As a user, send > 10 ETH**:
   - Connect MetaMask
   - Click "Send ETH"
   - Enter amount: `15` ETH
   - Confirm transaction

3. **Expected result**:
   - Transaction confirms on blockchain
   - AML evaluation runs automatically
   - ⚠️ Account gets blocked
   - User sees error: "AML Violation: Transaction amount 15 ETH meets or exceeds threshold of 10 ETH"
   - Dashboard shows "Account Blocked" warning
   - "Send Money" button becomes disabled

4. **Admin unblocks**:
   - Go to Admin Dashboard → Blocked Users
   - Click "✅ Unblock User"
   - User receives notification
   - User can transact again

### Test Scenario 2: Velocity Rule Violation

1. **Create velocity rule**:
   - Type: `velocity`
   - Parameters: `{ maxTransactions: 3, timeWindow: 3600 }` (3 tx per hour)

2. **Send 4 transactions quickly**
   - 4th transaction triggers violation
   - Account blocked automatically

## Security Features

✅ **Post-Transaction Evaluation**: Users cannot game the system by avoiding checks
✅ **No Pre-Warning**: Users are not alerted before transaction is evaluated
✅ **Automatic Enforcement**: No manual admin intervention needed for blocking
✅ **Comprehensive Logging**: All violations are logged with full details
✅ **Notification System**: Users are informed about blocks via notifications
✅ **Admin Control**: Only admins can unblock accounts
✅ **Audit Trail**: Block timestamps and reasons are permanently recorded

## Configuration

### Environment Variables

No new environment variables required. Uses existing:
- `MONGODB_URI`: Database connection
- `GANACHE_RPC_URL`: Blockchain connection
- `CONTRACT_ADDRESS`: Smart contract address

## Maintenance

### Monitoring Blocked Accounts

**Admin Actions**:
1. Regularly check "Blocked Users" tab
2. Review violation reasons
3. Investigate suspicious patterns
4. Unblock false positives
5. Adjust AML rules as needed

### Logging

All AML violations are logged to console:
```
⚠️ AML VIOLATION DETECTED!
   Rule: Large Transaction Threshold
   Reason: Transaction amount 15 ETH exceeds limit
✋ User account blocked: john@example.com (0x1234...)
```

## Future Enhancements

🔮 **Planned Features**:
- Email notifications on account block
- SMS alerts for critical violations
- Detailed audit log dashboard
- Automatic SAR (Suspicious Activity Report) generation
- Machine learning-based anomaly detection
- Risk scoring system
- Temporary vs permanent blocks
- Grace period for minor violations

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify AML rules are configured correctly
3. Ensure MongoDB and Ganache are running
4. Contact system administrator

---

**Last Updated**: February 1, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
