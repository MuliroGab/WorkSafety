import {
  User,
  TrainingCourse,
  UserCourseProgress,
  RiskAssessment,
  SafetyDocument,
  SafetyIncident,
  Notification,
  type IUser,
  type ITrainingCourse,
  type IUserCourseProgress,
  type IRiskAssessment,
  type ISafetyDocument,
  type ISafetyIncident,
  type INotification,
  type CreateTrainingCourseData,
  type CreateRiskAssessmentData,
} from '@shared/models';
import { nanoid } from 'nanoid';

export interface IMongoStorage {
  // Users (for authentication)
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;

  // Training Courses
  getAllCourses(): Promise<ITrainingCourse[]>;
  getCourse(id: string): Promise<ITrainingCourse | null>;
  createCourse(courseData: CreateTrainingCourseData): Promise<ITrainingCourse>;

  // User Course Progress
  getUserProgress(userId: string): Promise<IUserCourseProgress[]>;
  getCourseProgress(userId: string, courseId: string): Promise<IUserCourseProgress | null>;
  updateProgress(userId: string, courseId: string, progress: number): Promise<IUserCourseProgress>;

  // Risk Assessments
  getAllAssessments(): Promise<IRiskAssessment[]>;
  getAssessment(id: string): Promise<IRiskAssessment | null>;
  createAssessment(assessmentData: CreateRiskAssessmentData & { assessorId: string }): Promise<IRiskAssessment>;
  updateAssessment(id: string, updates: Partial<IRiskAssessment>): Promise<IRiskAssessment>;

  // Safety Documents
  getAllDocuments(): Promise<ISafetyDocument[]>;
  getDocumentsByCategory(category: string): Promise<ISafetyDocument[]>;
  createDocument(documentData: Partial<ISafetyDocument>): Promise<ISafetyDocument>;
  searchDocuments(query: string): Promise<ISafetyDocument[]>;

  // Safety Incidents
  getAllIncidents(): Promise<ISafetyIncident[]>;
  getRecentIncidents(limit?: number): Promise<ISafetyIncident[]>;
  createIncident(incidentData: Partial<ISafetyIncident>): Promise<ISafetyIncident>;

  // Notifications
  getNotifications(userId?: string): Promise<INotification[]>;
  createNotification(notificationData: Partial<INotification>): Promise<INotification>;
  markNotificationRead(id: string): Promise<void>;

  // Analytics
  getSafetyMetrics(): Promise<{
    safetyScore: number;
    incidentsThisMonth: number;
    trainingCompletion: number;
    riskAssessments: number;
  }>;
}

