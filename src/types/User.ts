export interface User {
  uid: string;
  name: string;
  email: string;
  subjectInterests: string[];
  gradeLevel: string;
  createdAt: Date;
}

export interface UserProfile {
  name: string;
  email: string;
  subjectInterests: string[];
  gradeLevel: string;
}

export interface TeacherProfile {
  name: string;
  subjectArea: string;
  schoolType: string;
  language: string;
  previousCourses?: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profile: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  loginAnonymously: () => Promise<void>;
}