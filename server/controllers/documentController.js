import Document from "../models/Document.js";
import Chat from "../models/Chat.js";
import extractText from "../utils/extractText.js";
import chunkText from "../utils/chunkText.js";
import generateEmbedding from "../utils/generateEmbedding.js";
import qdrant from "../config/qdrant.js";
import { COLLECTION_NAME } from "../config/initQdrant.js";

const uploadDocument = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a document",
      });
    }

    // Get chat ID from request
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({
        message: "Chat ID is required",
      });
    }

    // Verify that the chat belongs to the logged-in user
    const chat = await Chat.findOne({
      _id: chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    // Extract text from PDF, DOCX, or TXT
    const extractedText = await extractText(
      req.file.path,
      req.file.mimetype
    );

    // Check if readable text was extracted
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        message: "No readable text found in this document",
      });
    }

    // Split extracted text into chunks
    const chunks = chunkText(extractedText);

    // Save document information in MongoDB
    const document = await Document.create({
      user: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      extractedText,
      status: "processing",
    });

    // Create embeddings and store chunks in Qdrant
    for (let index = 0; index < chunks.length; index++) {
      const embedding = await generateEmbedding(
        chunks[index]
      );

      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        points: [
          {
            id: crypto.randomUUID(),
            vector: embedding,
            payload: {
              userId: req.user.id,
              documentId: document._id.toString(),
              chunkIndex: index,
              text: chunks[index],
            },
          },
        ],
      });
    }

    // Mark document as processed
    document.status = "processed";
    await document.save();

    // Connect document to this chat
    chat.document = document._id;

    // Use uploaded filename as chat title
    chat.title = req.file.originalname;

    await chat.save();

    return res.status(201).json({
      message: "Document uploaded and processed successfully",

      document: {
        id: document._id,
        originalName: document.originalName,
        status: document.status,
      },

      chat: {
        id: chat._id,
        title: chat.title,
      },
    });
  } catch (error) {
    console.error("Document processing error:", error);

    return res.status(500).json({
      message: error.message || "Document processing failed",
    });
  }
};

export { uploadDocument };