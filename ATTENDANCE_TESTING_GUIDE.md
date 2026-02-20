# QR Scanner & Attendance Tracking - Testing Guide

## Prerequisites
- ✅ Backend server running on `http://localhost:5000`
- ✅ Frontend server running on `http://localhost:5173`
- ✅ MongoDB database connected
- ✅ At least one organizer account
- ✅ At least one published/ongoing event with registered participants

---

## Testing Checklist

### Phase 1: Database Schema ✅
- [x] Participation model updated with attendance fields
- [x] Fields added: attendanceStatus, checkInTime, checkInBy, scanCount, manualOverride, etc.

### Phase 2: Backend API Testing

#### 1. Test QR Code Scanning Endpoint
**Endpoint:** `POST /api/attendance/scan`

**Test Cases:**
- [ ] Valid QR code → Check-in successful
- [ ] Invalid QR code format → Error message
- [ ] Duplicate scan → "Already scanned" error
- [ ] QR code for different event → "Not valid for this event" error
- [ ] Cancelled ticket → "Ticket cancelled" error
- [ ] Pending payment → "Payment pending" error
- [ ] Unauthorized organizer → "Not authorized" error

**How to Test:**
1. Login as organizer
2. Navigate to event detail page
3. Click "📷 Attendance Tracking"
4. Use Camera or File Upload scanner
5. Scan a participant's QR code

**Expected Result:** Success modal with participant details and check-in time

---

#### 2. Test Manual Check-in Endpoint
**Endpoint:** `POST /api/attendance/manual-checkin`

**Test Cases:**
- [ ] Valid manual check-in with reason → Success
- [ ] Reason too short (< 10 chars) → Validation error
- [ ] Missing reason → Error
- [ ] Manual check-in for already checked-in participant → Override allowed
- [ ] Unauthorized organizer → Error

**How to Test:**
1. Go to Dashboard tab
2. Find a "Not Scanned" participant
3. Click "✋ Manual" button
4. Enter reason (min 10 characters)
5. Click "Confirm Check-In"

**Expected Result:** Participant marked as checked-in with manual override flag

---

#### 3. Test Attendance Dashboard Endpoint
**Endpoint:** `GET /api/attendance/dashboard/:eventId`

**Test Cases:**
- [ ] Valid event ID → Returns statistics and participant list
- [ ] Unauthorized organizer → Error
- [ ] Invalid event ID → Error
- [ ] Statistics match actual data

**How to Test:**
1. Navigate to Dashboard tab
2. Check statistics cards display correct numbers
3. Verify participant list shows all registered participants

**Expected Result:** 
- Total participants count
- Checked-in count
- Not scanned count
- Manual overrides count
- Check-in percentage

---

#### 4. Test CSV Export Endpoint
**Endpoint:** `GET /api/attendance/export/:eventId`

**Test Cases:**
- [ ] Valid export → CSV file downloads
- [ ] CSV contains all required columns
- [ ] Data matches dashboard
- [ ] Unauthorized organizer → Error

**How to Test:**
1. Click "📥 Export CSV" button
2. Check downloaded file

**Expected CSV Columns:**
- Ticket ID
- Participant Name
- Email
- Phone
- Attendance Status
- Check-in Time
- Checked-in By
- Manual Override
- Override Reason

---

#### 5. Test Participation Status Endpoint
**Endpoint:** `GET /api/attendance/status/:participationId`

**Test Cases:**
- [ ] Organizer can view status
- [ ] Participant can view their own status
- [ ] Unauthorized user → Error

---

### Phase 3: Frontend QR Scanner Testing

#### Camera Scanner Component
**Test Cases:**
- [ ] Camera permission request appears
- [ ] Camera permission granted → Scanner starts
- [ ] Camera permission denied → Error message with retry button
- [ ] Multiple cameras detected → Dropdown appears
- [ ] Switch between front/back camera
- [ ] QR code detected → Immediate processing
- [ ] Invalid QR code → Error message
- [ ] Scanner stops after successful scan

