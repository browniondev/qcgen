import { parentPort, workerData } from "worker_threads";
import { QRCodeGenerator } from "./qrgenerator.service";

async function generateQRCodes() {
  try {
    const { filePath, urlTag, nameTag } = workerData;

    // Initialize QR Code Generator in the worker thread
    const generator = new QRCodeGenerator(filePath, urlTag, nameTag);

    // Send success message back to parent
    parentPort?.postMessage({
      success: true,
      message: "QR codes generated successfully",
      outputDirectory: generator.getOutputDirectory(),
    });
  } catch (error) {
    // Send error message back to parent
    parentPort?.postMessage({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

generateQRCodes();
