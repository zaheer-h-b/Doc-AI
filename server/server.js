import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import initQdrant from "./config/initQdrant.js";

import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import { protect } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Doc-AI server is running",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

// Chat management routes
app.use("/api/chats", chatRoutes);

app.get("/api/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;

// Start database connections and server
const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // Initialize Qdrant
    await initQdrant();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();