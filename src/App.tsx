import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './components/Welcome';
import TeacherInfo from './components/TeacherInfo';
import CourseSelection from './components/CourseSelection';
import Register from './components/Register';
import Chat from './components/Chat';
import Survey from './components/Survey';

function App() {
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
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/welcome" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;