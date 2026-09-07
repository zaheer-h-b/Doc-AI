import qdrant from "./config/qdrant.js";
import { COLLECTION_NAME } from "./config/initQdrant.js";

const checkPoints = async () => {
  try {
    const results = await qdrant.scroll(COLLECTION_NAME, {
      limit: 10,
      with_payload: true,
      with_vector: false,
    });

    console.log("Points found:", results.points.length);

    results.points.forEach((point, index) => {
      console.log(`\nPoint ${index + 1}`);
      console.log("ID:", point.id);
      console.log("Payload:", point.payload);
    });
  } catch (error) {
    console.error("Error checking points:", error);
  }
};

checkPoints();