import dotenv from "dotenv";

import searchDocuments from "./utils/searchDocuments.js";
import generateAnswer from "./utils/generateAnswer.js";

dotenv.config();

const testRAG = async () => {
  try {
    // Ask a question related to your uploaded document
    const question = "What is this document mainly about?";

    // Replace with your actual IDs
    const userId = "6a9e4b6bf45d32571efd3636";
    const documentId = "6a9e4b96f45d32571efd3637";

    // Step 1: Retrieve relevant chunks
    const results = await searchDocuments(
      question,
      userId,
      documentId
    );

    if (results.length === 0) {
      console.log("No relevant information found.");
      return;
    }

    // Step 2: Combine retrieved chunks into one context
    const context = results
      .map(
        (result, index) =>
          `Context ${index + 1}:\n${result.text}`
      )
      .join("\n\n");

    console.log("\nRetrieved Context:\n");
    console.log(context);

    // Step 3: Generate answer using Gemini
    const answer = await generateAnswer(question, context);

    console.log("\nAI Answer:\n");
    console.log(answer);
  } catch (error) {
    console.error("RAG test failed:", error);
  }
};

testRAG();