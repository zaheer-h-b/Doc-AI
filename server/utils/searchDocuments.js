import qdrant from "../config/qdrant.js";
import { COLLECTION_NAME } from "../config/initQdrant.js";
import generateEmbedding from "./generateEmbedding.js";

const searchDocuments = async (question, userId, documentId) => {
  try {
    // Convert user question into an embedding
    const questionEmbedding = await generateEmbedding(question);

    // Build filter
    const must = [
      {
        key: "userId",
        match: {
          value: userId.toString(),
        },
      },
    ];

    // If a specific document is selected, search only in that document
    if (documentId) {
      must.push({
        key: "documentId",
        match: {
          value: documentId.toString(),
        },
      });
    }

    // Search Qdrant
    const results = await qdrant.query(COLLECTION_NAME, {
      query: questionEmbedding,
      filter: {
        must,
      },
      limit: 5,
      with_payload: true,
    });

    // Return only useful data
    return results.points.map((point) => ({
      score: point.score,
      text: point.payload.text,
      documentId: point.payload.documentId,
      chunkIndex: point.payload.chunkIndex,
    }));
  } catch (error) {
    console.error("Document search error:", error);
    throw new Error("Failed to search documents");
  }
};

export default searchDocuments;