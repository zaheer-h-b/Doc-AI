import dotenv from "dotenv";

import qdrant from "./config/qdrant.js";
import { COLLECTION_NAME } from "./config/initQdrant.js";
import generateEmbedding from "./utils/generateEmbedding.js";

dotenv.config();

const testSearch = async () => {
  try {
    const question = "How many paid leaves do employees receive?";

    // Step 1: Convert the question into an embedding
    const questionEmbedding = await generateEmbedding(question);

    // Step 2: Search similar vectors in Qdrant
    const results = await qdrant.query(COLLECTION_NAME, {
      query: questionEmbedding,
      limit: 5,
      with_payload: true,
    });

    console.log("\nSearch results:\n");

    results.points.forEach((result, index) => {
      console.log(`Result ${index + 1}`);
      console.log("Score:", result.score);
      console.log("Text:", result.payload.text);
      console.log("-------------------------");
    });
  } catch (error) {
    console.error("Search test failed:", error);
  }
};

testSearch();