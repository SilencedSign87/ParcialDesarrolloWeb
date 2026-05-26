export interface User {
  id: string;
  fullName: string;
  email: string;
  documentNumber: string;
  specialty: string;
  role: 'admin' | 'user';
  password: string;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple' | 'open';
  options?: string[];
  correctAnswer?: string | number;
}

export interface Exam {
  id: string;
  title: string;
  area: string;
  type: 'multiple' | 'open' | 'mixed';
  questions: Question[];
  minPassPercentage: number;
  createdAt: string;
  createdBy: string;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string;
  answers: Record<string, string>;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface Certificate {
  id: string;
  hash: string;
  userId: string;
  examId: string;
  userName: string;
  examTitle: string;
  score: number;
  issuedAt: string;
  publicUrl: string;
}

export interface CurriculumEntry {
  id: string;
  userId: string;
  type: 'work' | 'education';
  title: string;
  institution: string;
  startDate: string;
  endDate?: string;
  description?: string;
}