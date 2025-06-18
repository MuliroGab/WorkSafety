import {
  User, IUser,
  TrainingCourse, ITrainingCourse,
  UserCourseProgress, IUserCourseProgress,
  RiskAssessment, IRiskAssessment,
  SafetyDocument, ISafetyDocument,
  SafetyIncident, ISafetyIncident,
  Notification, INotification,
  CreateTrainingCourseData,
  UpdateProgressData,
  CreateRiskAssessmentData
} from "@shared/models";

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
    return await User.findById(id);
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  // Training Courses
  async getAllCourses(): Promise<ITrainingCourse[]> {
    return await TrainingCourse.find().sort({ createdAt: -1 });
  }

  async getCourse(id: string): Promise<ITrainingCourse | null> {
    return await TrainingCourse.findById(id);
  }

  async createCourse(courseData: CreateTrainingCourseData): Promise<ITrainingCourse> {
    const course = new TrainingCourse(courseData);
    return await course.save();
  }

  // User Course Progress
  async getUserProgress(userId: string): Promise<IUserCourseProgress[]> {
    return await UserCourseProgress.find({ userId }).populate('courseId');
  }

  async getCourseProgress(userId: string, courseId: string): Promise<IUserCourseProgress | null> {
    return await UserCourseProgress.findOne({ userId, courseId });
  }

  async updateProgress(userId: string, courseId: string, progress: number): Promise<IUserCourseProgress> {
    const existingProgress = await UserCourseProgress.findOne({ userId, courseId });
    
    if (existingProgress) {
      existingProgress.progress = progress;
      if (progress >= 100) {
        existingProgress.completedAt = new Date();
      }
      return await existingProgress.save();
    } else {
      const newProgress = new UserCourseProgress({
        userId,
        courseId,
        progress,
        completedAt: progress >= 100 ? new Date() : undefined
      });
      return await newProgress.save();
    }
  }

  // Risk Assessments
  async getAllAssessments(): Promise<IRiskAssessment[]> {
    return await RiskAssessment.find().populate('assessorId', 'name username').sort({ createdAt: -1 });
  }

  async getAssessment(id: string): Promise<IRiskAssessment | null> {
    return await RiskAssessment.findById(id).populate('assessorId', 'name username');
  }

  async createAssessment(assessmentData: CreateRiskAssessmentData & { assessorId: string }): Promise<IRiskAssessment> {
    const assessment = new RiskAssessment(assessmentData);
    return await assessment.save();
  }

  async updateAssessment(id: string, updates: Partial<IRiskAssessment>): Promise<IRiskAssessment> {
    const assessment = await RiskAssessment.findByIdAndUpdate(id, updates, { new: true });
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    return assessment;
  }

  // Safety Documents
  async getAllDocuments(): Promise<ISafetyDocument[]> {
    return await SafetyDocument.find().populate('uploadedBy', 'name username').sort({ createdAt: -1 });
  }

  async getDocumentsByCategory(category: string): Promise<ISafetyDocument[]> {
    return await SafetyDocument.find({ category }).populate('uploadedBy', 'name username').sort({ createdAt: -1 });
  }

  async createDocument(documentData: Partial<ISafetyDocument>): Promise<ISafetyDocument> {
    const document = new SafetyDocument(documentData);
    return await document.save();
  }

  async searchDocuments(query: string): Promise<ISafetyDocument[]> {
    return await SafetyDocument.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }).populate('uploadedBy', 'name username').sort({ createdAt: -1 });
  }

  // Safety Incidents
  async getAllIncidents(): Promise<ISafetyIncident[]> {
    return await SafetyIncident.find().populate('reportedBy', 'name username').sort({ createdAt: -1 });
  }

  async getRecentIncidents(limit = 10): Promise<ISafetyIncident[]> {
    return await SafetyIncident.find().populate('reportedBy', 'name username').sort({ createdAt: -1 }).limit(limit);
  }

  async createIncident(incidentData: Partial<ISafetyIncident>): Promise<ISafetyIncident> {
    const incident = new SafetyIncident(incidentData);
    return await incident.save();
  }

  // Notifications
  async getNotifications(userId?: string): Promise<INotification[]> {
    const query = userId ? { $or: [{ userId }, { userId: null }] } : {};
    return await Notification.find(query).sort({ createdAt: -1 });
  }

  async createNotification(notificationData: Partial<INotification>): Promise<INotification> {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  async markNotificationRead(id: string): Promise<void> {
    await Notification.findByIdAndUpdate(id, { isRead: true });
  }

  // Analytics
  async getSafetyMetrics(): Promise<{
    safetyScore: number;
    incidentsThisMonth: number;
    trainingCompletion: number;
    riskAssessments: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalIncidents,
      incidentsThisMonth,
      totalAssessments,
      completedAssessments,
      totalProgress,
      avgProgress
    ] = await Promise.all([
      SafetyIncident.countDocuments(),
      SafetyIncident.countDocuments({ createdAt: { $gte: startOfMonth } }),
      RiskAssessment.countDocuments(),
      RiskAssessment.countDocuments({ status: 'completed' }),
      UserCourseProgress.countDocuments(),
      UserCourseProgress.aggregate([
        { $group: { _id: null, avgProgress: { $avg: '$progress' } } }
      ])
    ]);

    const completionRate = totalProgress > 0 ? (avgProgress[0]?.avgProgress || 0) : 0;
    const assessmentCompletionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 100;
    
    // Calculate safety score based on various factors
    const incidentPenalty = Math.min(incidentsThisMonth * 5, 30);
    const safetyScore = Math.max(0, 100 - incidentPenalty + (assessmentCompletionRate * 0.2) + (completionRate * 0.1));

    return {
      safetyScore: Math.round(safetyScore),
      incidentsThisMonth,
      trainingCompletion: Math.round(completionRate),
      riskAssessments: totalAssessments
    };
  }
}

export const storage = new MongoStorage();