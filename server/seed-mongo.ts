import { storage } from './storage-mongo';
import { hashPassword } from './auth';
import { nanoid } from 'nanoid';

export async function seedDatabase() {
  try {
    console.log('Seeding MongoDB database...');

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = await storage.createUser({
      username: 'admin',
      name: 'System Administrator',
      email: 'admin@safety-first.com',
      password: adminPassword,
      role: 'admin',
    });

    // Create employee user
    const employeePassword = await hashPassword('employee123');
    const employee = await storage.createUser({
      username: 'john.doe',
      name: 'John Doe',
      email: 'john.doe@safety-first.com',
      password: employeePassword,
      role: 'employee',
    });

    // Create training courses
    const course1 = await storage.createCourse({
      title: 'Workplace Safety Fundamentals',
      description: 'Essential safety principles and practices for all employees',
      duration: 45,
      content: 'This comprehensive course covers the fundamental principles of workplace safety, including hazard identification, personal protective equipment usage, emergency procedures, and reporting protocols.',
      isRequired: true,
    });

    const course2 = await storage.createCourse({
      title: 'Fire Safety and Emergency Response',
      description: 'Fire prevention, evacuation procedures, and emergency response protocols',
      duration: 30,
      content: 'Learn about fire prevention techniques, proper use of fire extinguishers, evacuation routes, assembly points, and coordination with emergency services.',
      isRequired: true,
    });

    const course3 = await storage.createCourse({
      title: 'Chemical Handling and Storage',
      description: 'Safe handling, storage, and disposal of hazardous chemicals',
      duration: 60,
      content: 'Detailed training on chemical safety data sheets, proper storage procedures, personal protective equipment for chemical handling, spill response, and disposal protocols.',
      isRequired: false,
    });

    // Create user progress
    await storage.updateProgress(employee._id, course1._id, 85);
    await storage.updateProgress(employee._id, course2._id, 100);

    // Create risk assessments
    const assessment1 = await storage.createAssessment({
      title: 'Workshop Safety Inspection',
      area: 'Main Workshop',
      riskLevel: 'medium',
      assessorId: admin._id,
      items: [
        {
          id: nanoid(),
          text: 'Check all power tools for proper functioning and safety guards',
          completed: true,
          required: true,
        },
        {
          id: nanoid(),
          text: 'Verify emergency stop buttons are accessible and functional',
          completed: true,
          required: true,
        },
        {
          id: nanoid(),
          text: 'Inspect first aid kit and ensure supplies are stocked',
          completed: false,
          required: true,
        },
        {
          id: nanoid(),
          text: 'Check ventilation systems are operating properly',
          completed: false,
          required: true,
        },
        {
          id: nanoid(),
          text: 'Verify safety signage is visible and up to date',
          completed: true,
          required: false,
        },
      ],
    });

    const assessment2 = await storage.createAssessment({
      title: 'Office Safety Check',
      area: 'Administration Building',
      riskLevel: 'low',
      assessorId: admin._id,
      items: [
        {
          id: nanoid(),
          text: 'Check ergonomic setup of workstations',
          completed: true,
          required: true,
        },
        {
          id: nanoid(),
          text: 'Verify fire exits are clear and marked',
          completed: true,
          required: true,
        },
        {
          id: nanoid(),
          text: 'Test emergency lighting systems',
          completed: true,
          required: true,
        },
      ],
    });

    // Create safety documents
    await storage.createDocument({
      title: 'Emergency Evacuation Plan',
      category: 'Emergency Procedures',
      filePath: '/uploads/emergency-evacuation-plan.pdf',
      uploadedBy: admin._id,
      tags: ['evacuation', 'emergency', 'safety'],
    });

    await storage.createDocument({
      title: 'Personal Protective Equipment Guidelines',
      category: 'Safety Equipment',
      filePath: '/uploads/ppe-guidelines.pdf',
      uploadedBy: admin._id,
      tags: ['ppe', 'protective equipment', 'guidelines'],
    });

    await storage.createDocument({
      title: 'OSHA Compliance Checklist',
      category: 'Compliance',
      filePath: '/uploads/osha-compliance-checklist.pdf',
      uploadedBy: admin._id,
      tags: ['osha', 'compliance', 'regulations'],
    });

    await storage.createDocument({
      title: 'Chemical Safety Data Sheets',
      category: 'Safety Equipment',
      filePath: '/uploads/chemical-safety-sheets.pdf',
      uploadedBy: admin._id,
      tags: ['chemicals', 'safety', 'msds'],
    });

    // Create safety incidents
    await storage.createIncident({
      title: 'Minor Chemical Spill in Lab B',
      description: 'Small acetone spill occurred during routine cleaning. Area was immediately cordoned off and cleaning protocols followed.',
      severity: 'low',
      area: 'Laboratory B',
      reportedBy: employee._id,
      status: 'resolved',
    });

    await storage.createIncident({
      title: 'Equipment Malfunction in Workshop',
      description: 'Conveyor belt system experienced unexpected shutdown. Investigation revealed worn belt requiring replacement.',
      severity: 'medium',
      area: 'Main Workshop',
      reportedBy: employee._id,
      status: 'investigating',
    });

    // Create sample notifications
    await storage.createNotification({
      title: 'Monthly Safety Training Due',
      message: 'Please complete your monthly safety training modules by the end of the week.',
      type: 'training',
      userId: undefined, // Global notification
      isRead: false
    });

    await storage.createNotification({
      title: 'Safety Equipment Inspection',
      message: 'Quarterly safety equipment inspection scheduled for next Monday.',
      type: 'maintenance',
      userId: undefined,
      isRead: false
    });

    console.log('MongoDB database seeded successfully!');
  } catch (error) {
    console.error('Error seeding MongoDB database:', error);
  }
}