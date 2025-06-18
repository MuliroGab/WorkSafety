import {
  users,
  trainingCourses,
  userCourseProgress,
  riskAssessments,
  safetyDocuments,
  safetyIncidents,
  notifications,
  type User,
  type InsertUser,
  type UpsertUser,
  type TrainingCourse,
  type InsertTrainingCourse,
  type UserCourseProgress,
  type InsertUserCourseProgress,
  type RiskAssessment,
  type InsertRiskAssessment,
  type SafetyDocument,
  type InsertSafetyDocument,
  type SafetyIncident,
  type InsertSafetyIncident,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users (for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Training Courses
  getAllCourses(): Promise<TrainingCourse[]>;
  getCourse(id: number): Promise<TrainingCourse | undefined>;
  createCourse(course: InsertTrainingCourse): Promise<TrainingCourse>;

  // User Course Progress
  getUserProgress(userId: number): Promise<UserCourseProgress[]>;
  getCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined>;
  updateProgress(userId: number, courseId: number, progress: number): Promise<UserCourseProgress>;

  // Risk Assessments
  getAllAssessments(): Promise<RiskAssessment[]>;
  getAssessment(id: number): Promise<RiskAssessment | undefined>;
  createAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  updateAssessment(id: number, updates: Partial<RiskAssessment>): Promise<RiskAssessment>;

  // Safety Documents
  getAllDocuments(): Promise<SafetyDocument[]>;
  getDocumentsByCategory(category: string): Promise<SafetyDocument[]>;
  createDocument(document: InsertSafetyDocument): Promise<SafetyDocument>;
  searchDocuments(query: string): Promise<SafetyDocument[]>;

  // Safety Incidents
  getAllIncidents(): Promise<SafetyIncident[]>;
  getRecentIncidents(limit?: number): Promise<SafetyIncident[]>;
  createIncident(incident: InsertSafetyIncident): Promise<SafetyIncident>;

  // Notifications
  getNotifications(userId?: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;

  // Analytics
  getSafetyMetrics(): Promise<{
    safetyScore: number;
    incidentsThisMonth: number;
    trainingCompletion: number;
    riskAssessments: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Training course operations
  async getAllCourses(): Promise<TrainingCourse[]> {
    return await db.select().from(trainingCourses);
  }

  async getCourse(id: number): Promise<TrainingCourse | undefined> {
    const [course] = await db.select().from(trainingCourses).where(eq(trainingCourses.id, id));
    return course;
  }

  async createCourse(insertCourse: InsertTrainingCourse): Promise<TrainingCourse> {
    const [course] = await db
      .insert(trainingCourses)
      .values(insertCourse)
      .returning();
    return course;
  }

  // User progress operations
  async getUserProgress(userId: number): Promise<UserCourseProgress[]> {
    return await db.select().from(userCourseProgress).where(eq(userCourseProgress.userId, userId));
  }

  async getCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userCourseProgress)
      .where(and(
        eq(userCourseProgress.userId, userId),
        eq(userCourseProgress.courseId, courseId)
      ));
    return progress;
  }

  async updateProgress(userId: number, courseId: number, progressValue: number): Promise<UserCourseProgress> {
    const [progress] = await db
      .insert(userCourseProgress)
      .values({
        userId,
        courseId,
        progress: progressValue,
        completedAt: progressValue === 100 ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: [userCourseProgress.userId, userCourseProgress.courseId],
        set: {
          progress: progressValue,
          completedAt: progressValue === 100 ? new Date() : null,
        },
      })
      .returning();
    return progress;
  }

  // Risk assessment operations
  async getAllAssessments(): Promise<RiskAssessment[]> {
    return await db.select().from(riskAssessments);
  }

  async getAssessment(id: number): Promise<RiskAssessment | undefined> {
    const [assessment] = await db.select().from(riskAssessments).where(eq(riskAssessments.id, id));
    return assessment;
  }

  async createAssessment(insertAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const [assessment] = await db
      .insert(riskAssessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }

  async updateAssessment(id: number, updates: Partial<RiskAssessment>): Promise<RiskAssessment> {
    const [assessment] = await db
      .update(riskAssessments)
      .set(updates)
      .where(eq(riskAssessments.id, id))
      .returning();
    return assessment;
  }

  // Document operations
  async getAllDocuments(): Promise<SafetyDocument[]> {
    return await db.select().from(safetyDocuments);
  }

  async getDocumentsByCategory(category: string): Promise<SafetyDocument[]> {
    return await db.select().from(safetyDocuments).where(eq(safetyDocuments.category, category));
  }

  async createDocument(insertDocument: InsertSafetyDocument): Promise<SafetyDocument> {
    const [document] = await db
      .insert(safetyDocuments)
      .values(insertDocument)
      .returning();
    return document;
  }

  async searchDocuments(query: string): Promise<SafetyDocument[]> {
    // Note: This is a simple implementation. For production, consider using full-text search
    const documents = await db.select().from(safetyDocuments);
    const lowercaseQuery = query.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(lowercaseQuery) ||
      doc.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Incident operations
  async getAllIncidents(): Promise<SafetyIncident[]> {
    return await db.select().from(safetyIncidents);
  }

  async getRecentIncidents(limit = 10): Promise<SafetyIncident[]> {
    const incidents = await db.select().from(safetyIncidents);
    return incidents
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createIncident(insertIncident: InsertSafetyIncident): Promise<SafetyIncident> {
    const [incident] = await db
      .insert(safetyIncidents)
      .values(insertIncident)
      .returning();
    return incident;
  }

  // Notification operations
  async getNotifications(userId?: number): Promise<Notification[]> {
    const notifications = await db.select().from(notifications);
    return notifications
      .filter(n => !userId || n.userId === userId || n.userId === null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Analytics
  async getSafetyMetrics(): Promise<{
    safetyScore: number;
    incidentsThisMonth: number;
    trainingCompletion: number;
    riskAssessments: number;
  }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [incidents, progress, assessments] = await Promise.all([
      db.select().from(safetyIncidents),
      db.select().from(userCourseProgress),
      db.select().from(riskAssessments),
    ]);
    
    const incidentsThisMonth = incidents
      .filter(incident => incident.createdAt >= monthStart).length;
    
    const completedCourses = progress.filter(p => p.progress === 100).length;
    const trainingCompletion = progress.length > 0 
      ? Math.round((completedCourses / progress.length) * 100) 
      : 0;
    
    const riskAssessmentsCount = assessments.length;
    
    // Calculate safety score based on various factors
    const baseScore = 100;
    const incidentPenalty = incidentsThisMonth * 5;
    const trainingBonus = trainingCompletion > 90 ? 5 : 0;
    const safetyScore = Math.max(0, Math.min(100, baseScore - incidentPenalty + trainingBonus));
    
    return {
      safetyScore,
      incidentsThisMonth,
      trainingCompletion,
      riskAssessments: riskAssessmentsCount
    };
  }
}

export const storage = new DatabaseStorage();