**How to Test:**
1. Go to Scanner tab
2. Click "📷 Camera" mode
3. Allow camera access
4. Point camera at QR code
5. Wait for auto-detection

---

#### File Upload Scanner Component
**Test Cases:**
- [ ] File upload button visible
- [ ] Only image files accepted
- [ ] File size validation (max 10MB)
- [ ] Valid QR code image → Success
- [ ] Image without QR code → Error message
- [ ] File input resets after scan

**How to Test:**
1. Go to Scanner tab
2. Click "📁 Upload File" mode
3. Click "Choose File"
4. Select QR code image
5. Check result

---

#### Scan Result Modal Component
**Test Cases:**
- [ ] Success modal shows participant details
- [ ] Error modal shows error message
- [ ] Duplicate modal shows "Already checked in"
- [ ] Close button works
- [ ] "Scan Next" / "Try Again" buttons work
- [ ] Modal animations work smoothly

---

### Phase 4: Frontend Dashboard Testing

#### Attendance Statistics
**Test Cases:**
- [ ] All 5 stat cards display correctly
- [ ] Numbers update after check-in
- [ ] Percentage calculation correct
- [ ] Color coding appropriate

---

#### Participant List
**Test Cases:**
- [ ] All participants displayed
- [ ] Search by name works
- [ ] Search by email works
- [ ] Search by ticket ID works
- [ ] Filter by "All Status" works
- [ ] Filter by "Checked In" works
- [ ] Filter by "Not Scanned" works
- [ ] Sort by Name (A-Z)
- [ ] Sort by Time (latest first)
- [ ] Sort by Status
- [ ] Status badges display correctly
- [ ] Manual override badge appears
- [ ] Refresh button updates data
- [ ] Empty state shows when no results

---

#### Manual Check-in Modal
**Test Cases:**
- [ ] Modal opens when "✋ Manual" clicked
- [ ] Participant info displays correctly
- [ ] Warning message visible
- [ ] Reason textarea accepts input
- [ ] Character counter updates
- [ ] Validation: < 10 chars → Error
- [ ] Cancel button closes modal
- [ ] Confirm button submits
- [ ] Loading state during submission
- [ ] Success → Dashboard refreshes

---

### Phase 5: Integration Testing

#### Event Detail Page
**Test Cases:**
- [ ] "📷 Attendance Tracking" button visible for published events
- [ ] "📷 Attendance Tracking" button visible for ongoing events
- [ ] "📷 Attendance Tracking" button NOT visible for draft events
- [ ] "📷 Attendance Tracking" button NOT visible for completed events
- [ ] Button navigates to correct URL
- [ ] Button has correct styling

---

#### Event Attendance Page
**Test Cases:**
- [ ] Page loads correctly
- [ ] Event name displays
- [ ] Event date displays
- [ ] Tab navigation works
- [ ] Scanner tab shows QR scanner
- [ ] Dashboard tab shows attendance dashboard
- [ ] Export CSV button works
- [ ] Back button returns to event detail
- [ ] URL routing correct: `/organizer/events/:id/attendance`
- [ ] Protected route (organizer only)

---

## End-to-End Testing Scenarios

### Scenario 1: Complete Check-in Flow
1. [ ] Login as organizer
2. [ ] Navigate to published event
3. [ ] Click "📷 Attendance Tracking"
4. [ ] Scan participant QR code (camera or file)
5. [ ] See success modal
6. [ ] Switch to Dashboard tab
7. [ ] Verify participant shows as "Checked In"
8. [ ] Verify statistics updated
9. [ ] Export CSV
10. [ ] Verify data in CSV

---

### Scenario 2: Duplicate Scan Prevention
1. [ ] Check-in a participant successfully
2. [ ] Try to scan the same QR code again
3. [ ] Verify "Already checked in" error
4. [ ] Check scanCount increased to 2
5. [ ] Verify participant still shows as checked-in (not duplicate record)

---

