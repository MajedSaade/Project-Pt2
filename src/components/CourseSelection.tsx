import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import backgroundImage from './pics/smsm.jpg';
import { coursesData } from '../data/coursesData';

interface Course {
  id: string;
  name: string;
  category: string;
  language: string;
}

interface CourseRating {
  courseId: string;
  courseName: string;
  rating: number;
}

const CourseSelection: React.FC = () => {
  const [courseRatings, setCourseRatings] = useState<CourseRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('הכל');
  const [selectedSubDomain, setSelectedSubDomain] = useState<string>('הכל');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('הכל');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const navigate = useNavigate();

  // Use the imported courses data from Excel
  const courseCategories = coursesData;

  useEffect(() => {
    // Load previously rated courses if they exist
    const existingRatings = localStorage.getItem('courseRatings');
    if (existingRatings) {
      setCourseRatings(JSON.parse(existingRatings));
    }
  }, []);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    // Check if this course already has a rating
    const existingRating = courseRatings.find(r => r.courseId === course.id);
    setCurrentRating(existingRating?.rating || 0);
    setModalOpen(true);
  };

  const handleRatingSubmit = () => {
    if (selectedCourse && currentRating > 0) {
      const newRating: CourseRating = {
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        rating: currentRating
      };

      // Update or add rating
      setCourseRatings(prev => {
        const filtered = prev.filter(r => r.courseId !== selectedCourse.id);
        return [...filtered, newRating];
      });

      setModalOpen(false);
      setSelectedCourse(null);
      setCurrentRating(0);
      setHoveredRating(0);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCourse(null);
    setCurrentRating(0);
    setHoveredRating(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Store course ratings in localStorage
      localStorage.setItem('courseRatings', JSON.stringify(courseRatings));
      
      // Navigate to chat
      navigate('/chat');
    } catch (error) {
      console.error('Failed to save course ratings:', error);
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Store empty array if user skips
    localStorage.setItem('courseRatings', JSON.stringify([]));
    navigate('/chat');
  };

  // Extract unique domains, sub-domains, and languages from categories
  const getDomainsAndSubDomains = () => {
    const domains = new Set<string>();
    const subDomains = new Set<string>();
    const languages = new Set<string>();

    Object.entries(courseCategories).forEach(([categoryName, courses]) => {
      // Parse category name (format: "תחום - תת תחום" or just "תחום")
      const parts = categoryName.split(' - ');
      if (parts.length > 0) {
        domains.add(parts[0].trim());
        if (parts.length > 1) {
          subDomains.add(parts[1].trim());
        }
      }
      
      // Extract languages from courses
      courses.forEach(course => {
        if (course.language) {
          languages.add(course.language);
        }
      });
    });

    return {
      domains: ['הכל', ...Array.from(domains).sort()],
      subDomains: ['הכל', ...Array.from(subDomains).sort()],
      languages: ['הכל', ...Array.from(languages).sort()]
    };
  };

  const { domains, subDomains, languages } = getDomainsAndSubDomains();

  // Filter courses based on all criteria
  const getFilteredCourses = () => {
    const searchResults: Record<string, Course[]> = {};

    Object.entries(courseCategories).forEach(([categoryName, courses]) => {
      // Parse category for domain/subdomain filtering
      const parts = categoryName.split(' - ');
      const domain = parts[0]?.trim() || '';
      const subDomain = parts[1]?.trim() || '';

      // Apply domain filter
      if (selectedDomain !== 'הכל' && domain !== selectedDomain) {
        return;
      }

      // Apply sub-domain filter
      if (selectedSubDomain !== 'הכל' && subDomain !== selectedSubDomain) {
        return;
      }

      // Filter courses within this category
      const matchingCourses = courses.filter(course => {
        // Apply language filter
        if (selectedLanguage !== 'הכל' && course.language !== selectedLanguage) {
          return false;
        }

        // Apply search filter
        if (searchTerm.trim() && !course.name.includes(searchTerm.trim())) {
          return false;
        }

        return true;
      });

      if (matchingCourses.length > 0) {
        searchResults[categoryName] = matchingCourses;
      }
    });

    return searchResults;
  };

  const filteredCourseCategories = getFilteredCourses();

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.formContainer}>
        <h1 style={styles.title}>בחירת קורסים</h1>
        <p style={styles.subtitle}>
          באילו קורסים השתתפת בעבר? זה יעזור לנו לתת לך המלצות מותאמות יותר
        </p>

        {/* Top Controls */}
        <div style={styles.topControls}>
          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש קורס..."
              style={styles.searchInput}
            />
          </div>

          {/* Filters Row */}
          <div style={styles.filtersRow}>
            {/* Domain Filter */}
            <div style={styles.filterContainer}>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                style={styles.filterSelect}
              >
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain === 'הכל' ? 'כל התחומים' : domain}</option>
                ))}
              </select>
            </div>

            {/* Sub-Domain Filter */}
            <div style={styles.filterContainer}>
              <select
                value={selectedSubDomain}
                onChange={(e) => setSelectedSubDomain(e.target.value)}
                style={styles.filterSelect}
              >
                {subDomains.map(subDomain => (
                  <option key={subDomain} value={subDomain}>{subDomain === 'הכל' ? 'כל תתי התחומים' : subDomain}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div style={styles.filterContainer}>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={styles.filterSelect}
              >
                {languages.map(language => (
                  <option key={language} value={language}>{language === 'הכל' ? 'כל השפות' : language}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.topButtonContainer}>
            <button 
              type="button" 
              onClick={handleSkip}
              className="top-skip-button"
              style={styles.topSkipButton}
            >
              דלג
            </button>
            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={loading || courseRatings.length === 0}
              className="top-continue-button"
              style={{
                ...styles.topContinueButton,
                opacity: (loading || courseRatings.length === 0) ? 0.6 : 1,
                cursor: (loading || courseRatings.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'שומר...' : 'המשך לצ\'אט'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {Object.keys(filteredCourseCategories).length === 0 ? (
            <div style={styles.noResults}>
              <p style={styles.noResultsText}>לא נמצאו קורסים המתאימים לחיפוש</p>
              <button 
                type="button" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDomain('הכל');
                  setSelectedSubDomain('הכל');
                  setSelectedLanguage('הכל');
                }}
                className="clear-filters-button"
                style={styles.clearFiltersButton}
              >
                נקה סינון
              </button>
            </div>
          ) : (
            Object.entries(filteredCourseCategories).map(([categoryName, courses]) => (
              <div key={categoryName} style={styles.categorySection}>
                <h3 style={styles.categoryTitle}>{categoryName}</h3>
                <div style={styles.coursesGrid}>
                  {courses.map(course => {
                    const rating = courseRatings.find(r => r.courseId === course.id);
                    return (
                      <div 
                        key={course.id} 
                        style={{
                          ...styles.courseCard,
                          border: rating ? '2px solid #7a35d5' : '1px solid #e0e0e0'
                        }}
                        onClick={() => handleCourseClick(course)}
                        className="course-card"
                      >
                        <span style={styles.courseName}>{course.name}</span>
                        {rating && (
                          <div style={styles.ratingBadge}>
                            {'⭐'.repeat(rating.rating)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          <div style={styles.selectedInfo}>
            <p style={styles.selectedText}>
              דירגת {courseRatings.length} קורסים
            </p>
          </div>

          <div style={styles.buttonContainer}>
            <button 
              type="button" 
              onClick={handleSkip}
              style={styles.skipButton}
            >
              דלג
            </button>
            <button 
              type="submit" 
              disabled={loading || courseRatings.length === 0}
              style={{
                ...styles.submitButton,
                opacity: (loading || courseRatings.length === 0) ? 0.6 : 1,
                cursor: (loading || courseRatings.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'שומר...' : 'המשך לצ\'אט'}
            </button>
          </div>
        </form>
      </div>

      {/* Rating Modal */}
      {modalOpen && selectedCourse && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>דרג את הקורס</h2>
            <p style={styles.modalCourseName}>{selectedCourse.name}</p>
            
            <div style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = hoveredRating >= star || currentRating >= star;
                return (
                  <span
                    key={star}
                    style={{
                      ...styles.star,
                      color: isFilled ? '#ffc107' : '#d3d3d3',
                      filter: isFilled ? 'none' : 'grayscale(100%)'
                    }}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setCurrentRating(star)}
                  >
                    {isFilled ? '★' : '☆'}
                  </span>
                );
              })}
            </div>

            <div style={styles.modalButtons}>
              <button 
                style={styles.cancelButton} 
                onClick={closeModal}
                className="cancel-button"
              >
                ביטול
              </button>
              <button 
                style={{
                  ...styles.confirmButton,
                  opacity: currentRating > 0 ? 1 : 0.5,
                  cursor: currentRating > 0 ? 'pointer' : 'not-allowed'
                }}
                onClick={handleRatingSubmit}
                disabled={currentRating === 0}
                className="confirm-button"
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}
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
    maxWidth: '900px',
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

  categorySection: {
    marginBottom: '24px'
  },

  categoryTitle: {
    color: '#333',
    fontWeight: 600,
    fontSize: '18px',
    marginBottom: '12px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '8px'
  },

  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '12px'
  },

  courseCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #e0e0e0',
    direction: 'rtl' as const,
    position: 'relative' as const,
    minHeight: '60px'
  },

  courseName: {
    fontSize: '14px',
    color: '#333',
    fontWeight: 500,
    marginBottom: '4px'
  },

  ratingBadge: {
    fontSize: '12px',
    marginTop: '4px',
    display: 'flex',
    gap: '2px'
  },

  selectedInfo: {
    textAlign: 'center' as const,
    padding: '16px',
    backgroundColor: '#f0f8ff',
    borderRadius: '8px',
    border: '1px solid #cce7ff'
  },

  selectedText: {
    color: '#0066cc',
    fontWeight: 600,
    margin: 0
  },

  buttonContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '24px'
  },

  skipButton: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },

  submitButton: {
    padding: '12px 24px',
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)'
  },

  topControls: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    padding: '20px 0',
    borderBottom: '2px solid #e0e0e0',
    marginBottom: '24px'
  },

  searchContainer: {
    width: '100%'
  },

  searchInput: {
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

  filtersRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    flexWrap: 'wrap' as const
  },

  filterContainer: {
    flex: '1',
    minWidth: '180px'
  },

  filterSelect: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    background: '#fafafa',
    cursor: 'pointer'
  },

  topButtonContainer: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '8px',
    flexWrap: 'wrap' as const
  },

  topSkipButton: {
    padding: '16px 173px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap' as const,
    minWidth: '140px',
    height: '52px'
  },

  topContinueButton: {
    padding: '16px 173px',
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 20px rgba(106, 17, 203, 0.35)',
    whiteSpace: 'nowrap' as const,
    minWidth: '160px',
    height: '52px'
    },

  noResults: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '2px dashed #dee2e6'
  },

  noResultsText: {
    color: '#6c757d',
    fontSize: '18px',
    fontWeight: 500,
    marginBottom: '16px'
  },

  clearFiltersButton: {
    padding: '10px 20px',
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },

  modalContent: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '500px',
    width: '90%',
    direction: 'rtl' as const,
    animation: 'slideIn 0.3s ease'
  },

  modalTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1f1f1f',
    marginBottom: '8px',
    textAlign: 'center' as const
  },

  modalCourseName: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '24px',
    textAlign: 'center' as const,
    fontWeight: 500
  },

  starsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '32px',
    padding: '20px 0'
  },

  star: {
    fontSize: '48px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none' as const
  },

  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },

  cancelButton: {
    padding: '12px 32px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },

  confirmButton: {
    padding: '12px 32px',
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)'
  }
};

// Add hover styles
const hoverStyles = `
  .course-card:hover {
    background-color: #e9ecef !important;
    border-color: #7a35d5 !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(122, 53, 213, 0.2) !important;
  }
  
  .skip-button:hover {
    background-color: #5a6268 !important;
  }
  
  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4) !important;
  }

  input:focus, select:focus {
    border-color: #7a35d5 !important;
    box-shadow: 0 0 0 3px rgba(122, 53, 213, 0.1) !important;
    background: white !important;
  }

  .top-skip-button:hover {
    background-color: #5a6268 !important;
    transform: translateY(-1px) !important;
  }

  .top-continue-button:hover:not(:disabled) {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4) !important;
  }

  .clear-filters-button:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3) !important;
  }

  .cancel-button:hover {
    background-color: #5a6268 !important;
  }

  .confirm-button:hover:not(:disabled) {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.5) !important;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = hoverStyles;
  document.head.appendChild(style);
}

export default CourseSelection;