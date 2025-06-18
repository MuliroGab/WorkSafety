// Re-export types from models for compatibility
export type { 
  LoginFormData, 
  RegisterFormData, 
  CreateTrainingCourseData,
  UpdateProgressData,
  CreateRiskAssessmentData,
  EmergencyAlertData,
  ChecklistItemData
} from './models';

export { 
  loginSchema, 
  registerSchema, 
  createTrainingCourseSchema,
  updateProgressSchema,
  createRiskAssessmentSchema,
  emergencyAlertSchema,
  checklistItemSchema
} from './models';

// Legacy types for compatibility with existing code
export type User = {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertUser = Partial<User>;
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// Additional types for backwards compatibility
export type TrainingCourse = {
  id: string;
  title: string;
  description: string;
  duration: number;
  content: string;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserCourseProgress = {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type RiskAssessment = {
  id: string;
  title: string;
  area: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  assessorId: string;
  status: 'pending' | 'in_progress' | 'completed';
  items: Array<{
    id: string;
    text: string;
    completed: boolean;
    required: boolean;
  }>;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type SafetyDocument = {
  id: string;
  title: string;
  category: string;
  filePath: string;
  uploadedBy: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type SafetyIncident = {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  area: string;
  reportedBy: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'training' | 'maintenance';
  userId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
};