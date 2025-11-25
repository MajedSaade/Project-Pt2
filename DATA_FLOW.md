# Data Flow Diagram

## How Conversations and Ratings are Saved

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN
   ↓
   User authenticates with Firebase Auth
   ↓
   
2. TEACHER INFO
   ↓
   User fills out profile (name, subject, school type)
   → Saved to localStorage
   ↓
   
3. CHAT SESSION
   ↓
   User sends messages ←→ AI responds
   │
   ├─ Each message saved to localStorage immediately
   │  Format: { id, content, isUser, timestamp }
   │
   └─ Session timer running (HH:MM:SS)
   ↓
   
4. END SESSION
   ↓
   User clicks "End Session" button
   → Session time saved to localStorage
   → Navigate to Survey page
   ↓
   
5. SURVEY
   ↓
   User rates experience (5 questions + recommendation)
   ↓
   User clicks "Submit"
   ↓
   
6. SAVE TO FIREBASE
   ↓
   ┌─────────────────────────────────────────────────────┐
   │         Data Collection & Preparation                │
   └─────────────────────────────────────────────────────┘
   
   Collect from localStorage:
   ├─ userName
   ├─ teacherInfo
   ├─ courseRatings
   ├─ sessionTime
   └─ chatHistory (all messages)
   
   Combine with survey:
   └─ answers (5 ratings + recommendation)
   
   Create sessionData object:
   {
     sessionDate,
     sessionTime,
     sessionDateTime,
     timestamp,
     userId,
     userInfo: { userName, teacherInfo, courseRatings },
     conversationHistory: [...messages],
     survey: { answers, completedAt }
   }
   ↓
   
   ┌─────────────────────────────────────────────────────┐
   │              Save to TWO Locations                   │
   └─────────────────────────────────────────────────────┘
   
   PARALLEL SAVES:
   
   ┌──────────────────────┐         ┌──────────────────────┐
   │  FIRESTORE DATABASE  │         │   FIREBASE STORAGE   │
   └──────────────────────┘         └──────────────────────┘
            ↓                                  ↓
   Collection: sessions          Path: sessions/{userId}/
            ↓                                  ↓
   Document with auto-ID         File: session_{timestamp}.json
            ↓                                  ↓
   Contains full JSON            Contains full JSON
   ↓                                          ↓
   
   ┌─────────────────────────────────────────────────────┐
   │              Success Confirmation                    │
   └─────────────────────────────────────────────────────┘
   
   Console logs:
   ✅ Document written to Firestore with ID: abc123
   ✅ Session JSON saved to Storage: sessions/uid/session_...json
   
   User sees:
   "השאלון והשיחה נשמרו בהצלחה!"
   ↓
   
7. CLEANUP & LOGOUT
   ↓
   Clear localStorage
   Logout user
   Redirect to login
```

---

## Data Structure Breakdown

```
sessionData
│
├─ sessionDate: "25/11/2025"
├─ sessionTime: "00:15:30"
├─ sessionDateTime: "25/11/2025, 03:14:16"
├─ timestamp: Date object
├─ userId: "firebase-user-uid"
│
├─ userInfo
│  ├─ userName: "Teacher Name"
│  ├─ teacherInfo
│  │  ├─ subjectArea: "Mathematics"
│  │  ├─ schoolType: "High School"
│  │  └─ language: "עברית"
│  └─ courseRatings: []
│
├─ conversationHistory: [
│     {
│       id: "1732496400000",
│       content: "Message text",
│       isUser: true,
│       timestamp: Date object
│     },
│     {
│       id: "1732496401000",
│       content: "AI response",
│       isUser: false,
│       timestamp: Date object
│     }
│  ]
│
└─ survey
   ├─ answers
   │  ├─ overallExperience: 5
   │  ├─ responseQuality: 4
   │  ├─ helpfulness: 5
   │  ├─ accuracy: 4
   │  ├─ easeOfUse: 5
   │  └─ wouldRecommend: "yes"
   └─ completedAt: "25/11/2025, 03:14:16"
```

---

## Code Flow

```
Chat.tsx
├─ Line 41: Save messages to localStorage
│  useEffect(() => {
│    localStorage.setItem('chatHistory', JSON.stringify(messages));
│  }, [messages]);
│
└─ Line 173: Save session time
   localStorage.setItem('sessionTime', sessionTime.toString());

