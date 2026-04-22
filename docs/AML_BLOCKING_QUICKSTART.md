# Quick Start: Testing AML Account Blocking

## Prerequisites
- Backend server running (`cd backend && npm start`)
- Ganache running on port 7545
- Frontend running (`cd frontend && npm start`)
- MetaMask installed and connected to Ganache
- Admin and user accounts created
- At least 10 default AML rules seeded

## Step-by-Step Testing Guide

### 1. Setup AML Rules (Admin)

1. **Login as Admin**:
   - Email: `admin@chainsecure.com`
   - Password: `admin123`

2. **Navigate to AML Rules tab**

3. **Seed Default Rules** (if not already done):
   - Click "🌱 Seed Default Rules"
   - Confirm creation of 10 rules
   - Verify rules appear in the list

4. **Key Rule to Test**: "Large Transaction Threshold"
   - Type: `threshold`
   - Threshold: `10 ETH`
   - Severity: `critical`
   - Status: ✅ Active

### 2. Test Account Blocking (User)

1. **Create/Login as Regular User**:
   - Register a new account or use existing
   - Connect MetaMask wallet
   - Ensure you have > 15 ETH in balance

2. **Send Large Transaction**:
   ```
   - Click "Send ETH" button
   - Recipient: Any valid address (e.g., another Ganache account)
   - Amount: 15 ETH
   - Click "Send ETH"
   ```

3. **Confirm in MetaMask**:
   - MetaMask popup will appear
   - Click "Confirm"
   - Wait for transaction to be mined

4. **AML Evaluation Happens Automatically**:
   ```
   ⏳ Transaction pending...
   ✅ Transaction confirmed! Running AML checks...
   ⚠️ AML Violation Detected - Account Blocked
   ```

5. **Check Error Message**:
   ```
   🚫 AML Violation: Transaction amount 15 ETH meets or 
   exceeds threshold of 10 ETH
   
   Your account has been automatically blocked.
   Please contact an administrator for review.
   ```

6. **Dashboard Updates**:
   - Page refreshes automatically
   - ⛔ **Account Blocked Warning** appears (red banner)
   - Shows:
     - Rule Violated: Large Transaction Threshold
     - Reason: Transaction exceeds limit
     - Blocked timestamp
   - "Send ETH" button becomes disabled (shows "🚫 Account Blocked")
   - QR scanning buttons are disabled

7. **Verify Blocked Status**:
   - Try clicking "Send ETH" → Nothing happens (disabled)
   - Try clicking "Scan QR" → Nothing happens (disabled)
   - User can still view transactions and balance

### 3. Admin Review and Unblock

1. **Switch to Admin Account**:
   - Sign out from user account
   - Login as admin

2. **Navigate to "🚫 Blocked Users" Tab**:
   - Should show count: `(1)`
   - Card displays:
     ```
     ┌───────────────────────────────────┐
     │ [User Name]           🚨 BLOCKED │
     │ user@example.com                 │
     ├───────────────────────────────────┤
     │ Wallet: 0x1234...5678            │
     │ Rule: Large Transaction Threshold│
     │ Reason: Amount 15 ETH exceeds... │
     │ Blocked: [timestamp]             │
     ├───────────────────────────────────┤
     │ [✅ Unblock] [👁️ View Details]    │
     └───────────────────────────────────┘
     ```

3. **Unblock the User**:
   - Click "✅ Unblock User"
   - Confirm the action
   - Success message appears
   - Card disappears from blocked users list
   - Tab count updates to `(0)`

4. **Verify User Unblocked**:
   - Sign out from admin
   - Login as the previously blocked user
   - No more "Account Blocked" warning
   - "Send ETH" button is enabled
   - User can transact normally

### 4. Test Other Rule Types

#### A. Velocity Rule (Multiple Transactions)

