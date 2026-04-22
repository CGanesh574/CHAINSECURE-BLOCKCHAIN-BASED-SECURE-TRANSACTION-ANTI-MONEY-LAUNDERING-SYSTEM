# Support Center - Quick Testing Guide

## Prerequisites
- Backend server running on http://localhost:5000
- Frontend running on http://localhost:3000
- MongoDB connected
- At least one user account registered
- Admin account available

## Test Scenario 1: User Creates Support Ticket

### Steps:
1. **Login as a regular user**
   - Go to http://localhost:3000
   - Login with user credentials

2. **Open Support Center**
   - In the User Dashboard, you'll see action cards
   - Click on the "💬 Support Center" card
   - A full-screen modal will open

3. **Create New Ticket**
   - Click "Create New Ticket" button
   - Fill in the form:
     * **Category**: Select "Account Blocking Issue"
     * **Subject**: Enter "Cannot send transactions after KYC"
     * **Message**: Enter detailed description of your issue
     * **Documents**: Click "Choose Files" and select 1-3 documents (images or PDFs)
   
4. **Submit Ticket**
   - Click "Create Ticket" button
   - Success message should appear: "Support ticket created successfully!"
   - The modal closes automatically
   - Ticket appears in your ticket list

5. **View Ticket Details**
   - Click "View Details" on your newly created ticket
   - Verify:
     * ✅ Ticket ID is displayed (e.g., TICKET-1234567890-ABC123)
     * ✅ Status badge shows "OPEN"
     * ✅ Priority badge shows "HIGH" (auto-assigned for Account Blocking)
     * ✅ Your message is displayed
     * ✅ All uploaded documents are listed
     * ✅ "No replies yet" message is shown

6. **Download Documents**
   - Click "Download" button next to each document
   - Verify files download correctly

## Test Scenario 2: Admin Responds to Ticket

### Steps:
1. **Logout and login as Admin**
   - Logout from user account
   - Login with admin credentials
   - Navigate to Admin Dashboard

2. **Access Support Center**
   - Click on "💬 Support Center" tab in Admin Dashboard
   - Statistics cards display:
     * Total Tickets
     * Open Tickets
     * In Progress
     * Resolved
     * Closed

3. **View Ticket List**
   - Locate the ticket created by the user
   - Verify table shows:
     * ✅ Ticket ID
     * ✅ User name and email
     * ✅ Category: "ACCOUNT BLOCKING"
     * ✅ Subject
     * ✅ Status: "OPEN"
     * ✅ Priority: "HIGH"
     * ✅ Created date/time

4. **Open Ticket Details**
   - Click "View" button on the ticket
   - Modal opens showing:
     * ✅ User Information section (name, email, wallet address)
     * ✅ Ticket Management section (status and priority dropdowns)
     * ✅ Original user message
     * ✅ Attached documents with download buttons
     * ✅ Empty conversation section

5. **Download User Documents**
   - Click "Download" on each document
   - Verify files are the ones user uploaded

6. **Update Ticket Status** (Optional)
   - Change Status dropdown to "IN PROGRESS"
   - Change Priority if needed
   - Click "Update Ticket" button
   - Success message appears
   - Badge colors update

7. **Reply to User**
   - Scroll to "Send Reply to User" section
   - Type a message: "Thank you for contacting support. We've reviewed your account and will unblock it within 24 hours."
   - Click "Send Reply" button
   - Reply appears in conversation with "Admin" badge
   - Status automatically changes to "IN_PROGRESS"

## Test Scenario 3: User Views Admin Reply

### Steps:
1. **Switch back to user account**
   - Logout from admin
   - Login with user credentials
   - Open User Dashboard

2. **Open Support Center**
   - Click "💬 Support Center" card
   - Your ticket now shows "1 replies" badge

3. **View Conversation**
   - Click "View Details" on the ticket
   - Verify:
     * ✅ Status changed to "IN_PROGRESS"
     * ✅ Admin reply is visible with "Admin" badge
     * ✅ Reply message content is correct
     * ✅ Reply timestamp is displayed

4. **Reply to Admin**
   - Type a response in the reply box: "Thank you for the quick response!"
   - Click "Send Reply" button
   - Your reply appears in the conversation
   - No "Admin" badge on your reply

## Test Scenario 4: Admin Resolves Ticket

### Steps:
1. **Login as Admin**
   - Access Admin Dashboard → Support Center tab

