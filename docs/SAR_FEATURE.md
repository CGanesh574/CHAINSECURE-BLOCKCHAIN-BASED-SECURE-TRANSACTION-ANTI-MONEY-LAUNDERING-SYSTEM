# SAR (Suspicious Activity Report) Feature

## Overview
The SAR feature automatically generates detailed investigation reports when user accounts are blocked due to AML violations. These reports are formatted, searchable, and downloadable as PDFs for compliance and investigation purposes.

## Features Implemented

### 1. Automatic SAR Generation
- ✅ SAR reports are automatically created when accounts are blocked
- ✅ Report ID format: `SAR-{timestamp}-{userId}`
- ✅ Contains complete account details, violation information, and transaction data
- ✅ Timestamps and audit trail included

### 2. Detailed Report Information
Each SAR report contains:
- **Account Information**: Name, email, phone, age, gender, wallet address
- **Violation Details**: Type, severity, and all violated AML rules
- **Transaction Details**: Hash, amount, from/to addresses, timestamp
- **Investigation Status**: Pending/Reviewed/Escalated/Closed
- **Investigation Notes**: Admin notes and observations
- **Audit Trail**: Who reviewed it and when

### 3. Search and Filter Capabilities
- 🔍 **Search by**:
  - Report ID
  - Wallet address
  - User email
  - User name
  
- 📊 **Filter by**:
  - Status (Pending, Reviewed, Escalated, Closed)
  - Date range (start date to end date)
  
- 📈 **Statistics Dashboard**: Shows count of reports by status

### 4. PDF Download
- ✅ Professional PDF format with proper formatting
- ✅ Structured sections: Account Info, Wallet Info, Violation Details, Transaction Details, Investigation Status
- ✅ Color-coded severity indicators
- ✅ ChainSecure branding with gradient headers
- ✅ Download as: `SAR_{reportId}.pdf`

### 5. Admin Management
- 👁️ **View Details**: Full report details in modal
- 📝 **Update Status**: Change investigation status
- 📋 **Add Notes**: Investigation notes for each report
- 💾 **Save Changes**: Update and track review progress
- 📥 **Download**: Export as PDF for external use

## File Structure

### Backend Files
```
backend/
├── models/
│   └── SARReport.js              # MongoDB schema for SAR reports
├── routes/
│   └── sar.js                    # API endpoints for SAR operations
└── services/
    └── amlEngine.js              # Modified to generate SARs on block
```

### Frontend Files
```
frontend/src/pages/
├── AdminDashboard.tsx            # Added SAR Reports tab
└── AdminDashboard.css            # SAR-specific styles
```

## API Endpoints

### GET /api/sar/reports
- Get all SAR reports with search and filters
- Query params: `search`, `status`, `startDate`, `endDate`
- Returns: List of reports with user details

### GET /api/sar/reports/:id
- Get single SAR report details
- Returns: Full report with populated user and reviewer info

### GET /api/sar/reports/:id/download
- Download SAR report as PDF
- Returns: PDF file stream

### PUT /api/sar/reports/:id
- Update SAR report status and notes
- Body: `{ status, investigationNotes }`
- Returns: Updated report

### GET /api/sar/stats
- Get SAR statistics
- Returns: Counts by status and recent reports

## Database Schema

```javascript
{
  reportId: String (unique),
  userId: ObjectId (ref: User),
  walletAddress: String,
  userDetails: {
    name, email, phone, age, gender
  },
  violationType: String,
  violatedRules: [{
    ruleName, severity, reason, timestamp
  }],
  transactionDetails: {
    transactionHash, amount, timestamp, from, to
  },
  blockTimestamp: Date,
  status: enum [PENDING, REVIEWED, ESCALATED, CLOSED],
  investigationNotes: String,
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date
}
```

## UI/UX Features

### SAR Reports Tab
- Located after "KYC Management" tab in Admin Dashboard
- Shows count of total SAR reports in tab badge
- Grid layout for search filters
- Statistics cards showing counts by status

