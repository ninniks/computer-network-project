import mongoose from 'mongoose';

export const connectDatabase = async () => {
  const url = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@localhost/${process.env.DB_NAME}?authSource=admin`;
  await mongoose.connect(url);
};
