import mongoose from 'mongoose';

// Use MongoDB Atlas free tier if available, otherwise fall back to localhost
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://safety-app:password@cluster0.mongodb.net/safety-first?retryWrites=true&w=majority' || 'mongodb://localhost:27017/safety-first';

// Connection options
const options = {
  // Connection timeout
  serverSelectionTimeoutMS: 5000,
  // Socket timeout
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
};

class MongoDB {
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      console.log('Connecting to MongoDB...');
      
      // Try to connect with a timeout
      await Promise.race([
        mongoose.connect(MONGODB_URI, options),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000)
        )
      ]);
      
      this.isConnected = true;
      console.log('Successfully connected to MongoDB');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.warn('Could not connect to MongoDB, falling back to memory storage:', error instanceof Error ? error.message : 'Unknown error');
      this.isConnected = false;
      // Don't throw error, allow fallback
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  isConnectedToDatabase(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  getConnection() {
    return mongoose.connection;
  }
}

export const mongodb = new MongoDB();
export default mongodb;