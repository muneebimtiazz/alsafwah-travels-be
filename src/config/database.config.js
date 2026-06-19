import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("DB connection successful");
  } catch (err) {
    console.log("DB connection failed", err);
    process.exit(1);
  }
};

export default connectDb;
