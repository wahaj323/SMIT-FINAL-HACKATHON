// ✅ Imports (ALL imports at the top)
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";

import connectDB from "./config/db.js";

// ✅ Gemini setup
import ai, { modelName } from "./config/gemini.js";

// ✅ Routes
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import vitalsRoutes from "./routes/vitalsRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";

// ✅ Config & Initialization
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// ✅ Connect to MongoDB
connectDB();

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ✅ File Upload Middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    abortOnLimit: true,
    createParentPath: true,
  })
);

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/vitals", vitalsRoutes);
app.use("/api/analysis", analysisRoutes);

// ✅ Health Check Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "HealthMate API is running",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Gemini Test Route
app.get("/api/test-gemini", async (req, res) => {
  try {
    const result = await ai.models.generateContent({
      model: modelName,
      contents: "Hello from Gemini 2.5 Flash 🚀",
    });
    res.send(result.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Serve React Build (for Production)
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  // ✅ Safe wildcard route for React Router (Express v5 fix)
  app.get("/*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // ✅ Local Dev Fallback
  app.get("/", (req, res) => {
    res.send("HealthMate API (Local Dev Mode)");
  });
}

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(
    `🏥 HealthMate API ready for ${process.env.NODE_ENV || "development"}`
  );
});
