import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import dns from "dns";
import User from "../modules/auth/user.model.js";

// Apply the same DNS fix used in app.js
dns.setServers(["8.8.4.4", "8.8.8.8"]);

dotenv.config();

const seedAdmin = async () => {
  try {
    // Include the dbName option so you seed the correct database!
    await mongoose.connect(process.env.DATABASE_URI, {
      dbName: process.env.DB_NAME,
    });

    const exists = await User.findOne({ role: "ADMIN" });
    if (exists) {
      console.log("Admin already exists");
      await mongoose.connection.close();
      return process.exit(0);
    }

    await User.create({
      email: "admin@alsafwahtravels.com",
      password: await bcrypt.hash("arslan2k3", 10),
      role: "ADMIN",
    });

    console.log("Admin created successfully!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seed admin error:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();