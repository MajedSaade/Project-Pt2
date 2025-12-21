export interface User {
  uid: string;
  name: string;
  email: string;
  subjectInterests: string[];
  gradeLevel: string;
  createdAt: Date;
}


export interface TeacherProfile {
  name: string;
  subjectArea: string;
  schoolType: string;
  language: string;
  educationLevels: string[];
  previousCourses: { courseId: string; courseName: string; }[];
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AuthContextType {
  currentUser: User | null;
  logout: () => Promise<void>;
  loading: boolean;
  loginAnonymously: () => Promise<void>;
}