# Session History

This folder contains JSON files with complete session data from the Course Recommendation System.

## Session Data Structure

Each JSON file contains:

```json
{
  "sessionDate": "18/11/2025",           // Date of the session
  "sessionTime": "00:15:30",             // Duration of the session (HH:MM:SS)
  "sessionDateTime": "18/11/2025, 14:30:45", // Complete timestamp
  "userInfo": {
    "userName": "username",
    "teacherInfo": {...},                // Teacher profile information
    "courseRatings": [...]               // Course ratings
  },
  "conversationHistory": [
    {
      "id": "...",
      "content": "...",
      "isUser": true/false,
      "timestamp": "..."
    }
  ],
  "survey": {
    "answers": {
      "overallExperience": 1-5,
      "responseQuality": 1-5,
      "helpfulness": 1-5,
      "accuracy": 1-5,
      "clarity": 1-5,
      "easeOfUse": 1-5,
      "responseSpeed": 1-5,
      "design": 1-5,
      "personalization": 1-5,
      "futureUse": 1-5,
      "wouldRecommend": "yes/maybe/no"
    },
    "completedAt": "18/11/2025, 14:45:30"
  }
}
```

## File Naming Convention

Files are named as: `session_[username]_[timestamp].json`

Example: `session_john_1700318400000.json`

## How Sessions are Saved

1. **Server Mode**: When the backend server is running, sessions are automatically saved to this folder
2. **Fallback Mode**: If the server is not running, the file is downloaded to the user's browser downloads folder

## Starting the Server

To enable automatic session saving to this folder:

```bash
npm run server
```

Or run both the React app and server together:

```bash
npm run dev
```

The server runs on `http://localhost:3000`

## Notes

- Sessions are saved when users complete the satisfaction survey
- All session data is backed up to localStorage as well
- The folder is automatically created if it doesn't exist
