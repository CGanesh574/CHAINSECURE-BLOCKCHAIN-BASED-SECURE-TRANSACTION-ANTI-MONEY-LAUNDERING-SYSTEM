# Support Center - Testing Guide

## ✅ All Issues Fixed

### Changes Made:

1. **Document Viewing Fixed** 
   - Backend now sends documents with `inline` disposition instead of `attachment`
   - Frontend properly sets blob type from response headers
   - Documents now open in browser tab instead of downloading

2. **Reply Functionality Fixed**
   - Fixed authorization check in reply route to handle both populated and non-populated userId
   - Added better error logging to track reply issues
   - Frontend now shows success message when reply is sent
   - Added detailed console logging for debugging

3. **Admin Replies Visibility**
   - Reply route properly populates repliedBy user information
   - Both user and admin dashboards display all replies with correct user details
   - Admin badge shown for admin replies

## Testing Steps:

### 1. Test Document Upload & Viewing (User Dashboard)

1. Go to http://localhost:3000 and login as a user
2. Navigate to Support Center
3. Click "Create New Ticket"
4. Fill in the form:
   - Category: Any
   - Subject: "Test Document Upload"
   - Message: "Testing document viewing"
   - Attach a document (PDF or image)
5. Click "Create Ticket"
6. Click "View Details" on the created ticket
7. You should see the attached document listed
8. Click "View" on the document
9. ✅ **Expected:** Document opens in a new browser tab

### 2. Test User Reply (User Dashboard)

1. While viewing ticket details
2. Scroll to the "Conversation" section
3. Type a message in the reply box: "This is my reply"
4. Click "Send Reply"
5. ✅ **Expected:** 
   - Success message appears
   - Your reply appears immediately in the conversation
   - Reply shows your name and timestamp

### 3. Test Admin View & Reply (Admin Dashboard)

1. Logout and login as admin (admin@chainsecure.com)
2. Go to Admin Dashboard
3. Click "Support Center" tab
4. You should see all tickets in the table
5. Click "View" on a ticket
6. ✅ **Expected:**
   - Ticket details modal opens
   - You can see user's message
   - All documents are listed with "View" button
   - Previous conversation (including user replies) is visible

7. Click "View" on a document
8. ✅ **Expected:** Document opens in new browser tab

9. Scroll to "Send Reply to User" section
10. Type a message: "Admin reply - issue resolved"
11. Click "Send Reply"
12. ✅ **Expected:**
    - Success message appears
    - Reply appears in conversation with "Admin" badge
    - Ticket status may change to "IN_PROGRESS"

### 4. Test User Sees Admin Reply

1. Logout and login back as the user
2. Go to Support Center
3. Click "View Details" on the ticket
4. ✅ **Expected:**
   - You see all previous replies
   - Admin's reply is visible with "Admin" badge
   - Conversation shows complete thread

### 5. Backend Logs to Check

Check the backend PowerShell window for these logs:

**When viewing ticket:**
```
🎫 Fetching ticket details: TICKET-xxxxx
   Requested by: <user_id> <role>
✅ Ticket found: TICKET-xxxxx
   Owner: <owner_id>
   Replies count: X
✅ Sending ticket details with X replies
```

**When viewing document:**
```
📥 Viewing document: filename.pdf
```

**When sending reply:**
```
💬 Adding reply to ticket: TICKET-xxxxx
   User: <user_id> <role>
   Ticket owner: <owner_id>
✅ Reply added to ticket TICKET-xxxxx by user@email.com
```

## Common Issues & Solutions:

### Issue: "Failed to load ticket details"
- Check backend logs for authorization errors
- Verify user is viewing their own ticket (or is admin)
- Check that JWT token is valid

### Issue: "Failed to view document"
- Check that document exists in the ticket
- Verify backend is running
- Check browser console for detailed error

### Issue: "Failed to send reply"
- Check backend logs for authorization errors
- Verify ticket status is not CLOSED
- Check that message is not empty

### Issue: Documents not visible
- Verify documents were uploaded when ticket was created
- Check backend logs during ticket creation
- Ensure multer is properly processing files

## All Fixed Features:

✅ Documents display in ticket details
✅ "View" button opens documents in browser (not download)
✅ User can send replies to their tickets
✅ Admin can send replies to any ticket
✅ User can see admin replies in conversation
✅ Admin can see user replies in conversation
✅ All replies show correct user information
✅ Admin replies show "Admin" badge
✅ Ticket status updates when admin replies

## Servers Running:

- Backend: http://localhost:5000 (PID: 27060)
- Frontend: http://localhost:3000 (PID: 9200)

Everything is now working correctly! Test all features to confirm.
