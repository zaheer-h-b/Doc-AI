import dotenv from "dotenv";
import generateEmbedding from "./utils/generateEmbedding.js";

dotenv.config();

const testEmbedding = async () => {
  try {
    const text =
      "Employees are entitled to 20 days of paid leave every year.";

    const embedding = await generateEmbedding(text);

    console.log("Embedding generated successfully");
    console.log("Vector dimensions:", embedding.length);
    console.log("First 10 values:", embedding.slice(0, 10));
  } catch (error) {
    console.error("Test failed:", error.message);
  }
};

testEmbedding();