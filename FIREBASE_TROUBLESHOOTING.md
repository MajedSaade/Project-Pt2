# Firebase Troubleshooting Guide

## Current Implementation Status ✅

Your system **IS ALREADY CONFIGURED** to save conversations in JSON format with ratings to Firebase!

### What's Being Saved:

1. **Firestore Database** (collection: `sessions`)
   - All session data as a document
   - Includes conversation history, ratings, user info, and timestamps

2. **Firebase Storage** (as JSON files)
   - Path: `sessions/{userId}/session_{timestamp}.json`
   - Full JSON file with all conversation and rating data

---

## Why You Might Not See Files in Firebase

### 1. **Check Firebase Console Locations**

#### For Firestore:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** (NOT Realtime Database)
4. Look for collection named: **`sessions`**
5. Each document contains the full session data

#### For Storage:
1. In Firebase Console, click **Storage**
2. Navigate to folder: **`sessions/`**
3. Then navigate to: **`sessions/{your-user-id}/`**
4. Look for files named: **`session_2025-11-25T...json`**

### 2. **Check Firebase Rules**

Your Firebase Security Rules might be blocking writes. Check:

#### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      // Allow authenticated users to write
      allow write: if request.auth != null;
      // Allow authenticated users to read their own sessions
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

#### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /sessions/{userId}/{allPaths=**} {
      // Allow authenticated users to write to their own folder
      allow write: if request.auth != null && request.auth.uid == userId;
      // Allow authenticated users to read their own files
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. **Check Browser Console for Errors**

1. Open your app in the browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Complete a chat session and submit the survey
5. Look for:
   - ✅ `Document written to Firestore with ID: ...`
   - ✅ `Session JSON saved to Storage: ...`
   - ❌ Any error messages

### 4. **Verify Environment Variables**

Make sure your `.env` file has all required Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

**Important:** After changing `.env`, you MUST restart the development server!

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm start
```

### 5. **Check User Authentication**

The save function only works if:
- User is logged in (`currentUser` exists)
- User has a valid Firebase UID

Check in browser console:
```javascript
// In browser console, check if user is authenticated
console.log(firebase.auth().currentUser);
```

---

## Testing the Save Function

### Manual Test:

1. **Start a chat session**
2. **Send at least one message**
3. **Click "End Session"**
4. **Fill out the survey** (all 5 ratings + recommendation)
5. **Click "Submit"**
6. **Check browser console** for success messages
7. **Check Firebase Console** for new data

### Expected Console Output:
```
✅ Document written to Firestore with ID: abc123xyz
✅ Session JSON saved to Storage: sessions/user-uid/session_2025-11-25T01-14-16-000Z.json
```

---

## Data Structure Reference

### What Gets Saved:

```json
{
  "sessionDate": "25/11/2025",
  "sessionTime": "00:15:30",
  "sessionDateTime": "25/11/2025, 03:14:16",
  "timestamp": "2025-11-25T01:14:16.000Z",
  "userId": "firebase-user-uid",
  "userInfo": {
    "userName": "Teacher Name",
    "teacherInfo": {
      "subjectArea": "Mathematics",
      "schoolType": "High School",
      "language": "עברית"
    },
    "courseRatings": []
  },
  "conversationHistory": [
    {
      "id": "1732496400000",
      "content": "שלום! אני מחפש קורסים בנושא מתמטיקה",
      "isUser": true,
      "timestamp": "2025-11-25T01:00:00.000Z"
    },
    {
      "id": "1732496401000",
      "content": "שלום! אשמח לעזור לך למצוא קורסים מתאימים...",
      "isUser": false,
      "timestamp": "2025-11-25T01:00:01.000Z"
    }
  ],
  "survey": {
    "answers": {
      "overallExperience": 5,
      "responseQuality": 4,
      "helpfulness": 5,
      "accuracy": 4,
      "easeOfUse": 5,
      "wouldRecommend": "yes"
    },
    "completedAt": "25/11/2025, 03:14:16"
  }
}
```

---

## Quick Fixes

### If Nothing is Saving:

1. **Check Firebase initialization:**
   ```bash
   # In browser console
   console.log(firebase.apps.length); // Should be > 0
   ```

2. **Verify Firestore is enabled:**
   - Go to Firebase Console → Firestore Database
   - If you see "Create database", click it and set up Firestore

3. **Verify Storage is enabled:**
   - Go to Firebase Console → Storage
   - If you see "Get started", click it and set up Storage

4. **Check network tab:**
   - Open DevTools → Network tab
   - Submit survey
   - Look for requests to `firestore.googleapis.com` and `firebasestorage.googleapis.com`
   - Check if they return 200 (success) or error codes

### If Firestore Works but Storage Doesn't:

The code has a fallback - if Storage fails, it will:
1. Still save to Firestore ✅
2. Download the JSON file locally as backup

Check your Downloads folder for files like: `session_TeacherName_1732496400000.json`

---

## Need More Help?

1. **Check browser console** for specific error messages
2. **Check Firebase Console** → Usage tab to see if requests are being made
3. **Verify your Firebase plan** allows Firestore and Storage (free tier should work)
4. **Check Firebase quotas** - make sure you haven't exceeded free tier limits

---

## Summary

✅ **Your code is correct and complete!**
✅ **Conversations ARE being saved in JSON format**
✅ **Ratings ARE being saved alongside conversations**
✅ **Both Firestore AND Storage are being used**

If you're not seeing the data, it's likely a **configuration issue** (rules, authentication, or Firebase setup), not a code issue.
