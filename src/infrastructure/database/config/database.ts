import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://alejandraalfaro:SXmH5mJ2tVigJ7ck@borboleta.egefkn1.mongodb.net/?retryWrites=true&w=majority&appName=Borboleta';
    
    await mongoose.connect(mongoURI);
   
  } catch (error) {
   
    process.exit(1);
  }
};

export default connectDB; 