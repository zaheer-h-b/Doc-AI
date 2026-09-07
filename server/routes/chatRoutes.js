import express from "express";

import {
  createChat,
  getChats,
  getChatById,
  chatWithDocument,
  deleteChat,
} from "../controllers/chatController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create new chat
router.post("/", protect, createChat);

// Get all chats
router.get("/", protect, getChats);

// Ask question about a document
router.post("/ask", protect, chatWithDocument);

// Get one chat with its messages
router.get("/:chatId", protect, getChatById);

// Delete a chat
router.delete("/:chatId", protect, deleteChat);

export default router;