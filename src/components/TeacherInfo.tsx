import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import backgroundImage from './pics/smsm.jpg';

interface TeacherData {
  name: string;
  subjectArea: string;
  schoolType: string;
  educationLevels: string[];
  language: string;
}

const TeacherInfo: React.FC = () => {
  const [teacherData, setTeacherData] = useState<TeacherData>({
    name: '',
    subjectArea: '',
    schoolType: '',
    educationLevels: [],
    language: ''
  });
  const [loading, setLoading] = useState(false);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [filteredSubjects, setFilteredSubjects] = useState<string[]>([]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Get the stored name from localStorage
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setTeacherData(prev => ({ ...prev, name: storedName }));
    }

    // Check if teacher info already exists
    const existingInfo = localStorage.getItem('teacherInfo');
    if (existingInfo) {
      const info = JSON.parse(existingInfo);
      // Remove yearsOfExperience, teachingStyle, and specialInterests if present from old data
      // Convert old subjectAreas array to single subjectArea string
      const { yearsOfExperience, teachingStyle, subjectAreas, gradeLevel, specialInterests, ...cleanedInfo } = info;
      const updatedInfo = {
        ...cleanedInfo,
        subjectArea: subjectAreas ? subjectAreas.join(', ') : info.subjectArea || ''
      };
      setTeacherData(prev => ({ ...prev, ...updatedInfo }));
      setSubjectSearchTerm(updatedInfo.subjectArea || '');
    }
  }, []);

  const handleInputChange = (field: keyof TeacherData, value: string) => {
    setTeacherData(prev => ({ ...prev, [field]: value }));
  };

    const handleEducationLevelChange = (level: string) => {
    setTeacherData(prev => ({
      ...prev,
      educationLevels: prev.educationLevels.includes(level)
        ? prev.educationLevels.filter(l => l !== level)
        : [...prev.educationLevels, level]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherData.subjectArea.trim() || !teacherData.schoolType || !teacherData.language) {
      alert('אנא מלאו את כל השדות הנדרשים');
      return;
    }

    // Check if the selected subject is from the predefined list
    if (!predefinedSubjects.includes(teacherData.subjectArea)) {
      alert('אנא בחרו מקצוע מהרשימה המוצעת');
      return;
    }

    try {
      setLoading(true);
      
      // Store teacher information in localStorage
      localStorage.setItem('teacherInfo', JSON.stringify(teacherData));
      
      // Navigate to course selection
      navigate('/course-selection');
    } catch (error) {
      console.error('Failed to save teacher info:', error);
      setLoading(false);
    }
  };

  const schoolTypes = [
    'יהודי', "בדואי", "ערבי", "דרוזי", "צרקסי", "אחר"
  ];

  const predefinedSubjects = [
    'מתמטיקה',
    'אנגלית',
    'עברית',
    'ערבית',
    'פיזיקה',
    'כימיה',
    'ביולוגיה',
    'היסטוריה',
    'גיאוגרפיה',
    'חינוך גופני',
    'מורה בכיתה',
    'חינוך מיוחד',
    'מדעי המחשב',
  ];

  // Function to calculate similarity between strings (for auto-correction)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = getEditDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - editDistance) / longer.length;
  };

  // Levenshtein distance algorithm for string similarity
  const getEditDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Filter and sort subjects based on search term
  const filterSubjects = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredSubjects(predefinedSubjects.slice(0, 10)); // Show first 10 subjects when empty
      return;
    }

    const results = predefinedSubjects
      .map(subject => ({
        subject,
        similarity: calculateSimilarity(searchTerm, subject),
        exactMatch: subject.includes(searchTerm),
        startsWith: subject.startsWith(searchTerm)
      }))
      .filter(item => item.similarity > 0.3 || item.exactMatch) // Threshold for similarity
      .sort((a, b) => {
        // Prioritize exact matches and starts with
        if (a.exactMatch && !b.exactMatch) return -1;
        if (!a.exactMatch && b.exactMatch) return 1;
        if (a.startsWith && !b.startsWith) return -1;
        if (!a.startsWith && b.startsWith) return 1;
        return b.similarity - a.similarity;
      })
      .slice(0, 8) // Limit to 8 suggestions
      .map(item => item.subject);

    setFilteredSubjects(results);
  };

  const handleSubjectSearch = (value: string) => {
    setSubjectSearchTerm(value);
    setTeacherData(prev => ({ ...prev, subjectArea: value }));
    filterSubjects(value);
    setShowSubjectDropdown(true);
  };

  const handleSubjectSelect = (subject: string) => {
    setSubjectSearchTerm(subject);
    setTeacherData(prev => ({ ...prev, subjectArea: subject }));
    setShowSubjectDropdown(false);
  };

  // Initialize filtered subjects on component mount
  React.useEffect(() => {
    filterSubjects('');
  }, []);

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.formContainer}>
        <h1 style={styles.title}>מידע על המורה</h1>
        <p style={styles.subtitle}>
          בואו נכיר אותך קצת יותר כדי שנוכל לתת לך המלצות מותאמות אישית
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Subject Area */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>איזה מקצוע אתה מלמד? *</label>
            <div style={styles.searchContainer}>
              <input
                type="text"
                value={subjectSearchTerm}
                onChange={(e) => handleSubjectSearch(e.target.value)}
                onFocus={() => {
                  setShowSubjectDropdown(true);
                  filterSubjects(subjectSearchTerm);
                }}
                onBlur={() => {
                  // Delay hiding dropdown to allow selection
                  setTimeout(() => setShowSubjectDropdown(false), 200);
                }}
                placeholder="חפש או בחר מקצוע..."
                style={{
                  ...styles.input,
                  borderColor: teacherData.subjectArea && predefinedSubjects.includes(teacherData.subjectArea) 
                    ? '#4CAF50' 
                    : teacherData.subjectArea && !predefinedSubjects.includes(teacherData.subjectArea)
                    ? '#f44336'
                    : '#e0e0e0'
                }}
                required
              />
              {showSubjectDropdown && filteredSubjects.length > 0 && (
                <div style={styles.dropdown}>
                  {filteredSubjects.map((subject, index) => (
                    <div
                      key={index}
                      className="dropdown-item"
                      style={styles.dropdownItem}
                      onClick={() => handleSubjectSelect(subject)}
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur from firing before click
                    >
                      {subject}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* School Type */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>איזה מגזר בית ספר אתה מלמד? *</label>
            <select
              value={teacherData.schoolType}
              onChange={(e) => handleInputChange('schoolType', e.target.value)}
              style={styles.select}
              required
            >
              <option value="">בחר מגזר</option>
              {schoolTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Education Levels */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>רמות חינוך:</label>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-start', direction: 'rtl', marginTop: '10px', flexWrap: 'wrap' }}>
              {['ממלכתי', 'ממלכתי דתי', 'חרדי', 'על יסודי', 'יסודי'].map(level => (
                <label key={level} style={{ display: 'flex', alignItems: 'center', direction: 'rtl', fontSize: '16px' }}>
                  <input
                    type="checkbox"
                    checked={teacherData.educationLevels.includes(level)}
                    onChange={() => handleEducationLevelChange(level)}
                    style={{ marginLeft: '8px' }}
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>

          {/* Language */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>שפת הוראה: *</label>
            <select
              value={teacherData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              style={styles.select}
              required
            >
              <option value="">בחר שפה</option>
              <option value="עברית">עברית</option>
              <option value="ערבית">ערבית</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading || !teacherData.subjectArea.trim() || !teacherData.schoolType || !teacherData.language || !predefinedSubjects.includes(teacherData.subjectArea)}
            style={{
              ...styles.button,
              opacity: (loading || !teacherData.subjectArea.trim() || !teacherData.schoolType || !teacherData.language || !predefinedSubjects.includes(teacherData.subjectArea)) ? 0.6 : 1,
              cursor: (loading || !teacherData.subjectArea.trim() || !teacherData.schoolType || !teacherData.language || !predefinedSubjects.includes(teacherData.subjectArea)) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'שומר...' : 'המשך לבחירת קורסים'}
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
    padding: '40px 32px',
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
    direction: 'rtl' as const,
    maxHeight: '90vh',
    overflowY: 'auto' as const
  },

  title: {
    marginBottom: '16px',
    color: '#1f1f1f',
    fontSize: '32px',
    fontWeight: 700,
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textAlign: 'center' as const
  },

  subtitle: {
    marginBottom: '32px',
    color: '#555',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '1.5',
    textAlign: 'center' as const
  },

  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px'
  },

  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },

  sectionTitle: {
    color: '#333',
    fontWeight: 600,
    fontSize: '16px'
  },

  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    background: '#fafafa',
    boxSizing: 'border-box' as const
  },

  select: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    background: '#fafafa'
  },

  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    background: '#fafafa',
    resize: 'vertical' as const,
    minHeight: '80px'
  },

  button: {
    width: '100%',
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: '#fff',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)',
    marginTop: '16px'
  },

  searchContainer: {
    position: 'relative' as const,
    width: '100%'
  },

  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '2px solid #e0e0e0',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    zIndex: 1000,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },

  dropdownItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '16px',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s ease',
    backgroundColor: 'white'
  }
};

// Add hover styles
const hoverStyles = `
  input:focus, select:focus, textarea:focus {
    border-color: #7a35d5 !important;
    box-shadow: 0 0 0 3px rgba(122, 53, 213, 0.1) !important;
    background: white !important;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4) !important;
  }

  .dropdown-item:hover {
    background-color: #f8f9ff !important;
    color: #7a35d5 !important;
  }

  .dropdown-item:last-child {
    border-bottom: none !important;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = hoverStyles;
  document.head.appendChild(style);
}

export default TeacherInfo;