export class MongoStorage implements IMongoStorage {
  // Users
  async getUser(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username });
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Training Courses
  async getAllCourses(): Promise<ITrainingCourse[]> {
    try {
      return await TrainingCourse.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all courses:', error);
      return [];
    }
  }

  async getCourse(id: string): Promise<ITrainingCourse | null> {
    try {
      return await TrainingCourse.findById(id);
    } catch (error) {
      console.error('Error getting course:', error);
      return null;
    }
  }

  async createCourse(courseData: CreateTrainingCourseData): Promise<ITrainingCourse> {
    try {
      const course = new TrainingCourse(courseData);
      return await course.save();
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // User Course Progress
  async getUserProgress(userId: string): Promise<IUserCourseProgress[]> {
    try {
      return await UserCourseProgress.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting user progress:', error);
      return [];
    }
  }

  async getCourseProgress(userId: string, courseId: string): Promise<IUserCourseProgress | null> {
    try {
      return await UserCourseProgress.findOne({ userId, courseId });
    } catch (error) {
      console.error('Error getting course progress:', error);
      return null;
    }
  }

  async updateProgress(userId: string, courseId: string, progress: number): Promise<IUserCourseProgress> {
    try {
      const update = {
        progress,
        ...(progress >= 100 && { completedAt: new Date() })
      };

      const result = await UserCourseProgress.findOneAndUpdate(
        { userId, courseId },
        update,
        { upsert: true, new: true }
      );

      return result!;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  // Risk Assessments
  async getAllAssessments(): Promise<IRiskAssessment[]> {
    try {
      return await RiskAssessment.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all assessments:', error);
      return [];
    }
  }

  async getAssessment(id: string): Promise<IRiskAssessment | null> {
    try {
      return await RiskAssessment.findById(id);
    } catch (error) {
      console.error('Error getting assessment:', error);
      return null;
    }
  }

  async createAssessment(assessmentData: CreateRiskAssessmentData & { assessorId: string }): Promise<IRiskAssessment> {
    try {
      // Generate IDs for items that don't have them
      const itemsWithIds = assessmentData.items.map(item => ({
        ...item,
        id: item.id || nanoid()
      }));

      const assessment = new RiskAssessment({
        ...assessmentData,
        items: itemsWithIds
      });
      
      return await assessment.save();
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  }

  async updateAssessment(id: string, updates: Partial<IRiskAssessment>): Promise<IRiskAssessment> {
    try {
      // Check if all required items are completed
      if (updates.items) {
        const allRequiredCompleted = updates.items
          .filter(item => item.required)
          .every(item => item.completed);

        if (allRequiredCompleted && updates.status !== 'completed') {
          updates.status = 'completed';
          updates.completedAt = new Date();
        }
      }

      const result = await RiskAssessment.findByIdAndUpdate(id, updates, { new: true });
      if (!result) {
        throw new Error('Assessment not found');
      }
      return result;
    } catch (error) {
      console.error('Error updating assessment:', error);
      throw error;
    }
  }

  // Safety Documents
  async getAllDocuments(): Promise<ISafetyDocument[]> {
    try {
      return await SafetyDocument.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all documents:', error);
      return [];
    }
  }

  async getDocumentsByCategory(category: string): Promise<ISafetyDocument[]> {
    try {
      return await SafetyDocument.find({ category }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting documents by category:', error);
      return [];
    }
  }

  async createDocument(documentData: Partial<ISafetyDocument>): Promise<ISafetyDocument> {
    try {
      const document = new SafetyDocument(documentData);
      return await document.save();
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async searchDocuments(query: string): Promise<ISafetyDocument[]> {
    try {
      const searchRegex = new RegExp(query, 'i');
      return await SafetyDocument.find({
        $or: [
          { title: searchRegex },
          { category: searchRegex },
          { tags: { $in: [searchRegex] } }
        ]
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  // Safety Incidents
  async getAllIncidents(): Promise<ISafetyIncident[]> {
    try {
      return await SafetyIncident.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all incidents:', error);
      return [];
    }
  }

  async getRecentIncidents(limit = 10): Promise<ISafetyIncident[]> {
    try {
      return await SafetyIncident.find()
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error getting recent incidents:', error);
      return [];
    }
  }

  async createIncident(incidentData: Partial<ISafetyIncident>): Promise<ISafetyIncident> {
    try {
      const incident = new SafetyIncident(incidentData);
      return await incident.save();
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  }

  // Notifications
  async getNotifications(userId?: string): Promise<INotification[]> {
    try {
      const filter = userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {};
      return await Notification.find(filter).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async createNotification(notificationData: Partial<INotification>): Promise<INotification> {
    try {
      const notification = new Notification(notificationData);
      return await notification.save();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markNotificationRead(id: string): Promise<void> {
    try {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Analytics
  async getSafetyMetrics(): Promise<{
    safetyScore: number;
    incidentsThisMonth: number;
    trainingCompletion: number;
    riskAssessments: number;
  }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get incidents this month
      const incidentsThisMonth = await SafetyIncident.countDocuments({
        createdAt: { $gte: startOfMonth }
      });

      // Get total users and completed training
      const totalUsers = await User.countDocuments();
      const totalCourses = await TrainingCourse.countDocuments({ isRequired: true });
      
      let trainingCompletion = 0;
      if (totalUsers > 0 && totalCourses > 0) {
        const completedProgress = await UserCourseProgress.countDocuments({
          progress: { $gte: 100 }
        });
        trainingCompletion = Math.round((completedProgress / (totalUsers * totalCourses)) * 100);
      }

      // Get total risk assessments
      const riskAssessments = await RiskAssessment.countDocuments({
        status: 'completed'
      });

      // Calculate safety score (simplified algorithm)
      let safetyScore = 100;
      safetyScore -= incidentsThisMonth * 5; // Deduct 5 points per incident
      safetyScore = Math.max(safetyScore + (trainingCompletion - 80), 0); // Add bonus for high training completion
      safetyScore = Math.min(Math.max(safetyScore, 0), 100); // Keep between 0-100

      return {
        safetyScore,
        incidentsThisMonth,
        trainingCompletion,
        riskAssessments,
      };
    } catch (error) {
      console.error('Error getting safety metrics:', error);
      return {
        safetyScore: 0,
        incidentsThisMonth: 0,
        trainingCompletion: 0,
        riskAssessments: 0,
      };
    }
  }
}

export const storage = new MongoStorage();