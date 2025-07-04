import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// User Schema and Interface
export interface IUser extends Document {
  _id: string;
  username: string;
  email?: string;
  name: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'employee' },
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);

// Training Course Schema and Interface
export interface ITrainingCourse extends Document {
  _id: string;
  title: string;
  description: string;
  duration: number;
  content: string;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const trainingCourseSchema = new Schema<ITrainingCourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  content: { type: String, required: true },
  isRequired: { type: Boolean, required: true, default: false },
}, {
  timestamps: true
});

export const TrainingCourse = mongoose.model<ITrainingCourse>('TrainingCourse', trainingCourseSchema);

// User Course Progress Schema and Interface
export interface IUserCourseProgress extends Document {
  _id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userCourseProgressSchema = new Schema<IUserCourseProgress>({
  userId: { type: String, required: true },
  courseId: { type: String, required: true },
  progress: { type: Number, required: true, default: 0 },
  completedAt: { type: Date },
}, {
  timestamps: true
});

export const UserCourseProgress = mongoose.model<IUserCourseProgress>('UserCourseProgress', userCourseProgressSchema);

// Risk Assessment Schema and Interface
export interface IRiskAssessment extends Document {
  _id: string;
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
}

const riskAssessmentSchema = new Schema<IRiskAssessment>({
  title: { type: String, required: true },
  area: { type: String, required: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  assessorId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  items: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, required: true, default: false },
    required: { type: Boolean, required: true, default: true }
  }],
  completedAt: { type: Date },
}, {
  timestamps: true
});

export const RiskAssessment = mongoose.model<IRiskAssessment>('RiskAssessment', riskAssessmentSchema);

// Safety Document Schema and Interface
export interface ISafetyDocument extends Document {
  _id: string;
  title: string;
  category: string;
  filePath: string;
  uploadedBy: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const safetyDocumentSchema = new Schema<ISafetyDocument>({
  title: { type: String, required: true },
  category: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  tags: [{ type: String }],
}, {
  timestamps: true
});

export const SafetyDocument = mongoose.model<ISafetyDocument>('SafetyDocument', safetyDocumentSchema);

// Safety Incident Schema and Interface
export interface ISafetyIncident extends Document {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  area: string;
  reportedBy: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const safetyIncidentSchema = new Schema<ISafetyIncident>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  area: { type: String, required: true },
  reportedBy: { type: String, required: true },
  status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
}, {
  timestamps: true
});

export const SafetyIncident = mongoose.model<ISafetyIncident>('SafetyIncident', safetyIncidentSchema);

// Notification Schema and Interface
export interface INotification extends Document {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'training' | 'maintenance';
  userId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error', 'training', 'maintenance'], required: true },
  userId: { type: String },
  isRead: { type: Boolean, required: true, default: false },
}, {
  timestamps: true
});

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);

// Validation Schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email().optional(),
  role: z.string().default("employee"),
});

export const createTrainingCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  content: z.string().min(1, "Content is required"),
  isRequired: z.boolean().default(false),
});

export const updateProgressSchema = z.object({
  courseId: z.string(),
  progress: z.number().min(0).max(100),
});

export const createRiskAssessmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  area: z.string().min(1, "Area is required"),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  items: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, "Item text is required"),
    completed: z.boolean().default(false),
    required: z.boolean().default(true),
  })),
});

export const emergencyAlertSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  area: z.string().min(1, "Area is required"),
});

export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  required: z.boolean(),
});

export const createSafetyIncidentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  area: z.string().min(1, "Area is required"),
  reportedBy: z.string(),
  status: z.enum(["open", "investigating", "resolved"]).default("open"),
});

export const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["info", "warning", "success", "error", "training", "maintenance"]),
  userId: z.string().optional(),
  isRead: z.boolean().default(false),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateTrainingCourseData = z.infer<typeof createTrainingCourseSchema>;
export type UpdateProgressData = z.infer<typeof updateProgressSchema>;
export type CreateRiskAssessmentData = z.infer<typeof createRiskAssessmentSchema>;
export type EmergencyAlertData = z.infer<typeof emergencyAlertSchema>;
export type ChecklistItemData = z.infer<typeof checklistItemSchema>;
export type CreateSafetyIncidentData = z.infer<typeof createSafetyIncidentSchema>;
export type CreateNotificationData = z.infer<typeof createNotificationSchema>;