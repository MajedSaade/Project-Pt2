const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Session history directory
const sessionsDir = path.join(__dirname, 'sessionHistory');

// Ensure sessionHistory directory exists
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

// API endpoint to save session data
app.post('/api/save-session', (req, res) => {
  try {
    const sessionData = req.body;
    
    // Create filename with timestamp
    const timestamp = Date.now();
    const username = sessionData.userInfo?.userName || 'unknown';
    const filename = `session_${username}_${timestamp}.json`;
    const filepath = path.join(sessionsDir, filename);
    
    // Write the file
    fs.writeFileSync(filepath, JSON.stringify(sessionData, null, 2), 'utf8');
    
    console.log(`Session saved to: ${filepath}`);
    
    res.json({ 
      success: true, 
      message: 'Session saved successfully',
      filename: filename 
    });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save session',
      error: error.message 
    });
  }
});

// API endpoint to get all sessions
app.get('/api/sessions', (req, res) => {
  try {
    const files = fs.readdirSync(sessionsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(sessionsDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          createdAt: stats.birthtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
    
    res.json({ success: true, sessions: files });
  } catch (error) {
    console.error('Error reading sessions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to read sessions',
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Session server running on http://localhost:${PORT}`);
  console.log(`Sessions will be saved to: ${sessionsDir}`);
});