### Report Table
- Displays: Report ID, User, Wallet, Violation Type, Rules Violated, Block Date, Status
- Actions: View (👁️) and Download (📥) buttons
- Color-coded status badges
- Truncated wallet addresses for readability

### SAR Details Modal
- Full-screen scrollable modal
- Organized sections with gradient headers
- Editable status dropdown
- Text area for investigation notes
- Real-time update of review information
- Quick download button in modal

## Color Scheme

### Status Colors
- **PENDING**: Yellow (#fef3c7)
- **REVIEWED**: Blue (#dbeafe)
- **ESCALATED**: Red (#fee2e2)
- **CLOSED**: Green (#d1fae5)

### Severity Colors
- **CRITICAL**: Dark Red (#fee2e2)
- **HIGH**: Orange (#fed7aa)
- **MEDIUM**: Yellow (#fef3c7)
- **LOW**: Blue (#dbeafe)

## Workflow

1. **Account Blocked** → SAR automatically generated
2. **Admin Views SAR Reports Tab** → See all reports with filters
3. **Admin Searches/Filters** → Find specific reports
4. **Admin Views Details** → Review full report information
5. **Admin Updates Status** → Mark as Reviewed/Escalated/Closed
6. **Admin Adds Notes** → Document investigation findings
7. **Admin Downloads PDF** → Export for regulatory compliance

## Integration Points

### AML Engine Integration
- Modified `blockUser()` function in `amlEngine.js`
- Automatically creates SAR when account is blocked
- Passes full transaction object for complete details
- Links violations to specific AML rules

### Server Integration
- SAR routes registered in `server.js`
- Authentication middleware applied
- Admin-only access enforced
- Error handling for all operations

## Security & Compliance

- 🔒 **Admin-Only Access**: All SAR endpoints require admin authentication
- 📝 **Audit Trail**: All reviews tracked with user and timestamp
- 🔐 **Sensitive Data Protection**: Proper access control
- 📊 **Regulatory Compliance**: Structured format for investigations

## Testing Checklist

### Backend Testing
- [x] SAR model creation
- [x] Automatic generation on account block
- [x] GET all reports with filters
- [x] GET single report
- [x] UPDATE report status and notes
- [x] Download PDF generation
- [x] GET statistics

### Frontend Testing
- [ ] SAR tab displays correctly
- [ ] Search functionality works
- [ ] Status filter works
- [ ] Date range filter works
- [ ] View modal shows complete data
- [ ] Update status saves correctly
- [ ] Investigation notes save correctly
- [ ] PDF download works
- [ ] Statistics update correctly

## Future Enhancements

1. **Export Multiple Reports**: Bulk PDF export
2. **Email Notifications**: Alert admins of new SARs
3. **Advanced Analytics**: Trends and patterns
4. **Risk Scoring**: Automated risk assessment
5. **Integration with External Systems**: Regulatory reporting
6. **Report Templates**: Customizable PDF formats
7. **Attachment Support**: Add supporting documents

## Installation & Setup

### Backend Dependencies
```bash
cd backend
npm install pdfkit
```

### Environment Variables
No additional environment variables required. Uses existing MongoDB connection.

### Database Migration
No migration needed. New collection `sarreports` will be created automatically.

## Usage Instructions

### For Admins
1. Navigate to Admin Dashboard
2. Click on "📋 SAR Reports" tab
3. Use search and filters to find reports
4. Click 👁️ to view full details
5. Click 📥 to download PDF
6. Update status and add notes as needed
7. Click "Save Changes" to update

### For Developers
```javascript
// Access SAR from AML Engine
const sarReport = await SARReport.create({
  reportId: `SAR-${Date.now()}-${userId}`,
  userId: user._id,
  walletAddress: user.walletAddress,
  // ... other fields
});
```

## Notes

- SAR reports are permanent records and cannot be deleted
- Only status and notes can be updated after creation
- PDF generation happens server-side for security
- All updates are logged with reviewer information
- Reports are automatically indexed for fast search

## Support

For questions or issues, refer to:
- Backend: `backend/routes/sar.js`
- Frontend: `frontend/src/pages/AdminDashboard.tsx`
- Model: `backend/models/SARReport.js`
