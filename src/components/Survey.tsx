import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';

interface SurveyAnswers {
  overallExperience: number;
  responseQuality: number;
  accuracy: number;
  clarity: number;
  easeOfUse: number;
  wouldRecommend: string;
  generalFeedback: string;
}

const Survey: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<SurveyAnswers>({
    overallExperience: 0,
    responseQuality: 0,
    accuracy: 0,
    clarity: 0,
    easeOfUse: 0,
    wouldRecommend: '',
    generalFeedback: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormComplete = () => {
    return (
      answers.overallExperience > 0 &&
      answers.responseQuality > 0 &&
      answers.accuracy > 0 &&
      answers.clarity > 0 &&
      answers.easeOfUse > 0 &&
      answers.wouldRecommend !== ''
    );
  };

  const saveSessionToFirebase = async (data: any) => {
    try {
      // Add user ID if available
      if (currentUser) {
        data.userId = currentUser.uid;
      }

      // Save to Firestore Database
      const docRef = await addDoc(collection(db, 'sessions'), data);
      console.log('✅ Document written to Firestore with ID: ', docRef.id);

      // Also save to Firebase Storage as JSON file
      if (currentUser) {
        const chatData = JSON.stringify(data, null, 2);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `sessions/${currentUser.uid}/session_${timestamp}.json`;
        const storageRef = ref(storage, fileName);

        await uploadString(storageRef, chatData, 'raw', { contentType: 'application/json' });
        console.log('✅ Session JSON saved to Storage: ', fileName);
      }

      return true;
    } catch (e) {
      console.error('Error saving session: ', e);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormComplete()) {
      alert('נא למלא את כל השאלות לפני המשך');
      return;
    }

    setIsSubmitting(true);

    // Get all session data from localStorage
    const userName = localStorage.getItem('userName');
    const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}');
    const selectedCourses = JSON.parse(localStorage.getItem('selectedCourses') || '[]');
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
      timestamp: now, // specific timestamp for sorting
      userInfo: {
        userName: userName,
        teacherInfo: teacherInfo,
        selectedCourses: selectedCourses
      },
      conversationHistory: chatHistory,
      survey: {
        answers: answers,
        completedAt: sessionDateTime
      }
    };

    // Save to Firestore
    const success = await saveSessionToFirebase(sessionData);

    if (success) {
      alert('השאלון והשיחה נשמרו בהצלחה!');
    } else {
      alert('שגיאה בשמירת הנתונים. אנא נסה שוב מאוחר יותר.');
    }

    // Clear user session data
    localStorage.removeItem('userName');
    localStorage.removeItem('teacherInfo');
    localStorage.removeItem('selectedCourses');
    localStorage.removeItem('sessionTime');
    localStorage.removeItem('chatHistory');

    setIsSubmitting(false);

    // Logout and redirect
    await logout();
    navigate('/welcome');
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

          {/* Question 2: Recommendations quality */}
          <div style={styles.question}>
            <label style={styles.label}>2. עד כמה היית מרוצה מההמלצות של הצ'אט?</label>
            {renderStars(answers.responseQuality, (val) =>
              setAnswers({ ...answers, responseQuality: val })
            )}
          </div>

          {/* Question 3: Accuracy */}
          <div style={styles.question}>
            <label style={styles.label}>3. עד כמה ההסברים שסופקו לך היו מועילים?</label>
            {renderStars(answers.accuracy, (val) =>
              setAnswers({ ...answers, accuracy: val })
            )}
          </div>

          {/* Question 4: Clarity */}
          <div style={styles.question}>
            <label style={styles.label}>4. עד כמה ההסברים שסופקו לך היו ברורים?</label>
            {renderStars(answers.clarity, (val) =>
              setAnswers({ ...answers, clarity: val })
            )}
          </div>

          {/* Question 5: Ease of Use */}
          <div style={styles.question}>
            <label style={styles.label}>5. עד כמה היה קל להשתמש בצ'אט?</label>
            {renderStars(answers.easeOfUse, (val) =>
              setAnswers({ ...answers, easeOfUse: val })
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

          {/* Question 6: General Feedback */}
          <div style={styles.question}>
            <label style={styles.label}>משוב כללי על השימוש במערכת המלצות המורים:</label>
            <textarea
              value={answers.generalFeedback}
              onChange={(e) => setAnswers({ ...answers, generalFeedback: e.target.value })}
              placeholder="כתבו כאן את המשוב שלכם..."
              style={styles.textarea}
            />
          </div>

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: isFormComplete() && !isSubmitting ? 1 : 0.6,
                cursor: isFormComplete() && !isSubmitting ? 'pointer' : 'not-allowed'
              }}
              disabled={!isFormComplete() || isSubmitting}
            >
              {isSubmitting ? 'שולח...' : 'שלח ויציאה'}
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
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    marginTop: '8px',
    backgroundColor: 'white',
    color: '#333',
    direction: 'rtl' as const,
    textAlign: 'right' as const
  }
};

export default Survey;
