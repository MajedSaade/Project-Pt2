import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/welcome" />;
  }

  // Check if teacher info is completed
  const teacherInfo = localStorage.getItem('teacherInfo');
  if (!teacherInfo) {
    return <Navigate to="/teacher-info" />;
  }

  // Parse and validate teacher info
  try {
    const parsedInfo = JSON.parse(teacherInfo);
    if (!parsedInfo.subjectArea || !parsedInfo.schoolType) {
      return <Navigate to="/teacher-info" />;
    }
  } catch {
    return <Navigate to="/teacher-info" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;