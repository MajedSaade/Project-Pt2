import { GoogleGenerativeAI } from '@google/generative-ai';
import { TeacherProfile } from '../types/User';

// ============================
// 🔐 Gemini API Initialization
// ============================

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
console.log("🔑 Gemini API key prefix:", API_KEY?.slice(0, 4) + "..." + API_KEY?.slice(-3));

console.log('API Key loaded:', API_KEY ? '✅ API Key present' : '❌ No API Key');
if (!API_KEY || API_KEY === 'your-api-key-here') {
  throw new Error('REACT_APP_GEMINI_API_KEY is not configured in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// ============================
// Conversation Context & Intent Handling
// ============================

type ConversationState = "general" | "awaitingRecommendationConfirmation" | "recommendation";

let conversationState: ConversationState = "general";
let lastBotMessage: string | undefined = undefined;

function detectIntent(message: string): "question" | "request_recommendation" | "confirmation" | "other" {
  const msg = message.trim().toLowerCase();

  const recommendationWords = ["עוד", "תמליץ", "המלצה", "קורס מתאים", "אני רוצה המלצה", "רוצה", "איזה קורס"];
  const confirmationWords = ["אא", "כן", "בטח", "קדימה", "יאללה", "כן בבקשה"];
  const questionWords = ["האם", "?", "מה זה", "איך", "איפה", "מתי", "כמה", "מי", "תסבר", "מה", "למה"];

  if (recommendationWords.some(w => msg.includes(w))) return "request_recommendation";
  if (confirmationWords.includes(msg)) return "confirmation";
  if (questionWords.some(w => msg.includes(w))) return "question";
  return "other";
}

// ============================
//  Test API Connection
// ============================

export const testApiConnection = async () => {
  try {
    const result = await model.generateContent('Hello, respond with "API working" in Hebrew');
    return (await result.response).text();
  } catch (error) {
    console.error('API test failed:', error);
    throw error;
  }
};

// ============================
//  Main Recommendation Logic
// ============================

export const generateCourseRecommendation = async (
  userMessage: string,
  teacherProfile: TeacherProfile
) => {
  try {
    const intent = detectIntent(userMessage);
    const previousCoursesText =
      teacherProfile.previousCourses && teacherProfile.previousCourses.length > 0
        ? teacherProfile.previousCourses.join(', ')
        : 'לא צוינו קורסים קודמים';

    console.log(`🧠 Intent Detected: ${intent}`);
    console.log(`📍 Conversation State: ${conversationState}`);

    // =====================================
    // 🔥 NEW — Call your Render CatBoost API
    // =====================================
    const predictionResponse = await fetch(
      "https://api-course-recommender.onrender.com/predict",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: teacherProfile.subjectArea,
          sector: teacherProfile.schoolType,
          language: teacherProfile.language,
          teaches_elementary: teacherProfile.educationLevels?.includes("יסודי") ? 1 : 0,
          teaches_secondary: teacherProfile.educationLevels?.includes("על יסודי") ? 1 : 0
        }),
      }
    );

    const predictionData = await predictionResponse.json();

    console.log("🔥 Top-5 model output:", predictionData);

    // =====================================
    // Build summary for Gemini
    // =====================================
    const coursesSummary = predictionData
      .map((c: any, i: number) => `
      ${i + 1}. שם הקורס: ${c["שם הקורס"]}
        • תקציר הקורס: ${c["תקציר הקורס"]}
        • ציון התאמה: ${(c.score * 100).toFixed(1)}%
      `)
      .join("\n");

    console.log("📘 Courses Summary for prompt:", coursesSummary);

    // =======================
    // Case 1: Recommendation
    // =======================

    if (
      intent === "request_recommendation" ||
      (lastBotMessage && lastBotMessage.includes("מה אתה מחפש")) ||
      (intent === "confirmation" && conversationState === "awaitingRecommendationConfirmation")
    ) {
      conversationState = "recommendation";
      const systemPrompt =
        `אתה עוזר חכם להמלצות קורסים למורים.  עליך לכתוב את התשובה בעברית בלבד, בשפה טבעית, מקצועית וברורה. 
          
          פרופיל המורה:
          - שם: ${teacherProfile.name}
          - מקצוע הוראה: ${teacherProfile.subjectArea}
          - מגזר: ${teacherProfile.schoolType}
          - שלב חינוך: ${teacherProfile.educationLevels?.join(", ") || "לא צויין"}.
          - שפת בית הספר: ${teacherProfile.language}
          - קורסים שהמורה השתתף בהם בעבר: ${previousCoursesText}
          - שאלה: ${userMessage}

          להלן הקורסים המתאימים ביותר לפי מודל החיזוי:
          ${coursesSummary}

          הנחיות:
          1. תן המלצות מותאמות אישית למורה.
          2. הסבר בשני משפטים למה כל קורס מתאים לפי תקציר הקורס והמידע על המורה.
          3. כתיבה בעברית מקצועית וברורה.
         4. הימנע מלהציע קורסים שהשם שלהם מופיע ב ${previousCoursesText}  
        `;

      console.log('📤 Sending recommendation prompt to Gemini...');
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      lastBotMessage = response.text();

      return response.text().replace(/\*\*/g, '').replace(/\*/g, '');
    }

    // =======================
    // Case 2: Question
    // =======================
    if (intent === "question") {
      conversationState = "awaitingRecommendationConfirmation";

      const questionPrompt = `
      המשתמש שאל שאלה:
      "${userMessage}"

       בהנתן פרופיל המורה:
      - שם: ${teacherProfile.name}
      - מקצוע הוראה: ${teacherProfile.subjectArea}
      - מגזר: ${teacherProfile.schoolType}
      - שלב חינוך: ${teacherProfile.educationLevels?.join(", ") || "לא צויין"}.
      - שפת בית הספר: ${teacherProfile.language}
      - קורסים שהמורה השתתף בהם בעבר: ${previousCoursesText} 

      ולהלן קורסים אפשריים הקשורים לשאלה:
      ${coursesSummary}

      ענה על השאלה בעברית מקצועית וברורה 
      התשובה צריכה להיות ישירה , ללא הרחבות מיותרות וללא תיאורים כלליים.
    התשובה צריכה להתבסס על פרופיל המורה ועל המידע לגבי הקורסים.  
      `;

      const questionResult = await model.generateContent(questionPrompt);
      const response = await questionResult.response;

      lastBotMessage = response.text();
      return response.text().replace(/\*\*/g, '').replace(/\*/g, '');
    }

    // =======================
    // Case 3: Confirmation
    // =======================
    if (intent === "confirmation" && lastBotMessage?.includes("האם תרצה שאמליץ")) {
      conversationState = "recommendation";
      lastBotMessage =
        "מעולה! כדי שאוכל להתאים לך קורסים באמת רלוונטיים — תספר לי קצת מה אתה מחפש. מה היית רוצה לשפר או ללמוד בקורס?";
      return lastBotMessage;
    }

    // =======================
    // Case 4: General Chat
    // =======================
    conversationState = "general";
    lastBotMessage =
      "כדי שאוכל להמליץ לך בצורה מדויקת — ספר לי קצת מה אתה מחפש, מה מעניין אותך או במה היית רוצה להתפתח כמורה";
    return lastBotMessage;

  } catch (error) {
    console.error('❌ Error generating response:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) throw new Error('שגיאה במפתח API. בדוק את ההגדרות.');
      if (error.message.includes('quota')) throw new Error('חריגה ממכסת השימוש ב-API.');
      if (error.message.includes('fetch')) throw new Error('שגיאת רשת. בדוק את החיבור.');
    }
    throw new Error('נכשל ביצירת תגובה. אנא נסה שוב.');
  }
};
