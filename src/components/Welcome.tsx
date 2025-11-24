import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import avatarImage from './pics/avatar.png';
import backgroundImage from './pics/smsm.jpg';

const Welcome: React.FC = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser, loginAnonymously } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/teacher-info');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    try {
      setLoading(true);
      // Login anonymously and store the name in localStorage for later use
      await loginAnonymously();
      localStorage.setItem('userName', name.trim());
    } catch (error) {
      console.error('Failed to proceed:', error);
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.formContainer}>
        <div style={styles.avatarContainer}>
          <img src={avatarImage} alt="Avatar" style={styles.avatar} />
        </div>
        <h1 style={styles.title}>ברוכים הבאים!</h1>
        <p style={styles.subtitle}>
        הזן את שמך כדי להתחיל לדבר עם עוזר המלצות הקורסים שלנו.
        </p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>השם שלך:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הזין את שמך כאן..."
              required
              style={styles.input}
              disabled={loading}
            />
          </div>
          
          <button 
            disabled={loading || !name.trim()} 
            type="submit" 
            style={{
              ...styles.button,
              opacity: (!name.trim() || loading) ? 0.6 : 1,
              cursor: (!name.trim() || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'מתחיל...' : 'התחל עכשיו'}
          </button>
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
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    padding: '20px',
    direction: 'rtl' as const
  },

  formContainer: {
    backgroundColor: 'white',
    padding: '48px 32px',
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '460px',
    textAlign: 'center' as const,
    direction: 'rtl' as const
  },

  avatarContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px'
  },

  avatar: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '3px solid #7a35d5',
    boxShadow: '0 4px 15px rgba(122, 53, 213, 0.2)'
  },

  title: {
    marginBottom: '16px',
    color: '#1f1f1f',
    fontSize: '36px',
    fontWeight: 700,
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif'
  },

  subtitle: {
    marginBottom: '32px',
    color: '#555',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '1.5',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif'
  },

  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    textAlign: 'right' as const
  },

  label: {
    color: '#333',
    fontWeight: 600,
    fontSize: '15px',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif'
  },

  input: {
    width: '100%',
    padding: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.3s, box-shadow 0.3s',
    outline: 'none' as const,
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    background: '#fafafa',
    textAlign: 'right' as const,
    direction: 'rtl' as const
  },

  button: {
    width: '100%',
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: '#fff',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)',
    transform: 'translateY(0)',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif'
  }
};

// Add hover effect for the input
const inputHoverStyle = `
  input:focus {
    border-color: #7a35d5 !important;
    box-shadow: 0 0 0 3px rgba(122, 53, 213, 0.1) !important;
    background: white !important;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4) !important;
  }
`;

// Inject CSS for hover effects
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = inputHoverStyle;
  document.head.appendChild(style);
}

export default Welcome;
