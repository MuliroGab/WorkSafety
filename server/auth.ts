import bcrypt from 'bcryptjs';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import type { Express, RequestHandler } from 'express';
import { storage } from './storage-mongo';
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

import { mongodb } from './mongodb';

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  let sessionStore;
  
  // Only use MongoDB session store if MongoDB is connected
  if (mongodb.isConnectedToDatabase()) {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/safety-first';
      sessionStore = MongoStore.create({
        mongoUrl: mongoUri,
        ttl: sessionTtl / 1000, // MongoStore expects TTL in seconds
        autoRemove: 'native',
        touchAfter: 24 * 3600, // lazy session update
      });
      console.log('Using MongoDB session store');
    } catch (error) {
      console.warn('MongoDB session store unavailable, using memory store');
      // Will use default memory store
    }
  } else {
    console.log('Using memory session store - MongoDB not connected');
  }
  
  return session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    store: sessionStore, // undefined will use default memory store
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