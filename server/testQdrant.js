import dotenv from "dotenv";
import { randomUUID } from "crypto";

import qdrant from "./config/qdrant.js";
import { COLLECTION_NAME } from "./config/initQdrant.js";
import generateEmbedding from "./utils/generateEmbedding.js";

dotenv.config();

const testQdrant = async () => {
  try {
    const text =
      "Employees are entitled to 20 days of paid leave every year.";

    // Step 1: Generate embedding
    const embedding = await generateEmbedding(text);

    // Step 2: Store embedding in Qdrant
    await qdrant.upsert(COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: randomUUID(),
          vector: embedding,
          payload: {
            text: text,
            userId: "test-user",
            documentId: "test-document",
            chunkIndex: 0,
          },
        },
      ],
    });

    console.log("Embedding stored successfully in Qdrant");
  } catch (error) {
    console.error("Qdrant test failed:", error);
  }
};

testQdrant();