import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SurveyAnswers {
  overallExperience: number;
  responseQuality: number;
  helpfulness: number;
  accuracy: number;
  clarity: number;
  easeOfUse: number;
  responseSpeed: number;
  design: number;
  personalization: number;
  futureUse: number;
  wouldRecommend: string;
}

const Survey: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<SurveyAnswers>({
    overallExperience: 0,
    responseQuality: 0,
    helpfulness: 0,
    accuracy: 0,
    clarity: 0,
    easeOfUse: 0,
    responseSpeed: 0,
    design: 0,
    personalization: 0,
    futureUse: 0,
    wouldRecommend: ''
  });

  const isFormComplete = () => {
    return (
      answers.overallExperience > 0 &&
      answers.responseQuality > 0 &&
      answers.helpfulness > 0 &&
      answers.accuracy > 0 &&
      answers.clarity > 0 &&
      answers.easeOfUse > 0 &&
      answers.responseSpeed > 0 &&
      answers.design > 0 &&
      answers.personalization > 0 &&
      answers.futureUse > 0 &&
      answers.wouldRecommend !== ''
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormComplete()) {
      alert('נא למלא את כל השאלות לפני המשך');
      return;
    }
    
    // Get all session data from localStorage
    const userName = localStorage.getItem('userName');
    const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}');
    const courseRatings = JSON.parse(localStorage.getItem('courseRatings') || '[]');
    const sessionTime = localStorage.getItem('sessionTime');
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    // Get current date and time
    const now = new Date();
    const sessionDate = now.toLocaleDateString('he-IL');
    const sessionDateTime = now.toLocaleString('he-IL');
    
    // Create complete session data structure
    const sessionData = {
      sessionDate: sessionDate,
      sessionTime: sessionTime || '00:00:00',
      sessionDateTime: sessionDateTime,
      userInfo: {
        userName: userName,
        teacherInfo: teacherInfo,
        courseRatings: courseRatings
      },
      conversationHistory: chatHistory,
      survey: {
        answers: answers,
        completedAt: sessionDateTime
      }
    };
    
    // Convert to JSON string
    const jsonData = JSON.stringify(sessionData, null, 2);
    
    // Try to save to server first
    try {
      console.log('Attempting to save session to server...');
      const response = await fetch('/api/save-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData,
      });
      
      console.log('Server response status:', response.status);
      const result = await response.json();
      console.log('Server response:', result);
      
      if (result.success) {
        console.log('✅ Session saved to server:', result.filename);
        alert('השאלון נשמר בהצלחה!');
      } else {
        console.error('Server returned success=false:', result);
        throw new Error('Server save failed');
      }
    } catch (error) {
      console.error('Failed to save to server, will download locally:', error);
      
      // Fallback: Download the file locally if server is not available
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `session_${userName}_${now.getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    // Also save to localStorage for backup
    const existingSessions = JSON.parse(localStorage.getItem('sessionResults') || '[]');
    existingSessions.push(sessionData);
    localStorage.setItem('sessionResults', JSON.stringify(existingSessions));

    // Clear user session data
    localStorage.removeItem('userName');
    localStorage.removeItem('teacherInfo');
    localStorage.removeItem('courseRatings');
    localStorage.removeItem('sessionTime');
    localStorage.removeItem('chatHistory');

    // Logout and redirect
    await logout();
    navigate('/login');
  };

  const handleSkip = async () => {
    // Get all session data from localStorage
    const userName = localStorage.getItem('userName');
    const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}');
    const courseRatings = JSON.parse(localStorage.getItem('courseRatings') || '[]');
    const sessionTime = localStorage.getItem('sessionTime');
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    // Get current date and time
    const now = new Date();
    const sessionDate = now.toLocaleDateString('he-IL');
    const sessionDateTime = now.toLocaleString('he-IL');
    
    // Create session data without survey
    const sessionData = {
      sessionDate: sessionDate,
      sessionTime: sessionTime || '00:00:00',
      sessionDateTime: sessionDateTime,
      userInfo: {
        userName: userName,
        teacherInfo: teacherInfo,
        courseRatings: courseRatings
      },
      conversationHistory: chatHistory,
      survey: {
        skipped: true,
        skippedAt: sessionDateTime
      }
    };
    
    // Convert to JSON string
    const jsonData = JSON.stringify(sessionData, null, 2);
    
    // Try to save to server first
    try {
      console.log('Attempting to save skipped session to server...');
      const response = await fetch('/api/save-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData,
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('✅ Skipped session saved to server:', result.filename);
      }
    } catch (error) {
      console.error('Failed to save skipped session to server:', error);
      
      // Fallback: Download the file locally if server is not available
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `session_${userName}_${now.getTime()}_skipped.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    // Clear user session data
    localStorage.removeItem('userName');
    localStorage.removeItem('teacherInfo');
    localStorage.removeItem('courseRatings');
    localStorage.removeItem('sessionTime');
    localStorage.removeItem('chatHistory');

    // Logout and redirect
    await logout();
    navigate('/login');
  };

  const renderStars = (value: number, onChange: (val: number) => void) => {
    return (
      <div style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            style={{
              ...styles.star,
              color: star <= value ? '#ffd700' : '#ddd',
              cursor: 'pointer'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.surveyCard}>
        <h1 style={styles.title}>שאלון שביעות רצון</h1>
        <p style={styles.subtitle}>נשמח לשמוע על החוויה שלך</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Question 1: Satisfaction */}
          <div style={styles.question}>
            <label style={styles.label}>1. עד כמה את/ה מרוצה מהחוויה הכוללת בצ'אט?</label>
            {renderStars(answers.overallExperience, (val) => 
              setAnswers({ ...answers, overallExperience: val })
            )}
          </div>

          {/* Question 2: Helpfulness */}
          <div style={styles.question}>
            <label style={styles.label}>2. עד כמה היית מרוצה מאיכות התשובות של הצ'אט?</label>
            {renderStars(answers.responseQuality, (val) => 
              setAnswers({ ...answers, responseQuality: val })
            )}
          </div>

          {/* Question 3: Ease of Use */}
          <div style={styles.question}>
            <label style={styles.label}>3. עד כמה התשובות עזרו לך להבין או לפתור את מה שחיפשת?</label>
            {renderStars(answers.helpfulness, (val) => 
              setAnswers({ ...answers, helpfulness: val })
            )}
          </div>

          {/* Question 3: Ease of Use */}
          <div style={styles.question}>
            <label style={styles.label}>4. עד כמה המידע שהצ'אט סיפק היה מדויק בעיניך?</label>
            {renderStars(answers.accuracy, (val) => 
              setAnswers({ ...answers, accuracy: val })
            )}
          </div>

          {/* Question 3: Ease of Use */}
          <div style={styles.question}>
            <label style={styles.label}>5. עד כמה ההסברים היו ברורים וקלים להבנה?</label>
            {renderStars(answers.clarity, (val) => 
              setAnswers({ ...answers, clarity: val })
            )}
          </div>   

          {/* Question 3: Ease of Use */}
          <div style={styles.question}>
            <label style={styles.label}>6. עד כמה היה קל להשתמש בצ'אט?</label>
            {renderStars(answers.easeOfUse, (val) => 
              setAnswers({ ...answers, easeOfUse: val })
            )}
          </div>       

          {/* Question 3: Ease of Use */}
          <div style={styles.question}>
            <label style={styles.label}>7. עד כמה היית מרוצה ממהירות התגובה של הצ'אט?</label>
            {renderStars(answers.responseSpeed, (val) => 
              setAnswers({ ...answers, responseSpeed: val })
            )}
          </div> 

          {/* Question 3: Ease of Use */}
          <div style={styles.question}>
            <label style={styles.label}>8. עד כמה אהבת את העיצוב ונוחות השימוש בממשק הצ'אט?</label>
            {renderStars(answers.design, (val) => 
              setAnswers({ ...answers, design: val })
            )}
          </div>

          {/* Question 3: Ease of Use */}
          <div style={styles.question}>
            <label style={styles.label}>9. עד כמה הצ'אט הרגיש מותאם אישית לצרכים שלך?</label>
            {renderStars(answers.personalization, (val) => 
              setAnswers({ ...answers, personalization: val })
            )}
          </div>

          {/* Question 3: Ease of Use */}
          <div style={styles.question}>
            <label style={styles.label}>10. עד כמה את/ה צפוי/ה להשתמש בצ'אט שוב בעתיד?</label>
            {renderStars(answers.futureUse, (val) => 
              setAnswers({ ...answers, futureUse: val })
            )}
          </div>

          {/* extra */}
          <div style={styles.question}>
            <label style={styles.label}>האם תמליץ/י על המערכת לעמיתים?</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="wouldRecommend"
                  value="yes"
                  checked={answers.wouldRecommend === 'yes'}
                  onChange={(e) => setAnswers({ ...answers, wouldRecommend: e.target.value })}
                  style={styles.radio}
                />
                כן, בהחלט
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="wouldRecommend"
                  value="maybe"
                  checked={answers.wouldRecommend === 'maybe'}
                  onChange={(e) => setAnswers({ ...answers, wouldRecommend: e.target.value })}
                  style={styles.radio}
                />
                אולי
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="wouldRecommend"
                  value="no"
                  checked={answers.wouldRecommend === 'no'}
                  onChange={(e) => setAnswers({ ...answers, wouldRecommend: e.target.value })}
                  style={styles.radio}
                />
                לא
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                opacity: isFormComplete() ? 1 : 0.6,
                cursor: isFormComplete() ? 'pointer' : 'not-allowed'
              }}
              disabled={!isFormComplete()}
            >
              שלח ויציאה
            </button>
            <button type="button" onClick={handleSkip} style={styles.skipButton}>
              דלג ויציאה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    direction: 'rtl' as const
  },
  surveyCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '700px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    maxHeight: '85vh',
    overflowY: 'auto' as const
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#333',
    marginBottom: '10px',
    textAlign: 'center' as const
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
    textAlign: 'center' as const
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '25px'
  },
  question: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    transition: 'all 0.3s ease'
  },
  label: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#333',
    textAlign: 'right' as const
  },
  starsContainer: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px 0'
  },
  star: {
    fontSize: '36px',
    transition: 'all 0.2s ease',
    userSelect: 'none' as const,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease'
  },
  radio: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#7a35d5'
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
    justifyContent: 'center'
  },
  submitButton: {
    backgroundColor: '#7a35d5',
    color: 'white',
    border: 'none',
    padding: '14px 30px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(122, 53, 213, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(122, 53, 213, 0.4)'
    }
  },
  skipButton: {
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: 'none',
    padding: '14px 30px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default Survey;
