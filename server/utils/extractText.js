import fs from "fs";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const extractText = async (filePath, fileType) => {
  try {
    // PDF
    if (fileType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);

      const parser = new PDFParse({ data: dataBuffer });

      const result = await parser.getText();

      return result.text;
    }

    // DOCX
    if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        path: filePath,
      });

      return result.value;
    }

    // TXT
    if (fileType === "text/plain") {
      return fs.readFileSync(filePath, "utf-8");
    }

    throw new Error("Unsupported file type");
  } catch (error) {
    throw new Error(`Text extraction failed: ${error.message}`);
  }
};

export default extractText;