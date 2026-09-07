import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateAnswer = async (question, context) => {
  try {
    const prompt = `
You are Doc-AI, a helpful AI assistant.

You have access to document context provided below.

INSTRUCTIONS:

1. If the user's question is related to the provided document context, answer using the document context.
2. If the user asks a normal conversational question such as greetings, introductions, "how are you", or other casual conversation, respond naturally as a helpful AI assistant.
3. Do not say that information is unavailable for normal conversational questions.
4. If the user asks something unrelated to the document but it requires factual information that is not present in the document, you may answer using your general knowledge.
5. For document-related questions, prioritize the provided document context.
6. Do not use Markdown symbols such as **, ##, or * in your response.

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${question}

ANSWER:
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Answer generation error:", error);
    throw new Error("Failed to generate answer");
  }
};

export default generateAnswer;