1. **Create/Enable Velocity Rule**:
   - Name: "Rapid Transaction Detection"
   - Type: `velocity`
   - Parameters:
     ```json
     {
       "maxTransactions": 3,
       "timeWindow": 3600
     }
     ```
   - Means: Max 3 transactions per hour

2. **Send 4 Transactions Quickly**:
   - Send 1 ETH → ✅ Pass
   - Send 1 ETH → ✅ Pass
   - Send 1 ETH → ✅ Pass
   - Send 1 ETH → 🚫 **BLOCKED** (4th transaction violates velocity)

#### B. Pattern Detection Rule

1. **Enable Pattern Rule**

2. **Send Multiple Round Number Transactions**:
   - Send 5 ETH
   - Send 10 ETH
   - Send 15 ETH
   - Send 20 ETH → May trigger pattern detection

### 5. Console Log Verification

**Backend Console** will show:
```
🔍 Evaluating transaction: 0x1234...
⚠️ AML VIOLATION DETECTED!
   Rule: Large Transaction Threshold
   Reason: Transaction amount 15 ETH meets or exceeds threshold of 10 ETH
✋ User account blocked: user@example.com (0x1234...5678) - Rule: Large Transaction Threshold
```

**Frontend Console** will show:
```
🔄 Refreshing wallet data...
✅ Transaction confirmed and passed AML checks!
OR
⚠️ AML Violation Detected - Account Blocked
```

## Expected Behavior Summary

### When Account is BLOCKED:

| Action | Allowed? | Behavior |
|--------|----------|----------|
| Login | ✅ Yes | User can log in normally |
| View Dashboard | ✅ Yes | Can see all information |
| View Balance | ✅ Yes | Can check wallet balance |
| View Transactions | ✅ Yes | Can see transaction history |
| Connect Wallet | ✅ Yes | Can connect MetaMask |
| Send Money | ❌ No | Button disabled, shows "Account Blocked" |
| Scan QR Code | ❌ No | Button disabled |
| Upload QR | ❌ No | Button disabled |
| Download Statement | ✅ Yes | Can download statements |
| View Profile | ✅ Yes | Can view profile details |

### When Account is ACTIVE:

All actions are allowed ✅

## Troubleshooting

### Issue: Account not getting blocked

**Check**:
1. ✅ Is the AML rule active? (isActive = true)
2. ✅ Are transaction parameters correct?
3. ✅ Check backend console for AML evaluation logs
4. ✅ Is transaction hash being passed correctly?

### Issue: Frontend not showing blocked status

**Check**:
1. ✅ Refresh the dashboard
2. ✅ Check browser console for errors
3. ✅ Verify API call to `/aml-monitor/check-account-status`
4. ✅ Clear browser cache

### Issue: Admin cannot see blocked user

**Check**:
1. ✅ Is user actually blocked in database?
2. ✅ Refresh the Blocked Users tab
3. ✅ Check browser console for API errors
4. ✅ Verify admin authentication

## Testing Checklist

- [ ] Default AML rules seeded
- [ ] User can send transaction < 10 ETH (passes)
- [ ] User sending > 10 ETH gets blocked
- [ ] Blocked warning appears in user dashboard
- [ ] Send Money button is disabled when blocked
- [ ] Admin can see blocked user in Blocked Users tab
- [ ] Admin can unblock user
- [ ] User receives notification on unblock
- [ ] Unblocked user can transact again
- [ ] Multiple rapid transactions trigger velocity rule
- [ ] Backend logs show AML violation details

## Success Criteria

✅ **System Working Correctly When**:
1. Large transactions (>10 ETH) automatically block accounts
2. User sees clear error message about violation
3. Dashboard shows blocked status immediately
4. User cannot bypass the block
5. Admin sees blocked user with all details
6. Unblock action works instantly
7. User receives notification on unblock
8. All states persist after page refresh

---

**Testing Duration**: ~10 minutes  
**Difficulty**: Easy  
**Required Knowledge**: Basic web app usage, MetaMask transactions
