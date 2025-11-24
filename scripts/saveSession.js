const fs = require('fs');
const path = require('path');

// This script can be called from a backend API endpoint
// For now, it demonstrates how to save session data

function saveSessionToFile(sessionData, username) {
  const sessionsDir = path.join(__dirname, '..', 'sessionHistory');
  
  // Ensure directory exists
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }
  
  // Create filename with timestamp
  const timestamp = Date.now();
  const filename = `session_${username}_${timestamp}.json`;
  const filepath = path.join(sessionsDir, filename);
  
  // Write the file
  fs.writeFileSync(filepath, JSON.stringify(sessionData, null, 2), 'utf8');
  
  console.log(`Session saved to: ${filepath}`);
  return filepath;
}

// Example usage:
// const sessionData = { /* your session data */ };
// saveSessionToFile(sessionData, 'username');

module.exports = { saveSessionToFile };
