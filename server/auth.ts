import bcrypt from 'bcryptjs';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import MemoryStore from 'memorystore';
import type { Express, RequestHandler } from 'express';
import { storage } from './storage-hybrid';
import { nanoid } from 'nanoid';

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

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  let sessionStore;
  try {
    // Try to use MongoDB store first
    sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/safety-first',
      ttl: sessionTtl / 1000, // MongoStore expects TTL in seconds
      autoRemove: 'native',
      touchAfter: 24 * 3600, // lazy session update
    });
  } catch (error) {
    // Fall back to memory store if MongoDB is not available
    const MemStore = MemoryStore(session);
    sessionStore = new MemStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }
  
  return session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}