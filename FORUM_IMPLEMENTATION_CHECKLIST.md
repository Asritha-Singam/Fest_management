# Real-Time Discussion Forum Implementation Checklist

## Overview
Implement a real-time discussion forum on event details pages where registered participants can post messages and organizers can moderate. Forum buttons will appear on participant dashboard cards and organizer event cards.

---

## Backend Implementation

### 1. Data Models

#### ForumMessage Schema
```
- _id: ObjectId
- event: ObjectId (ref: Event) - required
- author: ObjectId (ref: User) - required
- authorRole: "participant" | "organizer" | "admin"
- parentMessage: ObjectId (null for top-level, id for replies)
- content: String - required
- messageType: "normal" | "announcement" - default: "normal"
- isPinned: Boolean - default: false
- isDeleted: Boolean - default: false
- deletedBy: ObjectId (ref: User)
- deletionReason: String
- reactions: [{emoji: String, users: [ObjectId]}]
- createdAt: Date
- updatedAt: Date
```

**Indexes:**
- `{event: 1, createdAt: -1}` - Fetch messages for an event
- `{event: 1, parentMessage: 1}` - Fetch replies for a message
- `{event: 1, isPinned: -1, createdAt: -1}` - Pinned messages first

---

### 2. API Endpoints

#### GET `/api/events/:eventId/forum/messages`
**Query params:** `?page=1&limit=20&sortBy=newest`
**Response:**
```json
{
  "success": true,
  "messages": [...],
  "announcements": [...],
  "pinnedMessages": [...],
  "total": 100,
  "page": 1,
  "hasMore": true
}
```

#### POST `/api/events/:eventId/forum/messages`
**Auth:** Registered participant for the event
**Body:**
```json
{
  "content": "Message text",
  "parentMessageId": "optional_id_for_replies"
}
```
**Response:** New message object

#### GET `/api/events/:eventId/forum/messages/:messageId/replies`
**Response:** Array of reply messages (threaded)

#### POST `/api/events/:eventId/forum/messages/:messageId/reaction`
**Auth:** Registered participant
**Body:**
```json
{
  "emoji": "👍"
}
```
**Response:** Updated reactions

#### DELETE `/api/events/:eventId/forum/messages/:messageId`
**Auth:** Organizer of event OR admin
**Body:**
```json
{
  "reason": "Spam/inappropriate content"
}
```

#### PATCH `/api/events/:eventId/forum/messages/:messageId/pin`
**Auth:** Organizer of event
**Response:** Updated message with `isPinned: true`

#### POST `/api/events/:eventId/forum/announcement`
**Auth:** Organizer of event
**Body:**
```json
{
  "content": "Announcement text"
}
```
**Response:** New announcement message (type: "announcement")

#### GET `/api/events/:eventId/forum/messages/:messageId/unread`
**Response:** `{ unreadCount: number }`

---

### 3. Permissions Logic

| Action | Participant | Organizer | Admin |
|--------|------------|-----------|-------|
| Post message | ✅ (if registered) | ✅ | ✅ |
| See messages | ✅ (if registered) | ✅ (own events) | ✅ |
| Delete own message | ✅ | ✅ | ✅ |
| Delete others' messages | ❌ | ✅ (own event) | ✅ |
| Pin messages | ❌ | ✅ (own event) | ✅ |
| Post announcements | ❌ | ✅ (own event) | ✅ |
| React to messages | ✅ (if registered) | ✅ | ✅ |

---

### 4. Socket.IO Real-Time Events

**Room:** `forum-event-${eventId}`

**Emit Events:**
- `new-message` - When user posts a message
- `message-deleted` - When message is deleted
- `message-pinned` - When message is pinned
- `message-reaction-added` - When reaction is added
- `announcement-posted` - When announcement is posted
- `user-typing` - User is typing (optional)

**Listen Events:**
- `join-forum` - User enters forum
- `leave-forum` - User leaves forum
- `message-created` - Broadcast new message
- `message-updated` - Broadcast message updates
- `unread-count-update` - Update unread count for user

---

## Frontend Implementation

### 1. Components

#### ForumButton Component
```jsx
// Simple button to open forum modal/page
<button onClick={() => navigate(`/event/${eventId}/forum`)}>
  💬 Discussion Forum
</button>
```

#### ForumContainer Component
```jsx
// Main forum display
- List messages (paginated)
- Show pinned messages at top
- Show announcements separately
- Reply threading
- Typing indicator
- Unread badge
```

#### MessageCard Component
```jsx
// Individual message display
- Author info
- Content
- Timestamp
- Pinned badge (if pinned)
- Announcement badge (if announcement)
- Reaction buttons
- Delete button (if organizer/own message)
- Reply button
```

#### ReplyThread Component
```jsx
// Show nested replies
- Collapsible/expandable replies
- Indent replies
- Show reply count badge
```

#### ReactionPicker Component
```jsx
// Emoji reactions
- Common emojis (👍, ❤️, 😂, etc.)
- Show reaction count per emoji
- Toggle on/off
```

#### ForumModal Component
```jsx
// Floating modal or side panel
- Close button
- New message input
- Message list
- Auto-scroll to latest
```

---

### 2. UI Integration Points

