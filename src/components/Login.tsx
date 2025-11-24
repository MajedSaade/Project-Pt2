import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser, login, loginAnonymously } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  if (currentUser) {
    navigate('/chat');
  }
}, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      let message = "Something went wrong. Please try again.";

      switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        message = "Invalid email or password.";
        break;
      case "auth/too-many-requests":
        message = "Too many login attempts. Try again later.";
        break;
      case "auth/network-request-failed":
        message = "Network error. Please check your internet connection.";
        break;

      default:
        message = "Login failed. Please try again.";
    }

    setError(message);
    
    }
    setLoading(false);
  };

  const handleAnonymousLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginAnonymously();

    } catch (error: any) {
      let message = "Something went wrong. Please try again.";

      switch (error.code) {
        case "auth/operation-not-allowed":
          message = "Anonymous login is not enabled.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Please check your internet connection.";
          break;
        default:
          message = "Anonymous login failed. Please try again.";
      }
      setError(message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Course Recommendation Chat</h2>
        <h3 style={styles.subtitle}>Login to Your Account</h3>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          
          <button disabled={loading} type="submit" style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.divider}>
        <span style={styles.dividerLine}></span>
        <span style={styles.dividerText}>OR</span>
        <span style={styles.dividerLine}></span>
        </div>

        <button
          disabled={loading}
          onClick={handleAnonymousLogin}
          style={{ 
            ...styles.button, 
            marginTop: '10px', 
            background: 'linear-gradient(to right, #7a35d5, #b84ef1)' 
          }}
        >
          {loading ? 'Logging in...' : 'Continue as a Guest'}
        </button>
        
        <p style={styles.linkText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
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
    backgroundImage: 'url("/smsm.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    fontFamily: '"Inter", sans-serif',
    padding: '20px'
  },

  formContainer: {
    backgroundColor: 'white',
    padding: '40px 32px',
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  },

  title: {
    textAlign: 'center' as const,
    marginBottom: '6px',
    color: '#1f1f1f',
    fontSize: '28px',
    fontWeight: 700
  },

  subtitle: {
    textAlign: 'center' as const,
    marginBottom: '24px',
    color: '#555',
    fontSize: '15px',
    fontWeight: 400 as const
  },

  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },

  label: {
    color: '#333',
    fontWeight: 600,
    fontSize: '14px',
  },

  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none' as const
  },

  button: {
    width: '100%',
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: '#fff',
    padding: '12px',
    border: 'none',
    borderRadius: '999px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    boxShadow: '0 4px 10px rgba(106, 17, 203, 0.2)'
  },
  error: {
    backgroundColor: '#fcebea',
    color: '#cc1f1a',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
    fontSize: '14px'
  },

  linkText: {
    textAlign: 'center' as const,
    marginTop: '24px',
    fontSize: '14px',
    color: '#555'
  },

  link: {
    color: '#7a35d5',
    textDecoration: 'none',
    fontWeight: 500,
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0 16px 0',
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    margin: '0 12px',
    color: '#888',
    fontWeight: 500,
    fontSize: '13px',
    letterSpacing: '1px',
  }
};

export default Login;