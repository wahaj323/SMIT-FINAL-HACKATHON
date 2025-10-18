// ✅ Imports
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import connectDB from "./config/db.js";
import ai, { modelName } from "./config/gemini.js";

import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import vitalsRoutes from "./routes/vitalsRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";

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

// ✅ File upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
  })
);

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/vitals", vitalsRoutes);
app.use("/api/analysis", analysisRoutes);

// ✅ Health route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "HealthMate API running" });
});

// ✅ Gemini test route
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

// ✅ Serve React build (for Production)
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  // ✅ FIX: use app.use instead of app.get for wildcard route
  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("HealthMate API (Local Dev Mode)");
  });
}

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(
    `🏥 HealthMate API ready for ${process.env.NODE_ENV || "development"}`
  );
});
