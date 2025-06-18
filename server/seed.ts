import { storage } from "./storage";
import { hashPassword } from "./auth";
import { nanoid } from "nanoid";

export async function seedDatabase() {
  try {
    // Create default admin user
    const hashedPassword = await hashPassword("admin123");
    
    await storage.createUser({
      id: nanoid(),
      username: "admin",
      email: "admin@safetyfirst.com",
      name: "System Administrator",
      password: hashedPassword,
      role: "admin"
    });

    // Create sample training courses
    const course1 = await storage.createCourse({
      title: "Fire Safety & Evacuation",
      description: "Essential fire safety procedures and emergency evacuation protocols",
      duration: 45,
      content: "Comprehensive fire safety training covering detection systems, evacuation procedures, and emergency response protocols.",
      isRequired: true
    });

    const course2 = await storage.createCourse({
      title: "Equipment Safety Training",
      description: "Proper use and maintenance of industrial safety equipment",
      duration: 60,
      content: "Training on personal protective equipment, machinery safety, and proper handling procedures.",
      isRequired: true
    });

    const course3 = await storage.createCourse({
      title: "Chemical Handling Safety",
      description: "Safe handling, storage, and disposal of hazardous chemicals",
      duration: 90,
      content: "Comprehensive chemical safety including MSDS sheets, storage requirements, and emergency procedures.",
      isRequired: false
    });

    // Create sample risk assessments
    await storage.createAssessment({
      title: "Warehouse Safety Inspection",
      area: "Main Warehouse",
      riskLevel: "medium",
      assessorId: 1,
      status: "pending",
      items: [
        { id: "1", text: "Check emergency exits are clear", completed: false, required: true },
        { id: "2", text: "Verify fire extinguisher locations", completed: false, required: true },
        { id: "3", text: "Inspect lifting equipment", completed: false, required: true }
      ]
    });

    await storage.createAssessment({
      title: "Office Environmental Check",
      area: "Administrative Offices",
      riskLevel: "low",
      assessorId: 1,
      status: "completed",
      items: [
        { id: "1", text: "Check air quality systems", completed: true, required: true },
        { id: "2", text: "Verify emergency lighting", completed: true, required: true },
        { id: "3", text: "Test smoke detectors", completed: true, required: true }
      ]
    });

    // Create sample notifications
    await storage.createNotification({
      title: "Monthly Safety Training Due",
      message: "Please complete your monthly safety training modules by the end of the week.",
      type: "training",
      userId: null, // Global notification
      isRead: false
    });

    await storage.createNotification({
      title: "Safety Equipment Inspection",
      message: "Quarterly safety equipment inspection scheduled for next Monday.",
      type: "maintenance",
      userId: null,
      isRead: false
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}