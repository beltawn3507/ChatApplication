import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/chatApp');
    console.log(`MongoDB connected`.cyan.underline);
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
