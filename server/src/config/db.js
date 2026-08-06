import mongoose from 'mongoose';

export let isMocked = false;

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI env variable is not set.');
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n[WARNING] MongoDB Connection failed: ${error.message}`);
    console.error(`[WARNING] The application will fall back to using an In-Memory store for Search History & Reports.\n`);
    isMocked = true;
  }
};
