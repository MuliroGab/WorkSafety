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

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
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

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private courses: Map<number, TrainingCourse> = new Map();
  private progress: Map<string, UserCourseProgress> = new Map();
  private assessments: Map<number, RiskAssessment> = new Map();
  private documents: Map<number, SafetyDocument> = new Map();
  private incidents: Map<number, SafetyIncident> = new Map();
  private notifications: Map<number, Notification> = new Map();
  
  private currentUserId = 1;
  private currentCourseId = 1;
  private currentProgressId = 1;
  private currentAssessmentId = 1;
  private currentDocumentId = 1;
  private currentIncidentId = 1;
  private currentNotificationId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "john.smith",
      password: "password123",
      name: "John Smith",
      role: "safety_manager"
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create sample training courses
    const courses: TrainingCourse[] = [
      {
        id: 1,
        title: "Fire Safety & Evacuation",
        description: "Essential fire safety procedures and emergency evacuation protocols",
        duration: 45,
        content: "Comprehensive fire safety training content...",
        isRequired: true,
        createdAt: new Date()
      },
      {
        id: 2,
        title: "Equipment Safety Training",
        description: "Proper use and maintenance of industrial safety equipment",
        duration: 60,
        content: "Equipment safety training content...",
        isRequired: true,
        createdAt: new Date()
      },
      {
        id: 3,
        title: "Chemical Handling Safety",
        description: "Safe handling, storage, and disposal of hazardous chemicals",
        duration: 90,
        content: "Chemical handling safety content...",
        isRequired: false,
        createdAt: new Date()
      }
    ];

    courses.forEach(course => {
      this.courses.set(course.id, course);
    });
    this.currentCourseId = 4;

    // Create sample progress
    const progressEntries: UserCourseProgress[] = [
      {
        id: 1,
        userId: 1,
        courseId: 1,
        progress: 100,
        completedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 2,
        userId: 1,
        courseId: 2,
        progress: 60,
        completedAt: null,
        createdAt: new Date()
      }
    ];

    progressEntries.forEach(p => {
      this.progress.set(`${p.userId}-${p.courseId}`, p);
    });
    this.currentProgressId = 3;

    // Create sample risk assessments
    const assessments: RiskAssessment[] = [
      {
        id: 1,
        title: "Daily Safety Inspection",
        area: "Production Floor A",
        riskLevel: "medium",
        status: "pending",
        assessorId: 1,
        items: [
          { id: "1", text: "Emergency exits are clear and accessible", completed: true, required: true },
          { id: "2", text: "Safety equipment is properly maintained", completed: true, required: true },
          { id: "3", text: "Hazardous materials are properly stored", completed: false, required: true },
          { id: "4", text: "First aid supplies are fully stocked", completed: false, required: true }
        ],
        completedAt: null,
        createdAt: new Date()
      },
      {
        id: 2,
        title: "Equipment Inspection",
        area: "Warehouse B",
        riskLevel: "low",
        status: "completed",
        assessorId: 1,
        items: [
          { id: "1", text: "Equipment maintenance up to date", completed: true, required: true },
          { id: "2", text: "Safety guards in place", completed: true, required: true }
        ],
        completedAt: new Date(),
        createdAt: new Date()
      }
    ];

    assessments.forEach(assessment => {
      this.assessments.set(assessment.id, assessment);
    });
    this.currentAssessmentId = 3;

    // Create sample documents
    const documents: SafetyDocument[] = [
      {
        id: 1,
        title: "Fire Evacuation Plan v2.1",
        category: "Emergency Procedures",
        fileName: "fire-evacuation-plan-v2.1.pdf",
        filePath: "/documents/fire-evacuation-plan-v2.1.pdf",
        uploadedBy: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        title: "PPE Requirements Guide",
        category: "Safety Equipment",
        fileName: "ppe-requirements.pdf",
        filePath: "/documents/ppe-requirements.pdf",
        uploadedBy: 1,
        createdAt: new Date()
      }
    ];

    documents.forEach(doc => {
      this.documents.set(doc.id, doc);
    });
    this.currentDocumentId = 3;

    // Create sample incidents
    const incidents: SafetyIncident[] = [
      {
        id: 1,
        title: "Minor Equipment Malfunction",
        description: "Conveyor belt safety sensor malfunction",
        severity: "low",
        area: "Production Line A",
        reportedBy: 1,
        status: "resolved",
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: 2,
        title: "Chemical Spill",
        description: "Small chemical spill in storage area",
        severity: "medium",
        area: "Chemical Storage",
        reportedBy: 1,
        status: "investigating",
        createdAt: new Date(Date.now() - 172800000) // 2 days ago
      }
    ];

    incidents.forEach(incident => {
      this.incidents.set(incident.id, incident);
    });
    this.currentIncidentId = 3;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Training course methods
  async getAllCourses(): Promise<TrainingCourse[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<TrainingCourse | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertTrainingCourse): Promise<TrainingCourse> {
    const id = this.currentCourseId++;
    const course: TrainingCourse = { ...insertCourse, id, createdAt: new Date() };
    this.courses.set(id, course);
    return course;
  }

  // Progress methods
  async getUserProgress(userId: number): Promise<UserCourseProgress[]> {
    return Array.from(this.progress.values()).filter(p => p.userId === userId);
  }

  async getCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined> {
    return this.progress.get(`${userId}-${courseId}`);
  }

  async updateProgress(userId: number, courseId: number, progressValue: number): Promise<UserCourseProgress> {
    const key = `${userId}-${courseId}`;
    let progress = this.progress.get(key);
    
    if (!progress) {
      progress = {
        id: this.currentProgressId++,
        userId,
        courseId,
        progress: progressValue,
        completedAt: progressValue === 100 ? new Date() : null,
        createdAt: new Date()
      };
    } else {
      progress.progress = progressValue;
      progress.completedAt = progressValue === 100 ? new Date() : null;
    }
    
    this.progress.set(key, progress);
    return progress;
  }

  // Assessment methods
  async getAllAssessments(): Promise<RiskAssessment[]> {
    return Array.from(this.assessments.values());
  }

  async getAssessment(id: number): Promise<RiskAssessment | undefined> {
    return this.assessments.get(id);
  }

  async createAssessment(insertAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const id = this.currentAssessmentId++;
    const assessment: RiskAssessment = { 
      ...insertAssessment, 
      id, 
      createdAt: new Date(),
      completedAt: null 
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async updateAssessment(id: number, updates: Partial<RiskAssessment>): Promise<RiskAssessment> {
    const assessment = this.assessments.get(id);
    if (!assessment) {
      throw new Error(`Assessment with id ${id} not found`);
    }
    
    const updated = { ...assessment, ...updates };
    this.assessments.set(id, updated);
    return updated;
  }

  // Document methods
  async getAllDocuments(): Promise<SafetyDocument[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsByCategory(category: string): Promise<SafetyDocument[]> {
    return Array.from(this.documents.values()).filter(doc => doc.category === category);
  }

  async createDocument(insertDocument: InsertSafetyDocument): Promise<SafetyDocument> {
    const id = this.currentDocumentId++;
    const document: SafetyDocument = { ...insertDocument, id, createdAt: new Date() };
    this.documents.set(id, document);
    return document;
  }

  async searchDocuments(query: string): Promise<SafetyDocument[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.documents.values()).filter(doc => 
      doc.title.toLowerCase().includes(lowercaseQuery) ||
      doc.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Incident methods
  async getAllIncidents(): Promise<SafetyIncident[]> {
    return Array.from(this.incidents.values());
  }

  async getRecentIncidents(limit = 10): Promise<SafetyIncident[]> {
    return Array.from(this.incidents.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createIncident(insertIncident: InsertSafetyIncident): Promise<SafetyIncident> {
    const id = this.currentIncidentId++;
    const incident: SafetyIncident = { ...insertIncident, id, createdAt: new Date() };
    this.incidents.set(id, incident);
    return incident;
  }

  // Notification methods
  async getNotifications(userId?: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => !userId || n.userId === userId || n.userId === null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = { ...insertNotification, id, createdAt: new Date() };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
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
    
    const incidentsThisMonth = Array.from(this.incidents.values())
      .filter(incident => incident.createdAt >= monthStart).length;
    
    const totalProgress = Array.from(this.progress.values());
    const completedCourses = totalProgress.filter(p => p.progress === 100).length;
    const trainingCompletion = totalProgress.length > 0 
      ? Math.round((completedCourses / totalProgress.length) * 100) 
      : 0;
    
    const riskAssessments = this.assessments.size;
    
    // Calculate safety score based on various factors
    const baseScore = 100;
    const incidentPenalty = incidentsThisMonth * 5;
    const trainingBonus = trainingCompletion > 90 ? 5 : 0;
    const safetyScore = Math.max(0, Math.min(100, baseScore - incidentPenalty + trainingBonus));
    
    return {
      safetyScore,
      incidentsThisMonth,
      trainingCompletion,
      riskAssessments
    };
  }
}

export const storage = new MemStorage();
