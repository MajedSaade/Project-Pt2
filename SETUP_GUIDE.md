# Quick Setup Guide

## 📋 Prerequisites

1. Node.js (version 16 or later)
2. npm or yarn
3. Firebase account
4. Google AI Studio account (for Gemini API)

## 🚀 Quick Start

### Step 1: Copy Environment File
```bash
cp .env.example .env
```

### Step 2: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > General > Your apps
4. Click "Add app" and select Web (</>) 
5. Register your app with a nickname
6. Copy the config object values

### Step 3: Enable Firebase Services

1. **Authentication:**
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider

2. **Firestore Database:**
   - Go to Firestore Database
   - Create database (start in test mode for development)

### Step 4: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API key"
3. Copy the generated API key

### Step 5: Configure Environment Variables

Edit `.env` file with your actual values:

```bash
# Gemini AI API Configuration
REACT_APP_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Firebase Configuration (from step 2)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Step 6: Start the Application

```bash
npm start
```

The application will open at `http://localhost:3000`

## 🎯 Testing the Application

1. **Register a new account:**
   - Fill in your details
   - Select your teaching subjects and experience
   - Create account

2. **Test the chat:**
   - Ask questions like:
     - "What are some good math courses for middle school teachers?"
     - "I need professional development in science education"
     - "Suggest courses for new teachers in elementary education"

## 🔧 Troubleshooting

### Common Issues:

1. **Firebase errors:** Double-check your Firebase config in `.env`
2. **Gemini API errors:** Verify your API key and ensure you have quota
3. **Build errors:** Make sure all environment variables are set
4. **Login issues:** Check that Email/Password is enabled in Firebase Auth

### Security Notes:

- Never commit `.env` file to version control
- Use Firebase Security Rules in production
- Keep API keys secure and rotate them regularly

## 🎨 Customization

The app uses inline styles for simplicity. You can easily replace with:
- CSS modules
- Styled-components  
- Tailwind CSS
- Material-UI

## 📱 Production Deployment

1. Build the app: `npm run build`
2. Deploy to hosting service (Firebase Hosting, Netlify, Vercel)
3. Set environment variables in hosting service
4. Configure Firebase Security Rules for production

## 📄 Features Overview

- ✅ User registration with teacher profiles
- ✅ Secure Firebase authentication
- ✅ Personalized AI course recommendations
- ✅ Real-time chat interface
- ✅ User profile data integration with AI prompts
- ✅ Responsive design
- ✅ TypeScript for type safety

## 🤝 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all configuration steps
3. Ensure Firebase services are properly enabled
4. Check that API keys are valid and have sufficient quota