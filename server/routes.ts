import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-hybrid";
import { getSession, isAuthenticated, hashPassword, verifyPassword } from "./auth";
import { 
  createTrainingCourseSchema,
  createRiskAssessmentSchema,
  createSafetyIncidentSchema,
  createNotificationSchema,
  updateProgressSchema,
  emergencyAlertSchema,
  loginSchema,
  registerSchema
} from "@shared/models";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { nanoid } from "nanoid";

// Extend session type
declare module 'express-session' {
  interface SessionData {
    user: {
      id: string;
      username: string;
      name: string;
      role: string;
    };
  }
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document and image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || !await verifyPassword(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      };

      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: error instanceof z.ZodError ? error.errors : "Login failed" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, name, password } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({
        id: nanoid(),
        username,
        email,
        name,
        password: hashedPassword,
        role: "employee"
      });

      req.session.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      };

      res.status(201).json({ 
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error instanceof z.ZodError ? error.errors : "Registration failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/me', isAuthenticated, async (req, res) => {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "No session found" });
      }
      
      const user = await storage.getUser(sessionUser.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Dashboard and Analytics
  app.get("/api/metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getSafetyMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get("/api/recent-activity", isAuthenticated, async (req, res) => {
    try {
      const incidents = await storage.getRecentIncidents(5);
      const notifications = await storage.getNotifications();
      
      const activities = [
        ...incidents.map(incident => ({
          id: `incident-${incident.id}`,
          type: 'incident',
          title: incident.title,
          description: `${incident.severity} severity in ${incident.area}`,
          timestamp: incident.createdAt,
          icon: 'exclamation'
        })),
        ...notifications.slice(0, 3).map(notification => ({
          id: `notification-${notification.id}`,
          type: 'notification',
          title: notification.title,
          description: notification.message,
          timestamp: notification.createdAt,
          icon: 'bell'
        }))
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Training Courses
  app.get("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const courseData = createTrainingCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      res.status(400).json({ message: "Invalid course data" });
    }
  });

  // User Progress
  app.get("/api/users/:userId/progress", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.put("/api/users/:userId/progress", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const { courseId, progress } = updateProgressSchema.parse(req.body);
      const updatedProgress = await storage.updateProgress(userId, courseId, progress);
      res.json(updatedProgress);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  // Risk Assessments
  app.get("/api/assessments", isAuthenticated, async (req, res) => {
    try {
      const assessments = await storage.getAllAssessments();
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  app.post("/api/assessments", async (req, res) => {
    try {
      const assessmentData = createRiskAssessmentSchema.parse(req.body);
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const assessment = await storage.createAssessment({
        ...assessmentData,
        assessorId: user.id
      });
      res.status(201).json(assessment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assessment data" });
    }
  });

  app.put("/api/assessments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const assessment = await storage.updateAssessment(id, updates);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update assessment" });
    }
  });

  // Safety Documents
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let documents;
      if (search) {
        documents = await storage.searchDocuments(search as string);
      } else if (category) {
        documents = await storage.getDocumentsByCategory(category as string);
      } else {
        documents = await storage.getAllDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { title, category } = req.body;
      if (!title || !category) {
        return res.status(400).json({ message: "Title and category are required" });
      }

      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const documentData = {
        title,
        category,
        filePath: req.file.path,
        uploadedBy: user.id,
        tags: []
      };

      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "Failed to upload document" });
    }
  });

  // Safety Incidents
  app.get("/api/incidents", async (req, res) => {
    try {
      const incidents = await storage.getAllIncidents();
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.post("/api/incidents", async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const incidentData = createSafetyIncidentSchema.parse({
        ...req.body,
        reportedBy: user.id
      });
      const incident = await storage.createIncident(incidentData);
      res.status(201).json(incident);
    } catch (error) {
      res.status(400).json({ message: "Invalid incident data" });
    }
  });

  // Notifications
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.query;
      const notifications = await storage.getNotifications(
        userId ? userId as string : undefined
      );
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notificationData = createNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification data" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = req.params.id;
      await storage.markNotificationRead(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Emergency Alert
  app.post("/api/emergency", isAuthenticated, async (req, res) => {
    try {
      const { message, area } = emergencyAlertSchema.parse(req.body);
      
      // Create emergency notification
      const notification = await storage.createNotification({
        title: "Emergency Alert",
        message: area ? `${message} (Area: ${area})` : message,
        type: "error", // Use error instead of critical for notifications
        userId: undefined, // Global notification
        isRead: false
      });

      // Create incident record
      const user = req.session?.user;
      const incident = await storage.createIncident({
        title: "Emergency Alert Triggered",
        description: message,
        severity: "critical",
        area: area || "Unknown",
        reportedBy: user?.id || "system", // Use authenticated user or system
        status: "open"
      });

      res.status(201).json({ notification, incident });
    } catch (error) {
      res.status(400).json({ message: "Failed to send emergency alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
