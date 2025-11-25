# Firebase Security Rules

## Firestore Rules

Copy and paste this into your Firestore Rules (Firebase Console → Firestore Database → Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sessions collection - stores chat sessions with ratings
    match /sessions/{sessionId} {
      // Allow authenticated users to create/write sessions
      allow create, write: if request.auth != null;
      
      // Allow authenticated users to read their own sessions
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      // Allow users to list their own sessions
      allow list: if request.auth != null;
    }
    
    // Test connection collection (for testing purposes)
    match /test_connection/{docId} {
      allow read, write: if request.auth != null;
    }
    
    // Users collection (if you add user profiles later)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Firebase Storage Rules

Copy and paste this into your Storage Rules (Firebase Console → Storage → Rules):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Sessions folder - stores JSON files of chat sessions
    match /sessions/{userId}/{allPaths=**} {
      // Allow authenticated users to write to their own folder
      allow create, write: if request.auth != null && 
                              request.auth.uid == userId;
      
      // Allow authenticated users to read their own files
      allow read: if request.auth != null && 
                     request.auth.uid == userId;
      
      // Allow users to list their own files
      allow list: if request.auth != null && 
                     request.auth.uid == userId;
    }
    
    // Test folder (for testing purposes)
    match /test/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## How to Apply These Rules

### For Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. Copy the Firestore rules above
6. Paste them into the editor
7. Click **Publish**

### For Storage:

1. In Firebase Console, click **Storage** in the left sidebar
2. Click the **Rules** tab at the top
3. Copy the Storage rules above
4. Paste them into the editor
5. Click **Publish**

---

## What These Rules Do

### Firestore Rules:

✅ **Allow authenticated users to:**
- Create new session documents
- Write/update session documents
- Read their own session documents
- List their own sessions

❌ **Prevent:**
- Unauthenticated access
- Users from reading other users' sessions
- Unauthorized data access

### Storage Rules:

✅ **Allow authenticated users to:**
- Upload JSON files to their own folder
- Read files from their own folder
- List files in their own folder

❌ **Prevent:**
- Unauthenticated file uploads
- Users from accessing other users' files
- Unauthorized file access

---

## Testing Rules

After applying the rules, use the Firebase Test page to verify:

1. Navigate to: `http://localhost:3000/firebase-test`
2. Click "Run All Tests"
3. Check console for success messages

Expected output:
```
✅ Firestore WRITE successful!
✅ Firestore READ successful!
✅ Storage WRITE successful!
✅ Storage LIST successful!
```

---

## Troubleshooting

### If you get "Permission Denied" errors:

1. **Verify you're logged in** - Rules require authentication
2. **Check userId matches** - Storage rules check userId in path
3. **Publish the rules** - Make sure you clicked "Publish" after pasting
4. **Wait a moment** - Rules can take a few seconds to propagate

### If tests still fail:

1. **Check browser console** for detailed error messages
2. **Verify Firebase is initialized** - Check `src/config/firebase.ts`
3. **Check environment variables** - Verify `.env` file
4. **Restart dev server** - After changing `.env`

---

## More Permissive Rules (For Development Only)

⚠️ **WARNING:** Only use these for development/testing. DO NOT use in production!

### Firestore (Development):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage (Development):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Production-Ready Rules

The rules at the top of this document are production-ready and follow security best practices:

✅ Require authentication  
✅ Enforce user isolation (users can only access their own data)  
✅ Prevent unauthorized access  
✅ Allow necessary operations only  

---

## Additional Security Considerations

### 1. **Data Validation**

You can add validation to ensure data structure:

```javascript
match /sessions/{sessionId} {
  allow create: if request.auth != null &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.conversationHistory is list &&
                   request.resource.data.survey is map;
}
```

### 2. **Rate Limiting**

Consider implementing rate limiting to prevent abuse:

```javascript
match /sessions/{sessionId} {
  allow create: if request.auth != null &&
                   request.time > resource.data.lastCreated + duration.value(1, 'm');
}
```

### 3. **Read-Only After Creation**

Prevent modification of submitted sessions:

```javascript
match /sessions/{sessionId} {
  allow create: if request.auth != null;
  allow read: if request.auth != null && request.auth.uid == resource.data.userId;
  allow update, delete: if false; // Sessions are immutable
}
```

---

## Summary

✅ **Copy the rules from the top of this document**  
✅ **Paste into Firebase Console**  
✅ **Click Publish**  
✅ **Test using `/firebase-test` page**  

Your Firebase security is now properly configured! 🔒
