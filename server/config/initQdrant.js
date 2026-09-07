import qdrant from "./qdrant.js";

const COLLECTION_NAME = "document_vectors";

const initQdrant = async () => {
  try {
    const collections = await qdrant.getCollections();

    const collectionExists = collections.collections.some(
      (collection) => collection.name === COLLECTION_NAME
    );

    // Create collection if it doesn't exist
    if (!collectionExists) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 768,
          distance: "Cosine",
        },
      });

      console.log("Qdrant collection created successfully");
    } else {
      console.log("Qdrant collection already exists");
    }

    // Create payload index for userId
    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: "userId",
      field_schema: "keyword",
    });

    console.log("Qdrant userId index created successfully");

    // Create payload index for documentId
    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: "documentId",
      field_schema: "keyword",
    });

    console.log("Qdrant documentId index created successfully");
  } catch (error) {
    console.error("Qdrant initialization error:", error);
  }
};

export { COLLECTION_NAME };
export default initQdrant;