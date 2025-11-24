# Session History Setup Guide

## Overview
The system now automatically saves complete session data (including date, time, user info, conversation history, and survey results) to JSON files in the `sessionHistory` folder.

## Setup Instructions

### 1. Install Dependencies (Already Done)
```bash
npm install express cors concurrently
```

### 2. Start the Backend Server

To save sessions to the `sessionHistory` folder, you need to run the backend server:

```bash
npm run server
```

The server will start on `http://localhost:3001`

### 3. Run Everything Together

To run both the React app and the backend server simultaneously:

```bash
npm run dev
```

This will:
- Start the React app on `http://localhost:3000`
- Start the backend server on `http://localhost:3001`

## How It Works

1. **User completes a session** and fills out the survey
2. **Survey is submitted** → System collects all session data:
   - Session date and time
   - User information (name, teacher info, profile)
   - Selected courses and ratings
   - Complete conversation history
   - Survey answers

3. **Data is saved** in two ways:
   - **Primary**: Sent to backend server → Saved in `sessionHistory/` folder
   - **Fallback**: If server is not running, file downloads to browser's download folder
   - **Backup**: Always saved to localStorage

## Session Data Structure

Each JSON file contains:
```json
{
  "sessionDate": "18/11/2025",
  "sessionTime": "00:15:30",
  "sessionDateTime": "18/11/2025, 14:30:45",
  "userInfo": { ... },
  "conversationHistory": [ ... ],
  "survey": { ... }
}
```

## File Naming
Files are saved as: `session_[username]_[timestamp].json`

## Troubleshooting

### Sessions not saving to folder?
- Make sure the backend server is running: `npm run server`
- Check console for errors
- If server is down, files will download to browser instead

### Port already in use?
- Change the PORT in `server.js` (default is 3001)

### Can't see saved files?
- Check the `sessionHistory/` folder in your project root
- Make sure you have write permissions

## Notes

- Sessions are only saved when users **complete** the survey
- If users skip the survey, data is not saved
- All session data is also backed up to localStorage
- The `sessionHistory` folder is created automatically if it doesn't exist
