import "dotenv/config"; // <--- Add this at the absolute top (Line 1)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getCorsOptions } from "./config/cors.config.js";
import authRoutes from "./modules/auth/auth.routes.js";
import packageRoutes from "./modules/package/package.routes.js";
import hotelRoutes from "./modules/hotel/hotel.routes.js";
import imageRoutes from "./modules/image/image.routes.js";
import inquiryRoutes from "./modules/inquiry/inquiry.routes.js";
import connectDb from "./config/database.config.js";
import dns from "dns";

dns.setServers(["8.8.4.4", "8.8.8.8"]);

// You can delete the old `import dotenv` and `dotenv.config()` calls.

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors(getCorsOptions()));

app.get("/", (req, res) => res.send("Test Route Working Great 😁"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/packages", packageRoutes);
app.use("/api/v1/hotels", hotelRoutes);
app.use("/api/v1/images", imageRoutes);
app.use("/api/v1/inquiries", inquiryRoutes);

const startServer = async () => {
  console.log("DB STRING:", process.env.DATABASE_URI);
  try {
    console.log("Trying to connect DB...");
    await connectDb();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Server failed to start", err);
  }
};

startServer();

export default app;