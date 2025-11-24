import { GoogleGenerativeAI } from '@google/generative-ai';
import { TeacherProfile } from '../types/User';

// Get API key from environment variables
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

console.log('API Key loaded:', API_KEY ? 'API Key present' : 'No API Key');
console.log('API Key starts with:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'N/A');

if (!API_KEY || API_KEY === 'your-api-key-here') {
  console.error('Gemini API key is not properly configured. Please check your .env file.');
  throw new Error('REACT_APP_GEMINI_API_KEY is not configured in environment variables');
}

console.log('API Key appears to be configured');

const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Test function to verify API connection
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    const result = await model.generateContent('Hello, respond with "API working" in Hebrew');
    const response = await result.response;
    console.log('API test successful:', response.text());
    return response.text();
  } catch (error) {
    console.error('API test failed:', error);
    throw error;
  }
};

export const generateCourseRecommendation = async (
  userMessage: string,
  teacherProfile: TeacherProfile
) => {
  // Format previous courses for display
  const previousCoursesText = teacherProfile.previousCourses && teacherProfile.previousCourses.length > 0 
    ? teacherProfile.previousCourses.join(', ')
    : 'לא צוינו קורסים קודמים';

  const systemPrompt = `You are a course recommendation assistant for teachers. Please respond in Hebrew.
  
  פרופיל המורה:
  - שם: ${teacherProfile.name}
  - מקצוע הוראה: ${teacherProfile.subjectArea}
  - מגזר: ${teacherProfile.schoolType}
  - שפת בית הספר: ${teacherProfile.language}
  - קורסים שהמורה השתתף בהם בעבר: ${previousCoursesText}

  אתה צריך לספק המלצות קורסים מותאמות אישית והצעות חינוכיות על בסיס הפרופיל של המורה. היה מועיל, מקצועי, והתמקד בתוכן חינוכי שיועיל למורים בתחום ההוראה שלהם. 
  
  הנחיות חשובות:
  1. קח בחשבון את הקורסים שהמורה כבר השתתף בהם כדי להמליץ על קורסים משלימים או מתקדמים יותר
  2. הימנע מהמלצה על קורסים שהמורה כבר השתתף בהם, אלא אם כן מדובר בקורסי המשך או רמה מתקדמת
  3. קח בחשבון את המגזר שבו המורה עובד כדי לתת המלצות רלוונטיות תרבותית
  4. התמקד בקורסים שיתרמו לפיתוח המקצועי של המורה בתחום ההוראה שלו
  
  ענה בעברית, בצורה ברורה ומפורטת.

  שאלת המורה: ${userMessage}`;

  try {
    console.log('Sending request to Gemini API...');
    console.log('Teacher Profile:', teacherProfile);
    console.log('User Message:', userMessage);
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    
    console.log('Gemini API response received successfully');
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      teacherProfile,
      userMessage
    });

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('שגיאה במפתח API. אנא בדוק את ההגדרות.');
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error('חריגה ממכסת השימוש ב-API. אנא נסה שוב מאוחר יותר.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('שגיאת רשת. אנא בדוק את החיבור לאינטרנט.');
      }
    }
    
    throw new Error('נכשל ביצירת תגובה. אנא נסה שוב.');
  }
};