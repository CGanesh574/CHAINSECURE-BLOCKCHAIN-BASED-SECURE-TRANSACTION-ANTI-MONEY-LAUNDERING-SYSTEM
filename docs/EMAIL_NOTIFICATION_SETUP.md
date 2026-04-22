# Email Notification Setup Guide

## ✅ Implementation Complete!

All email notification features have been successfully implemented. Follow the steps below to configure and test the system.

---

## 📧 Features Implemented

### 1. Contact Form Email Notifications
- Contact form submissions are now sent to **ganeshh1357@gmail.com**
- Includes sender's name, email, subject, and message
- Professional HTML email template with reply-to functionality

### 2. Account Blocking Email Notifications
- Automatically sends email when AML rules are violated
- Email includes:
  - List of violated AML rules with severity levels
  - Detailed reasons for each violation
  - Contact information for support
  - Instructions on how to appeal

### 3. Account Unblocking Email Notifications
- Sends email when admin unblocks a user account
- Email includes:
  - Welcome back message
  - Information about previous violation (resolved)
  - Reminders about AML compliance
  - Support contact information

---

## 🔧 Setup Instructions

### Step 1: Generate Gmail App Password

Since you're using **ganeshh1357@gmail.com**, you need to generate an App Password:

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com

2. **Enable 2-Factor Authentication (if not already enabled):**
   - Go to: Security → 2-Step Verification
   - Follow the prompts to enable it

3. **Generate App Password:**
   - Go to: Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Select "Windows Computer" as the device
   - Click "Generate"
   - **Copy the 16-character password** (example: `abcd efgh ijkl mnop`)

### Step 2: Configure Email in .env File

1. Open the file: `backend/.env`

2. Find this line:
   ```
   EMAIL_PASSWORD=your_app_password_here
   ```

3. Replace `your_app_password_here` with your actual App Password (remove spaces):
   ```
   EMAIL_PASSWORD=abcdefghijklmnop
   ```

4. Save the file

### Step 3: Restart Backend Server

If your backend server is already running, restart it to load the new email configuration:

```powershell
# Stop the current backend server (Ctrl+C)
# Then restart it
cd backend
npm start
```

---

## 🧪 Testing the Features

### Test 1: Contact Form
1. Go to: http://localhost:3000/contact
2. Fill in the form with:
   - Your name
   - Your email
   - A subject
   - A message
3. Click "Send Message"
4. Check ganeshh1357@gmail.com inbox for the email

### Test 2: Account Blocking Email
1. Create a test user account
2. Perform transactions that violate AML rules (e.g., high amount, rapid transactions)
3. When account gets blocked, check the user's email inbox
4. You should receive a detailed email about the violation

### Test 3: Account Unblocking Email
1. Login as admin
2. Go to blocked users list
3. Unblock a user
4. Check the user's email inbox for unblock notification

---

## 📝 Files Modified

### Backend Files Created:
- ✅ `backend/services/emailService.js` - Email service with Gmail SMTP
- ✅ `backend/routes/contact.js` - Contact form API endpoint
- ✅ `backend/.env.example` - Example environment configuration

### Backend Files Modified:
- ✅ `backend/.env` - Added email configuration
- ✅ `backend/server.js` - Registered contact route
- ✅ `backend/services/amlEngine.js` - Added email on account block
- ✅ `backend/routes/admin.js` - Added email on account unblock
- ✅ `backend/package.json` - Added nodemailer dependency

### Frontend Files Modified:
- ✅ `frontend/src/pages/Contact.tsx` - Updated to send to backend API
- ✅ Updated support email to ganeshh1357@gmail.com

---

## 🎨 Email Templates

### Contact Form Email
- Professional design with sender information
- Includes reply-to for easy response
- Timestamp of submission

### Account Blocked Email
- ⚠️ Red/warning theme
- Detailed list of violated rules with severity
- Clear contact information
- Instructions for appeal

### Account Unblocked Email
- ✅ Green/success theme
- Welcome back message
- Previous violation information
- Compliance reminders

---

## 🔍 Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution:** Your App Password is incorrect or not set. Follow Step 1 above to generate it.

### Emails not sending
**Check:**
1. App Password is correctly set in `.env` file (no spaces)
2. Backend server was restarted after updating `.env`
3. Internet connection is available
4. Check backend console for error messages

### Email goes to spam
**Solution:** This is normal for new email services. Check spam folder and mark as "Not Spam"

---

## 📞 Support Email Configuration

All emails reference the support email: **ganeshh1357@gmail.com**

This email is shown in:
- Contact page
- Account blocked emails (for user to contact support)
- Account unblocked emails (for questions)

---

## 🚀 Ready to Use!

Your email notification system is now fully configured and ready to use. Just add your Gmail App Password to the `.env` file and restart the backend server!

**Note:** Keep your `.env` file secure and never commit it to version control (it's already in `.gitignore`).
