# Safety First - Workplace Safety Management System

## Overview

This is a comprehensive workplace safety management system built with a modern full-stack architecture. The application provides tools for safety training, risk assessments, document management, incident reporting, and emergency response. It features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database with Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom safety-themed color palette
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with development optimizations

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM (with memory fallback)
- **ODM**: Mongoose for MongoDB document operations
- **Authentication**: Session-based auth with bcrypt password hashing
- **Session Storage**: MongoDB-backed sessions with memory fallback using connect-mongo
- **File Uploads**: Multer middleware for document uploads
- **API**: RESTful API with comprehensive error handling

### Database Schema (MongoDB Collections)
- **Users**: Authentication and user management with string ObjectIds
- **Training Courses**: Course content and metadata with string ObjectIds
- **User Course Progress**: Training completion tracking with string ObjectIds
- **Risk Assessments**: Safety inspection checklists with string ObjectIds
- **Safety Documents**: Document storage and categorization with string ObjectIds
- **Safety Incidents**: Incident reporting and tracking with string ObjectIds
- **Notifications**: Real-time alerts and messaging with string ObjectIds
- **Sessions**: Secure session management via connect-mongo or memory fallback

## Key Components

### Authentication System
- Session-based authentication with secure cookie handling
- Password hashing using bcrypt
- Role-based access control (admin/employee)
- Protected routes and middleware

### Training Management
- Interactive training courses with progress tracking
- Required vs optional course classification
- Real-time progress updates
- Course completion certificates

### Risk Assessment Tools
- Interactive checklists for safety inspections
- Risk level categorization (low/medium/high)
- Status tracking (pending/in_progress/completed)
- Progress visualization

### Document Management
- File upload with type validation (PDF, DOC, images)
- Document categorization (Emergency Procedures, Safety Equipment, Compliance)
- Search and filter functionality
- Secure file storage

### Emergency Response
- Emergency alert system with real-time notifications
- Incident reporting and tracking
- Critical notification handling
- Emergency contact integration

### Dashboard & Analytics
- Real-time safety metrics
- Activity tracking and reporting
- Notification management
- Progress visualization

## Data Flow

1. **Authentication Flow**: User login → Session creation → Protected route access
2. **Training Flow**: Course selection → Progress tracking → Completion recording
3. **Assessment Flow**: Checklist loading → Item completion → Progress updates
4. **Document Flow**: File upload → Validation → Storage → Retrieval
5. **Emergency Flow**: Alert trigger → Notification broadcast → Response tracking

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **multer**: File upload handling
- **nanoid**: Unique ID generation

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tailwindcss**: Utility-first CSS
- **@replit/vite-plugin-***: Replit integration

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- TypeScript compilation with strict mode
- Automatic database migrations with Drizzle Kit
- Real-time error overlay for debugging

### Production Build
- Vite production build with optimization
- ESBuild for server-side bundling
- Static asset serving with Express
- Environment-based configuration

### Database Management
- Drizzle migrations for schema changes
- Database seeding for initial data
- Connection pooling with Neon
- Session table auto-creation

### Security Considerations
- HTTPS enforcement in production
- Secure session cookies
- File upload validation
- SQL injection prevention via ORM
- XSS protection through React

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 04, 2025. Initial setup with PostgreSQL and Drizzle ORM
- July 04, 2025. Migrated from PostgreSQL to MongoDB with Mongoose ODM
  - Removed PostgreSQL dependencies (drizzle-orm, connect-pg-simple, @neondatabase/serverless)
  - Added MongoDB dependencies (mongoose, connect-mongo)
  - Implemented hybrid storage system with memory fallback
  - Updated all schemas to use string-based ObjectIds instead of integer IDs
  - Modified authentication system to use MongoDB sessions with memory fallback
  - Updated frontend imports to use MongoDB models
  - Removed PostgreSQL configuration files (drizzle.config.ts, server/db.ts, server/storage.ts, server/seed.ts, shared/schema.ts)