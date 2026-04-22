# Login Troubleshooting Guide

## ✅ What I Just Fixed:

1. **Added Detailed Console Logging** - Every step of login is now logged
2. **Verified Passwords** - Reset to `password123` for both accounts
3. **Updated Login Page** - Shows test credentials directly
4. **Tested Backend** - Confirmed login API works perfectly

## 🎯 How to Login (Step-by-Step):

### Step 1: Clear Everything
```
1. Close ALL browser windows
2. Press Windows + R
3. Type: %localappdata%\Google\Chrome\User Data\Default\
4. Delete: Cookies, Local Storage, Cache folders
   (Or just use Ctrl+Shift+Delete → "All time")
```

### Step 2: Open Fresh Browser
```
1. Open NEW incognito/private window (Ctrl+Shift+N)
2. Go to: http://localhost:3000/login
3. Press F12 to open console
4. Click on "Console" tab
```

### Step 3: Try Login
```
📧 Email: abc@gmail.com
🔑 Password: password123
```

## 🔍 What to Watch in Console:

### Successful Login Logs:
```
🔐 Login attempt: {email: "abc@gmail.com"}
📤 Sending login request to: http://localhost:5000/api/auth/login
📧 Email: abc@gmail.com
🔑 Password length: 11
📥 Login response: {success: true, ...}
✅ Login successful!
👤 User: abc
📧 Email: abc@gmail.com
🎟️ Token received: Yes
💾 Saved to localStorage
🔀 Redirecting to user dashboard
```

### If Login Fails - Check These:

#### Error: "Invalid email or password"
**Cause:** Backend received request but credentials don't match
**Solution:**
```powershell
# Run this to verify database:
cd backend
node create-test-users.js
```

#### Error: "Network Error" or "Failed to fetch"
**Cause:** Backend not running or CORS issue
**Solution:**
```powershell
# Check if backend is running:
netstat -ano | findstr "5000"

# Should show: TCP 0.0.0.0:5000 LISTENING

# If not running, start it:
cd backend
node server.js
```

#### Error: Nothing happens, no logs
**Cause:** Frontend JavaScript not loading
**Solution:**
```
1. Hard refresh: Ctrl+Shift+R
2. Check console for errors
3. Restart frontend: npm start
```

## 🧪 Manual Test Commands:

### Test 1: Check Backend Login
```powershell
$body = @{email="abc@gmail.com"; password="password123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```
**Expected:** Should return user data and token

### Test 2: Check Database
```powershell
cd backend
node create-test-users.js
```
**Expected:** Should show both users exist

### Test 3: Check Frontend Connection
```
1. Open: http://localhost:3000
2. Open console (F12)
3. Type: localStorage.clear()
4. Refresh page
5. Try login again
```

## 🔧 Common Issues & Fixes:

### Issue: "Still shows Welcome, User!"
**Not a login issue** - This is dashboard loading
**Fix:** Check [LOGIN_GUIDE.md](LOGIN_GUIDE.md) section on Dashboard

### Issue: "MetaMask error"
**Not a login issue** - MetaMask is separate
**Fix:** First login, then connect MetaMask

### Issue: "Redirect loop"
**Cause:** Token validation in api.ts interceptor
**Fix:** 
```javascript
// Clear storage and try again
localStorage.clear()
```

### Issue: "CORS error"
**Cause:** Frontend/Backend port mismatch
**Check:**
```
1. Frontend should be on: http://localhost:3000
2. Backend should be on: http://localhost:5000
3. Check .env files have correct URLs
```

## 📋 Verification Checklist:

Before reporting issue, verify:
- [ ] Servers are running (netstat shows 3000 and 5000)
- [ ] Using incognito window (no cache)
- [ ] Console is open (F12)
- [ ] Using correct email: abc@gmail.com
- [ ] Using correct password: password123
- [ ] No typos in email/password
- [ ] Backend test command works
- [ ] Console shows login attempt logs

## 🎓 Understanding the Login Flow:

```
1. User enters credentials
   └─> Console: "🔐 Login attempt"

2. Frontend sends POST to /api/auth/login
   └─> Console: "📤 Sending login request"

3. Backend receives request
   └─> Finds user in MongoDB
   └─> Compares password hash
   └─> Returns token + user data

4. Frontend receives response
   └─> Console: "📥 Login response"
   └─> Saves token to localStorage
   └─> Console: "💾 Saved to localStorage"
   └─> Redirects to dashboard
   └─> Console: "🔀 Redirecting"
```

## 💡 Pro Tips:

1. **Always check console first** - All errors are logged there
2. **Use incognito** - Avoids cache issues
3. **Hard refresh** - Ctrl+Shift+R loads fresh code
4. **Clear localStorage** - Run `localStorage.clear()` in console
5. **Check network tab** - F12 → Network → See API requests

## 📞 Still Not Working?

If login still fails after trying everything:

1. **Take screenshots of:**
   - Login page with credentials entered
   - Browser console (all logs)
   - Network tab (failed request)
   - Backend terminal output

2. **Check backend terminal** for error messages

3. **Verify credentials** one more time:
   - Email: `abc@gmail.com` (all lowercase)
   - Password: `password123` (exactly as shown)

---

**Last Updated:** After password reset and login enhancement
**Status:** Backend tested and working ✅
**Test Account:** abc@gmail.com / password123 ✅
