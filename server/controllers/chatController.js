import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

import searchDocuments from "../utils/searchDocuments.js";
import generateAnswer from "../utils/generateAnswer.js";

// Create a new chat
const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      user: req.user.id,
      title: "New Chat",
    });

    return res.status(201).json({
      message: "New chat created successfully",
      chat,
    });
  } catch (error) {
    console.error("Create chat error:", error);

    return res.status(500).json({
      message: "Failed to create a new chat",
    });
  }
};

// Get all chats for the logged-in user
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      user: req.user.id,
    })
      .populate("document", "originalName")
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      chats,
    });
  } catch (error) {
    console.error("Get chats error:", error);

    return res.status(500).json({
      message: "Failed to get chats",
    });
  }
};

// Get one chat and its messages
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user.id,
    }).populate("document", "originalName");

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    const messages = await Message.find({
      chat: chat._id,
    }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      chat,
      messages,
    });
  } catch (error) {
    console.error("Get chat error:", error);

    return res.status(500).json({
      message: "Failed to get chat",
    });
  }
};

// Ask a question about the uploaded document
const chatWithDocument = async (req, res) => {
  try {
    const { question, documentId, chatId } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    if (!chatId) {
      return res.status(400).json({
        message: "Chat ID is required",
      });
    }

    // Verify the chat belongs to the logged-in user
    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    // Save user's question
    await Message.create({
      chat: chatId,
      role: "user",
      content: question.trim(),
    });

    // Search relevant document chunks
    const results = await searchDocuments(
      question,
      req.user.id,
      documentId
    );

    // Handle no relevant results
    if (results.length === 0) {
      const noInformationAnswer =
        "No relevant information was found in the uploaded document.";

      await Message.create({
        chat: chatId,
        role: "assistant",
        content: noInformationAnswer,
      });

      return res.status(200).json({
        answer: noInformationAnswer,
        sources: [],
      });
    }

    // Build context for the AI model
    const context = results
      .map(
        (result, index) =>
          `Context ${index + 1}:\n${result.text}`
      )
      .join("\n\n");

    // Generate answer
    const answer = await generateAnswer(
      question,
      context
    );

    // Save assistant response
    await Message.create({
      chat: chatId,
      role: "assistant",
      content: answer,
    });

    // Update chat timestamp
    chat.updatedAt = new Date();
    await chat.save();

    return res.status(200).json({
      answer,
      sources: results.map((result) => ({
        documentId: result.documentId,
        chunkIndex: result.chunkIndex,
        score: result.score,
      })),
    });
  } catch (error) {
    console.error("Chat error:", error);

    return res.status(500).json({
      message:
        error.message ||
        "Failed to process chat request",
    });
  }
};
const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    await Chat.deleteOne({
      _id: chatId,
    });

    return res.status(200).json({
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Delete chat error:", error);

    return res.status(500).json({
      message:
        error.message || "Failed to delete chat",
    });
  }
};

export {
  createChat,
  getChats,
  getChatById,
  chatWithDocument,
  deleteChat,
};