# Setup Verification Checklist

Use this checklist to verify your ChainSecure setup is complete and working correctly.

## ✅ Pre-Installation Verification

### System Requirements
- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MongoDB installed (`mongod --version`)
- [ ] Ganache installed (GUI or CLI)
- [ ] MetaMask browser extension installed
- [ ] Git installed (optional) (`git --version`)

### Disk Space
- [ ] At least 500MB free space for node_modules
- [ ] Additional 1GB recommended for development

---

## ✅ Installation Verification

### Dependencies
- [ ] Root dependencies installed (`/node_modules` exists)
- [ ] Backend dependencies installed (`/backend/node_modules` exists)
- [ ] Frontend dependencies installed (`/frontend/node_modules` exists)
- [ ] Blockchain dependencies installed (`/blockchain/node_modules` exists)

### Configuration Files
- [ ] `/backend/.env` file exists and configured
- [ ] `/frontend/.env` file exists and configured
- [ ] MongoDB URI is correct in backend/.env
- [ ] Ganache RPC URL is correct in both .env files

---

## ✅ Service Verification

### MongoDB
- [ ] MongoDB service is running
- [ ] Can connect to MongoDB: `mongo` or `mongosh`
- [ ] Database 'chainsecure' will be created automatically on first use

**Test MongoDB:**
```bash
mongosh
> show dbs
> exit
```

### Ganache
- [ ] Ganache is running (GUI or CLI)
- [ ] RPC Server shows: http://127.0.0.1:7545
- [ ] At least 10 accounts visible with 100 ETH each
- [ ] Network ID is 5777 or custom

**Test Ganache:**
```bash
curl http://127.0.0.1:7545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### MetaMask
- [ ] MetaMask extension installed and unlocked
- [ ] Ganache network added to MetaMask
- [ ] At least 2-3 Ganache accounts imported
- [ ] Can switch to Ganache network
- [ ] Accounts show ETH balance

**MetaMask Network Settings:**
- Network Name: Ganache
- RPC URL: http://127.0.0.1:7545
- Chain ID: 1337
- Currency: ETH

---

## ✅ Smart Contract Verification

### Deployment
- [ ] Contract deployed successfully (`npm run deploy` in /blockchain)
- [ ] Contract address appears in console output
- [ ] Artifacts folder created: `/blockchain/artifacts/`
- [ ] SecureTransaction.json exists in artifacts
- [ ] backend/.env updated with CONTRACT_ADDRESS
- [ ] frontend/.env updated with REACT_APP_CONTRACT_ADDRESS

**Verify Deployment:**
```bash
cd blockchain
npm run deploy
# Look for: ✅ Contract deployed successfully!
# Look for: 📍 Contract Address: 0x...
```

### Contract Address
- [ ] Copy contract address from deployment output
- [ ] Address starts with '0x'
- [ ] Address is 42 characters long
- [ ] Same address in both .env files

---

## ✅ Backend Verification

### Server Startup
- [ ] Backend server starts without errors
- [ ] Console shows: "✅ Connected to MongoDB"
- [ ] Console shows: "✅ Admin user created"
- [ ] Console shows: "🚀 Server running on port 5000"
- [ ] No error messages in console

**Test Backend:**
```bash
cd backend
npm run dev

