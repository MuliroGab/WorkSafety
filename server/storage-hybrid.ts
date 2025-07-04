import { storage as mongoStorage } from './storage-mongo';
import { mongodb } from './mongodb';
import type { IMongoStorage } from './storage-mongo';

// In-memory storage that implements the same interface as MongoDB storage
class MemoryStorage implements IMongoStorage {
  private users: Map<string, any> = new Map();
  private courses: Map<string, any> = new Map();
  private progress: Map<string, any> = new Map();
  private assessments: Map<string, any> = new Map();
  private documents: Map<string, any> = new Map();
  private incidents: Map<string, any> = new Map();
  private notifications: Map<string, any> = new Map();

  // Helper to generate IDs
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Users
  async getUser(id: string) {
    return this.users.get(id) || null;
  }

  async getUserByUsername(username: string) {
    for (const [_, user] of this.users) {
      if (user.username === username) return user;
    }
    return null;
  }

  async createUser(userData: any) {
    const id = this.generateId();
    const user = {
      _id: id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Training Courses
  async getAllCourses() {
    const coursesArray: any[] = [];
    for (const [_, course] of this.courses) {
      coursesArray.push(course);
    }
    return coursesArray.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getCourse(id: string) {
    return this.courses.get(id) || null;
  }

  async createCourse(courseData: any) {
    const id = this.generateId();
    const course = {
      _id: id,
      ...courseData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.courses.set(id, course);
    return course;
  }

  // User Course Progress
  async getUserProgress(userId: string) {
    return Array.from(this.progress.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCourseProgress(userId: string, courseId: string) {
    for (const progress of this.progress.values()) {
      if (progress.userId === userId && progress.courseId === courseId) {
        return progress;
      }
    }
    return null;
  }

  async updateProgress(userId: string, courseId: string, progressValue: number) {
    const existing = await this.getCourseProgress(userId, courseId);
    if (existing) {
      existing.progress = progressValue;
      existing.updatedAt = new Date();
      if (progressValue >= 100) {
        existing.completedAt = new Date();
      }
      return existing;
    }

    const id = this.generateId();
    const progress = {
      _id: id,
      userId,
      courseId,
      progress: progressValue,
      completedAt: progressValue >= 100 ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.progress.set(id, progress);
    return progress;
  }

  // Risk Assessments
  async getAllAssessments() {
    return Array.from(this.assessments.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAssessment(id: string) {
    return this.assessments.get(id) || null;
  }

  async createAssessment(assessmentData: any) {
    const id = this.generateId();
    const assessment = {
      _id: id,
      ...assessmentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async updateAssessment(id: string, updates: any) {
    const assessment = this.assessments.get(id);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Check if all required items are completed
    if (updates.items) {
      const allRequiredCompleted = updates.items
        .filter((item: any) => item.required)
        .every((item: any) => item.completed);

      if (allRequiredCompleted && updates.status !== 'completed') {
        updates.status = 'completed';
        updates.completedAt = new Date();
      }
    }

    Object.assign(assessment, updates, { updatedAt: new Date() });
    return assessment;
  }

  // Safety Documents
  async getAllDocuments() {
    return Array.from(this.documents.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getDocumentsByCategory(category: string) {
    return Array.from(this.documents.values())
      .filter(doc => doc.category === category)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createDocument(documentData: any) {
    const id = this.generateId();
    const document = {
      _id: id,
      ...documentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async searchDocuments(query: string) {
    return Array.from(this.documents.values())
      .filter(doc => 
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.category.toLowerCase().includes(query.toLowerCase()) ||
        (doc.tags && doc.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase())))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Safety Incidents
  async getAllIncidents() {
    return Array.from(this.incidents.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRecentIncidents(limit = 10) {
    return Array.from(this.incidents.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createIncident(incidentData: any) {
    const id = this.generateId();
    const incident = {
      _id: id,
      ...incidentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.incidents.set(id, incident);
    return incident;
  }

  // Notifications
  async getNotifications(userId?: string) {
    return Array.from(this.notifications.values())
      .filter(notif => !userId || !notif.userId || notif.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notificationData: any) {
    const id = this.generateId();
    const notification = {
      _id: id,
      ...notificationData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      notification.updatedAt = new Date();
    }
  }

  // Analytics
  async getSafetyMetrics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get incidents this month
    const incidentsThisMonth = Array.from(this.incidents.values())
      .filter(incident => new Date(incident.createdAt) >= startOfMonth).length;

    // Get total users and completed training
    const totalUsers = this.users.size;
    const totalCourses = Array.from(this.courses.values()).filter(course => course.isRequired).length;
    
    let trainingCompletion = 0;
    if (totalUsers > 0 && totalCourses > 0) {
      const completedProgress = Array.from(this.progress.values())
        .filter(progress => progress.progress >= 100).length;
      trainingCompletion = Math.round((completedProgress / (totalUsers * totalCourses)) * 100);
    }

    // Get total risk assessments
    const riskAssessments = Array.from(this.assessments.values())
      .filter(assessment => assessment.status === 'completed').length;

    // Calculate safety score
    let safetyScore = 100;
    safetyScore -= incidentsThisMonth * 5;
    safetyScore = Math.max(safetyScore + (trainingCompletion - 80), 0);
    safetyScore = Math.min(Math.max(safetyScore, 0), 100);

    return {
      safetyScore,
      incidentsThisMonth,
      trainingCompletion,
      riskAssessments,
    };
  }
}

// Create hybrid storage that uses MongoDB when available, memory storage as fallback
class HybridStorage implements IMongoStorage {
  private memoryStorage = new MemoryStorage();
  
  private get activeStorage(): IMongoStorage {
    return mongodb.isConnectedToDatabase() ? mongoStorage : this.memoryStorage;
  }

  async getUser(id: string) {
    return this.activeStorage.getUser(id);
  }

  async getUserByUsername(username: string) {
    return this.activeStorage.getUserByUsername(username);
  }

  async createUser(userData: any) {
    return this.activeStorage.createUser(userData);
  }

  async getAllCourses() {
    return this.activeStorage.getAllCourses();
  }

  async getCourse(id: string) {
    return this.activeStorage.getCourse(id);
  }

  async createCourse(courseData: any) {
    return this.activeStorage.createCourse(courseData);
  }

  async getUserProgress(userId: string) {
    return this.activeStorage.getUserProgress(userId);
  }

  async getCourseProgress(userId: string, courseId: string) {
    return this.activeStorage.getCourseProgress(userId, courseId);
  }

  async updateProgress(userId: string, courseId: string, progress: number) {
    return this.activeStorage.updateProgress(userId, courseId, progress);
  }

  async getAllAssessments() {
    return this.activeStorage.getAllAssessments();
  }

  async getAssessment(id: string) {
    return this.activeStorage.getAssessment(id);
  }

  async createAssessment(assessmentData: any) {
    return this.activeStorage.createAssessment(assessmentData);
  }

  async updateAssessment(id: string, updates: any) {
    return this.activeStorage.updateAssessment(id, updates);
  }

  async getAllDocuments() {
    return this.activeStorage.getAllDocuments();
  }

  async getDocumentsByCategory(category: string) {
    return this.activeStorage.getDocumentsByCategory(category);
  }

  async createDocument(documentData: any) {
    return this.activeStorage.createDocument(documentData);
  }

  async searchDocuments(query: string) {
    return this.activeStorage.searchDocuments(query);
  }

  async getAllIncidents() {
    return this.activeStorage.getAllIncidents();
  }

  async getRecentIncidents(limit?: number) {
    return this.activeStorage.getRecentIncidents(limit);
  }

  async createIncident(incidentData: any) {
    return this.activeStorage.createIncident(incidentData);
  }

  async getNotifications(userId?: string) {
    return this.activeStorage.getNotifications(userId);
  }

  async createNotification(notificationData: any) {
    return this.activeStorage.createNotification(notificationData);
  }

  async markNotificationRead(id: string) {
    return this.activeStorage.markNotificationRead(id);
  }

  async getSafetyMetrics() {
    return this.activeStorage.getSafetyMetrics();
  }
}

export const storage = new HybridStorage();