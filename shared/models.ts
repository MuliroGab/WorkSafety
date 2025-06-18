import mongoose, { Schema, Document } from 'mongoose';

// User Interface and Schema
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

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);

// Training Course Interface and Schema
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

const trainingCourseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  content: { type: String, required: true },
  isRequired: { type: Boolean, default: false },
}, { timestamps: true });

export const TrainingCourse = mongoose.model<ITrainingCourse>('TrainingCourse', trainingCourseSchema);

// User Course Progress Interface and Schema
export interface IUserCourseProgress extends Document {
  _id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userCourseProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'TrainingCourse', required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date },
}, { timestamps: true });

export const UserCourseProgress = mongoose.model<IUserCourseProgress>('UserCourseProgress', userCourseProgressSchema);

// Risk Assessment Interface and Schema
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

const riskAssessmentSchema = new Schema({
  title: { type: String, required: true },
  area: { type: String, required: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  assessorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  items: [{
    id: String,
    text: String,
    completed: { type: Boolean, default: false },
    required: { type: Boolean, default: true }
  }],
  completedAt: { type: Date },
}, { timestamps: true });

export const RiskAssessment = mongoose.model<IRiskAssessment>('RiskAssessment', riskAssessmentSchema);

// Safety Document Interface and Schema
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

const safetyDocumentSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
}, { timestamps: true });

export const SafetyDocument = mongoose.model<ISafetyDocument>('SafetyDocument', safetyDocumentSchema);

// Safety Incident Interface and Schema
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

const safetyIncidentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  area: { type: String, required: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
}, { timestamps: true });

export const SafetyIncident = mongoose.model<ISafetyIncident>('SafetyIncident', safetyIncidentSchema);

// Notification Interface and Schema
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

const notificationSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error', 'training', 'maintenance'], default: 'info' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);

// Validation schemas for API
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Valid email is required").optional(),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const createTrainingCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  content: z.string().min(1, "Content is required"),
  isRequired: z.boolean().default(false),
});

export const updateProgressSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  progress: z.number().min(0).max(100, "Progress must be between 0 and 100"),
});

export const createRiskAssessmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  area: z.string().min(1, "Area is required"),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  items: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, "Item text is required"),
    completed: z.boolean().default(false),
    required: z.boolean().default(true),
  })),
});

export const emergencyAlertSchema = z.object({
  message: z.string().min(1, "Emergency message is required"),
  area: z.string().min(1, "Area is required"),
});

export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  required: z.boolean(),
});

// Type definitions for API responses
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateTrainingCourseData = z.infer<typeof createTrainingCourseSchema>;
export type UpdateProgressData = z.infer<typeof updateProgressSchema>;
export type CreateRiskAssessmentData = z.infer<typeof createRiskAssessmentSchema>;
export type EmergencyAlertData = z.infer<typeof emergencyAlertSchema>;
export type ChecklistItemData = z.infer<typeof checklistItemSchema>;