# In another terminal:
curl http://localhost:5000/api/health
# Should return: {"status":"OK",...}
```

### API Endpoints
- [ ] Health endpoint works: http://localhost:5000/api/health
- [ ] Returns JSON with status "OK"
- [ ] No CORS errors in browser console

**Test with Browser:**
Open: http://localhost:5000
Should show: {"message": "ChainSecure Backend API", ...}

---

## ✅ Frontend Verification

### Application Startup
- [ ] Frontend starts without errors
- [ ] Browser opens automatically to http://localhost:3000
- [ ] No compilation errors shown
- [ ] React logo or homepage visible

**Test Frontend:**
```bash
cd frontend
npm start
# Should open browser automatically
# Or manually open http://localhost:3000
```

### Pages Load
- [ ] Home page loads correctly
- [ ] About page accessible
- [ ] Contact page accessible
- [ ] Login page accessible
- [ ] Register page accessible
- [ ] No 404 errors
- [ ] No JavaScript errors in console

**Visual Check:**
- [ ] Navbar visible
- [ ] Logo/branding visible
- [ ] Buttons clickable
- [ ] Styling applied correctly
- [ ] Gradient background visible

---

## ✅ Functionality Verification

### User Registration
- [ ] Can access registration page
- [ ] All form fields present
- [ ] "Connect MetaMask" button visible
- [ ] MetaMask popup appears on click
- [ ] Can select account
- [ ] Wallet address displayed after connection
- [ ] "Verify Wallet" button appears
- [ ] MetaMask signature request appears
- [ ] Can sign message
- [ ] "✅ Wallet Verified" message appears
- [ ] Can submit registration
- [ ] Registration successful
- [ ] Redirected to dashboard

**Test Registration:**
1. Navigate to /register
2. Fill all fields (use test data)
3. Connect MetaMask
4. Verify wallet (sign message)
5. Submit form
6. Should redirect to /dashboard

### User Login
- [ ] Can access login page
- [ ] Email and password fields present
- [ ] Can login with registered user
- [ ] Redirected to dashboard on success
- [ ] Error message for wrong credentials
- [ ] Can login as admin

**Test Login:**
- Admin: admin@chainsecure.com / admin123
- User: (your registered email/password)

### User Dashboard
- [ ] User information displayed
- [ ] "Connect MetaMask" button visible
- [ ] Can connect wallet
- [ ] Wallet address shown after connection
- [ ] ETH balance displayed
- [ ] Network name shown
- [ ] Transaction history section visible
- [ ] "Send Money" button appears after connection
- [ ] "Disconnect" button works

**Dashboard Check:**
- [ ] User name displayed
- [ ] Email displayed
- [ ] Registered wallet shown
- [ ] Connected wallet matches registered wallet

### Send Transaction
- [ ] "Send Money" modal opens
- [ ] Recipient address field present
- [ ] Amount field present
- [ ] Can enter recipient address
- [ ] Can enter amount
- [ ] "Send ETH" button enabled
- [ ] MetaMask confirmation appears
- [ ] Can confirm transaction
- [ ] "Transaction pending" message shows
- [ ] "Transaction confirmed" message shows
- [ ] Balance updates after transaction
- [ ] Transaction appears in history

**Test Transaction:**
1. Use a second MetaMask account as recipient
2. Send small amount (0.01 ETH)
3. Confirm in MetaMask
4. Wait for confirmation
5. Check balance updated
6. Check transaction in history

### Transaction History
- [ ] Transaction table visible
- [ ] Shows sent transactions
- [ ] Shows received transactions
- [ ] Type column (Sent/Received) correct
- [ ] Addresses displayed
- [ ] Amount displayed
- [ ] Timestamp displayed
- [ ] Transaction hash displayed
- [ ] Transaction hash clickable

### Admin Dashboard
- [ ] Can login as admin
- [ ] Statistics cards visible
- [ ] Total users count shown
- [ ] Total wallets count shown
- [ ] Total transactions count shown
- [ ] Recent signups count shown
- [ ] User management table visible
- [ ] All users listed
- [ ] User details complete
- [ ] No "Connect MetaMask" option for admin

**Test Admin:**
Login: admin@chainsecure.com / admin123
Check all statistics and user table

---

## ✅ Security Verification

### Wallet Verification
- [ ] Cannot register without wallet verification
- [ ] Signature verification works
- [ ] Cannot use different wallet in dashboard
- [ ] Wallet mismatch shows error
- [ ] Cannot bypass verification

### Authentication
- [ ] Cannot access dashboard without login
- [ ] JWT token stored in localStorage
- [ ] Token expires after 7 days
- [ ] Logout clears token
- [ ] Protected routes redirect to login
- [ ] Admin routes protected

### Password Security
- [ ] Passwords not visible during entry
- [ ] Passwords hashed in database (check MongoDB)
- [ ] Cannot login with wrong password
- [ ] Error message generic (security best practice)

---

## ✅ Integration Verification

### Frontend ↔ Backend
- [ ] API calls succeed
- [ ] CORS working (no browser errors)
- [ ] Authentication headers sent
- [ ] Responses parsed correctly
- [ ] Error handling works

### Backend ↔ MongoDB
- [ ] Users saved to database
- [ ] Can query users
- [ ] Data persists after server restart
- [ ] No duplicate emails/wallets allowed

### Frontend ↔ MetaMask
- [ ] MetaMask detected
- [ ] Can request accounts
- [ ] Can sign messages
- [ ] Can sign transactions
- [ ] Events listened to (account change)

### Backend ↔ Blockchain
- [ ] Can query contract
- [ ] Can fetch events
- [ ] Transaction count accurate
- [ ] Event filtering works

---

## ✅ Error Handling Verification

### Expected Errors
- [ ] "MetaMask not installed" - shows when MetaMask missing
- [ ] "User rejected" - shows when user cancels MetaMask
- [ ] "Insufficient funds" - shows when balance too low
- [ ] "Wallet mismatch" - shows when wrong wallet connected
- [ ] "Invalid email/password" - shows on wrong login
- [ ] "Email already registered" - shows on duplicate registration

### Network Errors
- [ ] Backend offline - shows error message
- [ ] MongoDB offline - backend shows error
- [ ] Ganache offline - shows connection error
- [ ] Invalid contract address - shows error

---

## ✅ Performance Verification

### Load Times
- [ ] Home page loads < 2 seconds
- [ ] Dashboard loads < 3 seconds
- [ ] API responses < 500ms
- [ ] No infinite loading states

### UI Responsiveness
- [ ] Buttons respond immediately
- [ ] Forms validate in real-time
- [ ] No lag during typing
- [ ] Smooth animations

---

## ✅ Browser Verification

Test in multiple browsers:
- [ ] Chrome/Chromium (Recommended)
- [ ] Firefox
- [ ] Brave
- [ ] Edge
- [ ] MetaMask works in all

---

## ✅ Clean Shutdown Verification

### Proper Shutdown
- [ ] Can stop backend (Ctrl+C)
- [ ] Can stop frontend (Ctrl+C)
- [ ] Can close Ganache safely
- [ ] MongoDB shuts down properly
- [ ] No error messages on shutdown

### Restart Verification
- [ ] Can restart all services
- [ ] Data persists in MongoDB
- [ ] Ganache may reset (expected)
- [ ] Contract may need redeployment (if Ganache reset)

---

## ✅ Final Checklist

### Complete Setup
- [ ] All services running
- [ ] No error messages
- [ ] Can register user
- [ ] Can login
- [ ] Can send transaction
- [ ] Can view transaction history
- [ ] Admin dashboard works
- [ ] Documentation read

### Ready for Use
- [ ] Project runs locally
- [ ] All features working
- [ ] No critical bugs
- [ ] Documentation accessible
- [ ] Can demonstrate to others

---

## 🎯 Success Criteria

**Your setup is COMPLETE if:**
1. ✅ All services start without errors
2. ✅ Can register a new user with wallet verification
3. ✅ Can login successfully
4. ✅ Can connect MetaMask in dashboard
5. ✅ Can send a test transaction
6. ✅ Transaction appears in history
7. ✅ Admin dashboard accessible

---

## 🚨 Troubleshooting Quick Reference

### Issue: Contract deployment fails
**Fix:** Ensure Ganache is running on port 7545

### Issue: MetaMask not detected
**Fix:** Install MetaMask extension and refresh page

### Issue: Wallet verification fails
**Fix:** Sign the message in MetaMask, don't reject

### Issue: Transaction fails
**Fix:** Check you have enough ETH and are on Ganache network

### Issue: MongoDB connection error
**Fix:** Start MongoDB service

### Issue: Port already in use
**Fix:** Change PORT in .env or kill the process

---

## 📊 Verification Score

Count your checkmarks:
- **90-100%**: ✅ Perfect setup!
- **75-89%**: ⚠️ Minor issues, but functional
- **Below 75%**: ❌ Review setup steps

---

**Last Updated:** January 2026
**Version:** 1.0.0

Once all checks pass, you're ready to use ChainSecure! 🎉
