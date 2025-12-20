import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './components/Welcome';
import TeacherInfo from './components/TeacherInfo';
import CourseSelection from './components/CourseSelection';
import Register from './components/Register';
import Chat from './components/Chat';
import Survey from './components/Survey';
import FirebaseTest from './components/FirebaseTest';

function App() {
  useEffect(() => {
    if (!sessionStorage.getItem('ml_warmed')) {
      fetch("https://api-course-recommender.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "warmup",
          sector: "warmup",
          language: "warmup",
          teaches_elementary: 0,
          teaches_secondary: 0
        })
      }).catch(() => {});

      sessionStorage.setItem('ml_warmed', 'true');
    }
  }, []);
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Default route redirects to welcome */}
            <Route path="/" element={<Navigate to="/welcome" />} />

            {/* Public routes */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/teacher-info" element={<TeacherInfo />} />
            <Route path="/course-selection" element={<CourseSelection />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/survey"
              element={
                <ProtectedRoute>
                  <Survey />
                </ProtectedRoute>
              }
            />
            <Route
              path="/firebase-test"
              element={
                <ProtectedRoute>
                  <FirebaseTest />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/welcome" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;