### Scenario 3: Manual Override Flow
1. [ ] Go to Dashboard
2. [ ] Find not-scanned participant
3. [ ] Click "✋ Manual"
4. [ ] Enter reason: "Phone battery dead, verified ID manually"
5. [ ] Confirm check-in
6. [ ] Verify manualOverride = true
7. [ ] Verify overrideReason stored
8. [ ] Check "⚠ Manual" badge appears
9. [ ] Export CSV and verify override data

---

### Scenario 4: Search & Filter
1. [ ] Go to Dashboard
2. [ ] Search for specific participant name
3. [ ] Verify filtered results
4. [ ] Clear search
5. [ ] Filter by "Checked In"
6. [ ] Verify only checked-in participants shown
7. [ ] Filter by "Not Scanned"
8. [ ] Sort by Time
9. [ ] Verify correct order

---

### Scenario 5: Real-time Updates
1. [ ] Open Dashboard in browser
2. [ ] Open Scanner in another tab/device
3. [ ] Scan a QR code in Scanner tab
4. [ ] Click Refresh in Dashboard tab
5. [ ] Verify new check-in appears immediately

---

## Error Handling Testing

### Network Errors
- [ ] Backend down → Error message displays
- [ ] Slow network → Loading states work
- [ ] Timeout → Appropriate error

### Permission Errors
- [ ] Non-organizer tries to access → Redirected
- [ ] Organizer A tries to scan for Organizer B's event → Error

### Validation Errors
- [ ] Invalid QR data → User-friendly error
- [ ] Corrupted QR code → Handled gracefully
- [ ] Missing required fields → Clear messages

---

## Performance Testing
- [ ] Scanner responds within 1-2 seconds
- [ ] Dashboard loads within 2-3 seconds
- [ ] Search/filter instant response
- [ ] Large participant lists (100+) perform well
- [ ] CSV export for 500+ participants works

---

## Mobile Testing
- [ ] Camera scanner works on mobile
- [ ] Touch interactions work
- [ ] Responsive design adapts
- [ ] File upload works on mobile
- [ ] Dashboard readable on small screens

---

## Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Security Testing
- [ ] JWT authentication required
- [ ] Role-based access control works
- [ ] Organizer can only access own events
- [ ] SQL injection attempts prevented
- [ ] XSS attempts sanitized
- [ ] Rate limiting works

---

## Audit Trail Verification
- [ ] checkInBy stores correct organizer ID
- [ ] checkInTime accurate
- [ ] overrideBy tracked for manual check-ins
- [ ] overrideReason stored
- [ ] overrideTimestamp recorded
- [ ] scanCount increments correctly

---

## Known Issues / Edge Cases
- [ ] What happens if event has 0 participants?
- [ ] What happens if all participants already checked in?
- [ ] Can organizer manually check-in same person twice?
- [ ] What if QR code is for old/expired ticket?
- [ ] Camera access denied on iOS Safari?

---

## Testing Sign-off

### Backend API: [ ] PASS / [ ] FAIL
**Notes:**

### Frontend Components: [ ] PASS / [ ] FAIL
**Notes:**

### Integration: [ ] PASS / [ ] FAIL
**Notes:**

### Overall System: [ ] PASS / [ ] FAIL
**Notes:**

---

## Quick Test URLs

- Login: http://localhost:5173/login
- Organizer Dashboard: http://localhost:5173/organizer/dashboard
- Event Detail: http://localhost:5173/organizer/events/{eventId}
- Attendance: http://localhost:5173/organizer/events/{eventId}/attendance

## Quick API Test Commands

```bash
# Test scan endpoint
curl -X POST http://localhost:5000/api/attendance/scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": "{\"ticketId\":\"TICKET_ID\",\"participantEmail\":\"test@example.com\",\"eventName\":\"Test Event\",\"valid\":true}",
    "eventId": "EVENT_ID"
  }'

# Test dashboard endpoint
curl http://localhost:5000/api/attendance/dashboard/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test export endpoint
curl http://localhost:5000/api/attendance/export/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output attendance.csv
```

---

**Testing Date:** February 20, 2026  
**Tester:**  
**Version:** 1.0  
**Status:** 