2. **Filter Tickets**
   - Use Status filter dropdown: select "IN_PROGRESS"
   - Verify only in-progress tickets are shown
   - Use Priority filter dropdown: select "HIGH"
   - Verify filtering works

3. **View Updated Ticket**
   - Click "View" on the ticket with user's reply
   - Verify user's new reply is visible in conversation

4. **Mark as Resolved**
   - Change Status dropdown to "RESOLVED"
   - Click "Update Ticket"
   - Success message appears

5. **Verify Statistics**
   - Close modal
   - Check statistics cards updated:
     * Open count decreased
     * Resolved count increased

## Test Scenario 5: File Upload Validation

### Steps:
1. **Test File Size Limit**
   - Create new ticket as user
   - Try uploading a file larger than 5MB
   - Should show error (handled by browser/multer)

2. **Test File Type Validation**
   - Try uploading unsupported file type (.txt, .doc, .exe)
   - Should be rejected or not selectable

3. **Test Multiple Files**
   - Upload 5 files at once
   - All should upload successfully
   - Try uploading 6 files - should be limited to 5

## Expected Results Summary

### User Features Working:
- ✅ Can create tickets with category selection
- ✅ Can upload documents (JPEG, PNG, PDF)
- ✅ Can view all own tickets
- ✅ Can see ticket status and priority
- ✅ Can view conversation history
- ✅ Can reply to admin messages
- ✅ Can download own uploaded documents
- ✅ Proper badges for status/priority
- ✅ Ticket list shows reply count

### Admin Features Working:
- ✅ Can view all tickets from all users
- ✅ Statistics dashboard shows accurate counts
- ✅ Can filter by status and priority
- ✅ Can view user information for each ticket
- ✅ Can update ticket status and priority
- ✅ Can download user-uploaded documents
- ✅ Can reply to tickets
- ✅ Replies auto-update status to IN_PROGRESS
- ✅ Can mark tickets as resolved
- ✅ Conversation shows admin/user distinction

### Technical Working:
- ✅ Files stored in MongoDB
- ✅ File downloads work correctly
- ✅ Authorization prevents users from seeing others' tickets
- ✅ Ticket IDs are unique and properly formatted
- ✅ Timestamps display in readable format
- ✅ Status workflow enforced
- ✅ Priority levels display with correct colors

## Common Issues to Check

### If ticket creation fails:
- Check backend server is running
- Check MongoDB connection
- Check browser console for API errors
- Verify JWT token is valid

### If file upload fails:
- Verify file size < 5MB
- Verify file type is JPEG, PNG, or PDF
- Check multer is installed: `npm list multer` in backend directory
- Check backend logs for multer errors

### If download doesn't work:
- Check API endpoint `/api/support/document/:ticketId/:index`
- Verify user has authorization to download
- Check Content-Type header is set correctly

### If admin can't see tickets:
- Verify admin role in JWT token
- Check `/api/support/admin/all-tickets` endpoint
- Verify isAdmin middleware is working

## API Endpoints to Test in Postman (Optional)

### Create Ticket
```
POST http://localhost:5000/api/support/create
Headers: Authorization: Bearer <token>
Body: form-data
  - category: KYC_VERIFICATION
  - subject: Test Ticket
  - message: This is a test
  - documents: [files]
```

### Get My Tickets
```
GET http://localhost:5000/api/support/my-tickets
Headers: Authorization: Bearer <token>
```

### Get All Tickets (Admin)
```
GET http://localhost:5000/api/support/admin/all-tickets
Headers: Authorization: Bearer <admin-token>
```

### Get Statistics (Admin)
```
GET http://localhost:5000/api/support/admin/stats
Headers: Authorization: Bearer <admin-token>
```

### Update Status (Admin)
```
PUT http://localhost:5000/api/support/admin/update-status/TICKET-123456-ABC
Headers: Authorization: Bearer <admin-token>
Body: JSON
{
  "status": "RESOLVED",
  "priority": "HIGH"
}
```

## Success Indicators
✅ Users can create tickets and upload files
✅ Admins can view and manage all tickets
✅ Two-way communication works
✅ File uploads and downloads work
✅ Status and priority updates work
✅ Filtering works
✅ Statistics update correctly
✅ Authorization prevents unauthorized access
✅ UI is responsive and user-friendly
✅ No console errors
✅ Database stores tickets correctly