#### Participant Dashboard
**Location:** Event card (dashboard.jsx)
```jsx
<div style={cardFooter}>
  <div style={{ display: "flex", gap: "10px" }}>
    {/* existing buttons */}
  </div>
  {/* NEW: Forum button on card */}
  <button onClick={() => openForumModal(eventId)} style={forumButtonStyle}>
    💬 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
  </button>
  {/* existing QR preview button */}
</div>
```

#### Organizer Events Dashboard
**Location:** Event card (organizerDashboard.jsx)
```jsx
<div style={eventCardActions}>
  <Link to={`/organizer/events/${event._id}`} style={viewDetailsButton}>
    View Details →
  </Link>
  {/* NEW: Forum button */}
  <button onClick={() => openForumModal(event._id)} style={forumButtonStyle}>
    💬 Forum
  </button>
</div>
```

#### Event Detail Page
**Location:** Full forum embedded (eventDetail.jsx & organizerEventDetail.jsx)
```jsx
<section style={forumSection}>
  <ForumContainer eventId={eventId} userRole={userRole} />
</section>
```

---

### 3. State Management (Context or Zustand)

```javascript
ForumContext:
- messages: []
- pinnedMessages: []
- announcements: []
- unreadCounts: {eventId: count}
- isLoading: boolean
- error: null/string

Actions:
- fetchMessages(eventId, page)
- postMessage(eventId, content, parentId)
- deleteMessage(eventId, messageId, reason)
- pinMessage(eventId, messageId)
- addReaction(eventId, messageId, emoji)
- postAnnouncement(eventId, content)
- markAsRead(eventId)
```

---

### 4. Real-Time Updates (Socket.IO Client)

```javascript
// On component mount
socket.emit('join-forum', eventId);

// Listen for updates
socket.on('message-created', (newMessage) => {
  addMessageToList(newMessage);
  playNotificationSound();
  updateUnreadCount(eventId);
});

socket.on('message-deleted', (messageId) => {
  removeMessageFromList(messageId);
});

socket.on('message-reaction-added', (messageId, emoji, count) => {
  updateMessageReactions(messageId, emoji, count);
});

// On component unmount
socket.emit('leave-forum', eventId);
```

---

## Implementation Sequence

### Phase 1: Backend Setup (Priority 1)
- [ ] Create `ForumMessage` model
- [ ] Create forum controller with CRUD operations
- [ ] Create forum routes with auth/permissions
- [ ] Add Socket.IO integration to server

### Phase 2: Frontend Basic UI (Priority 2)
- [ ] Create `ForumButton` component
- [ ] Add forum button to participant dashboard cards
- [ ] Add forum button to organizer event cards
- [ ] Create basic `ForumContainer` layout
- [ ] Create `MessageCard` component
- [ ] Add message submission form

### Phase 3: Features (Priority 3)
- [ ] Message threading/replies
- [ ] Pinned messages display
- [ ] Announcements with special styling
- [ ] Emoji reactions
- [ ] Message pagination
- [ ] Delete/moderate (organizer only)

### Phase 4: Real-Time & Notifications (Priority 4)
- [ ] Socket.IO message broadcast
- [ ] Unread count badges
- [ ] Typing indicators (optional)
- [ ] Toast notifications for new messages
- [ ] Auto-scroll to latest message

### Phase 5: Polish (Priority 5)
- [ ] Search messages (optional)
- [ ] Message editing (optional)
- [ ] Message reporting (optional)
- [ ] Better error handling
- [ ] Loading states
- [ ] Mobile responsiveness

---

## Database Indexes

```javascript
// ForumMessage indexes
db.forummessages.createIndex({ event: 1, createdAt: -1 })
db.forummessages.createIndex({ event: 1, parentMessage: 1 })
db.forummessages.createIndex({ event: 1, isPinned: -1, createdAt: -1 })
db.forummessages.createIndex({ author: 1, createdAt: -1 })
```

---

## Testing Checklist

### Backend
- [ ] Register for event → can post messages
- [ ] Not registered → cannot post messages
- [ ] Organizer can delete/pin messages
- [ ] Participant cannot delete other's messages
- [ ] Announcements marked correctly
- [ ] Reactions increment/decrement
- [ ] Threaded replies structure

### Frontend
- [ ] Forum button visible on all active event cards
- [ ] Modal opens/closes correctly
- [ ] Messages load and display
- [ ] New messages appear in real-time
- [ ] Reactions work without page refresh
- [ ] Delete button only shows for organizer/own message
- [ ] Unread badges update correctly

---

## Optional Enhancements

1. **Message Search** - Search forum messages within event
2. **Message Editing** - Allow users to edit own messages
3. **Report Message** - Flag inappropriate content
4. **Typing Indicators** - Show who is typing
5. **Message Notifications** - Email/in-app when mentioned
6. **Moderation Queue** - Approve messages before posting
7. **Message Reactions Analytics** - Sentiment tracking
8. **Archive Forum** - Lock forum after event ends
9. **Export Forum** - Download conversation as PDF/CSV
10. **Spam Detection** - Auto-flag duplicate/rapid messages

---

## Design Notes

- Keep forum button visible but not intrusive on cards
- Use consistent styling with rest of app (#2E1A47 purple theme)
- Pinned messages with distinct styling (⭐ icon)
- Announcements with different background color (yellow/gold)
- Deleted messages show "[Message deleted by organizer]" placeholder
- Show author role badge (Organizer/Admin) next to name
- Mobile: Forum in full-screen modal or collapsible panel

