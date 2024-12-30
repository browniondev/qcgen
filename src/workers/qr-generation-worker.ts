//workers/qr-generation-worker.ts
import { parentPort, workerData } from "worker_threads";
import { QRCodeGenerator } from "../services/qrgenerator.service";
import { logger } from "../services/logger.service";

async function generateQRCodes() {
  const { filePath, urlTag, nameTag, logoPath, jobId } = workerData;
  try {
    logger.info(jobId, "Worker thread started", {
      filePath,
      urlTag,
      nameTag,
      logoPath,
      hasLogo: !!logoPath,
    });
    // Initialize QR Code Generator in the worker thread
    const generator = new QRCodeGenerator(filePath, urlTag, nameTag, logoPath);

    await new Promise((resolve) => setTimeout(resolve, 100));
    logger.info(jobId, "QR code generation completed in worker thread");

    // Send success message back to parent
    parentPort?.postMessage({
      success: true,
      message: "QR codes generated successfully",
      outputDirectory: generator.getOutputDirectory(),
      jobId,
    });
  } catch (error) {
    logger.error(jobId, "Error in worker thread", error);
    // Send error message back to parent
    parentPort?.postMessage({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      jobId,
    });
  }
}

generateQRCodes();
