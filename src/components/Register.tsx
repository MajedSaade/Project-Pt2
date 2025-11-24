import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import backgroundImage from './pics/smsm.jpg';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    subjectInterests: [] as string[],
    gradeLevel: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const subjectOptions = [
    'Mathematics',
    'Science',
    'English/Language Arts',
    'Social Studies',
    'Art',
    'Music',
    'Physical Education',
    'Technology',
    'Foreign Languages',
    'Special Education'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjectInterests: prev.subjectInterests.includes(subject)
        ? prev.subjectInterests.filter(s => s !== subject)
        : [...prev.subjectInterests, subject]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.subjectInterests.length === 0) {
      return setError('Please select at least one subject interest');
    }

    try {
      setError('');
      setLoading(true);

      await register(formData.email, formData.password, {
        name: formData.name,
        email: formData.email,
        subjectInterests: formData.subjectInterests,
        gradeLevel: formData.gradeLevel,
      });

      navigate('/chat');
    } catch (error: any) {
      setError('Failed to create account: ' + (error.message || 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Create Your Account</h2>
        <p style={styles.subtitle}>Join our course recommendation community</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Grade Level You Teach:</label>
            <select
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleInputChange}
              required
              style={styles.input}
            >
              <option value="">Select Grade Level</option>
              <option value="elementary school">elementary school (elementary school)</option>
              <option value="Middle School">Middle School (Middle School)</option>
              <option value="High School">High School (High School)</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Subject Interests (select all that apply):</label>
            <div style={styles.checkboxGrid}>
              {subjectOptions.map((subject) => (
                <label key={subject} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.subjectInterests.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                    style={styles.checkbox}
                  />
                  {subject}
                </label>
              ))}
            </div>
          </div>

          <button disabled={loading} type="submit" style={styles.button}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p style={styles.linkText}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
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
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    fontFamily: '"Inter", sans-serif',
    padding: '20px'
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px'
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: '10px',
    color: '#333',
    fontSize: '24px'
  },
  subtitle: {
    textAlign: 'center' as const,
    marginBottom: '30px',
    color: '#666',
    fontSize: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#333',
    fontWeight: 'bold' as const
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    boxSizing: 'border-box' as const
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
    marginTop: '10px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer'
  },
  checkbox: {
    marginRight: '8px'
  },
  button: {
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    boxShadow: '0 4px 10px rgba(184, 78, 241, 0.3)',
    marginTop: '10px'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  },
  linkText: {
    textAlign: 'center' as const,
    marginTop: '20px',
    color: '#666'
  },
  link: {
    color: '#7a35d5',
    textDecoration: 'none'
  }
};

export default Register;