Survey.tsx
├─ Line 80-85: Read from localStorage
│  const userName = localStorage.getItem('userName');
│  const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}');
│  const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
│  const sessionTime = localStorage.getItem('sessionTime');
│
├─ Line 93-108: Create sessionData object
│  const sessionData = {
│    sessionDate, sessionTime, sessionDateTime, timestamp,
│    userInfo: { userName, teacherInfo, courseRatings },
│    conversationHistory: chatHistory,
│    survey: { answers, completedAt }
│  };
│
└─ Line 111: Save to Firebase
   const success = await saveSessionToFirebase(sessionData);

saveSessionToFirebase() [Lines 41-68]
├─ Line 44-46: Add userId
│  if (currentUser) {
│    data.userId = currentUser.uid;
│  }
│
├─ Line 49: Save to Firestore
│  const docRef = await addDoc(collection(db, 'sessions'), data);
│
└─ Line 53-60: Save to Storage
   const chatData = JSON.stringify(data, null, 2);
   const fileName = `sessions/${currentUser.uid}/session_${timestamp}.json`;
   await uploadString(storageRef, chatData, 'raw', { 
     contentType: 'application/json' 
   });
```

---

## Storage Locations

### localStorage (Temporary)
```
Browser Storage (cleared after save)
├─ userName: "Teacher Name"
├─ teacherInfo: {...}
├─ courseRatings: [...]
├─ sessionTime: "930" (seconds)
└─ chatHistory: [{...}, {...}]
```

### Firestore Database (Permanent)
```
Firebase Console → Firestore Database
└─ sessions (collection)
   ├─ abc123xyz (document)
   │  └─ {sessionData}
   ├─ def456uvw (document)
   │  └─ {sessionData}
   └─ ...
```

### Firebase Storage (Permanent)
```
Firebase Console → Storage
└─ sessions/
   ├─ user-uid-1/
   │  ├─ session_2025-11-25T01-14-16-000Z.json
   │  ├─ session_2025-11-25T02-30-45-000Z.json
   │  └─ ...
   ├─ user-uid-2/
   │  └─ ...
   └─ ...
```

---

## Key Points

✅ **Automatic Saving**: Messages saved to localStorage immediately  
✅ **Dual Storage**: Data saved to both Firestore AND Storage  
✅ **Complete Data**: Conversation + Ratings + User Info + Timestamps  
✅ **JSON Format**: Properly formatted JSON with 2-space indentation  
✅ **User Isolation**: Each user's data in separate folder  
✅ **Timestamped Files**: Easy to identify and sort sessions  
✅ **Fallback**: If Firebase fails, downloads JSON locally  

---

## Testing Checklist

- [ ] Start chat session
- [ ] Send at least one message
- [ ] Verify message appears in chat
- [ ] Click "End Session"
- [ ] Fill out all 5 survey questions
- [ ] Select recommendation option
- [ ] Click "Submit"
- [ ] Check browser console for success messages
- [ ] Check Firestore for new document
- [ ] Check Storage for new JSON file
- [ ] Verify data structure is correct
- [ ] Confirm conversation and ratings are both present

---

## Troubleshooting Flow

```
Data not appearing in Firebase?
│
├─ Check browser console
│  ├─ See success messages? → Firebase is working!
│  └─ See errors?
│     ├─ "Permission denied" → Check Firebase rules
│     ├─ "Network error" → Check internet connection
│     └─ "API key invalid" → Check .env file
│
├─ Check Firebase Console
│  ├─ Firestore enabled? → If not, enable it
│  ├─ Storage enabled? → If not, enable it
│  └─ Rules published? → If not, publish them
│
└─ Check authentication
   ├─ User logged in? → Check currentUser
   └─ Valid UID? → Check in browser console
```

---

## Summary

Your system follows this flow:

1. **Chat** → Messages saved to localStorage
2. **End Session** → Navigate to survey
3. **Survey** → Collect all data
4. **Submit** → Save to Firestore + Storage
5. **Success** → Clear localStorage, logout

All conversation messages and survey ratings are saved together in a single JSON object to both Firestore and Storage! 🎉
