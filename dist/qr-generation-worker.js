"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const qrgenerator_service_1 = require("./qrgenerator.service");
const logger_service_1 = require("./logger-service");
async function generateQRCodes() {
    const { filePath, urlTag, nameTag, logoPath, jobId } = worker_threads_1.workerData;
    try {
        logger_service_1.logger.info(jobId, "Worker thread started", {
            filePath,
            urlTag,
            nameTag,
            logoPath,
            hasLogo: !!logoPath,
        });
        // Initialize QR Code Generator in the worker thread
        const generator = new qrgenerator_service_1.QRCodeGenerator(filePath, urlTag, nameTag, logoPath);
        await new Promise((resolve) => setTimeout(resolve, 100));
        logger_service_1.logger.info(jobId, "QR code generation completed in worker thread");
        // Send success message back to parent
        worker_threads_1.parentPort?.postMessage({
            success: true,
            message: "QR codes generated successfully",
            outputDirectory: generator.getOutputDirectory(),
            jobId,
        });
    }
    catch (error) {
        logger_service_1.logger.error(jobId, "Error in worker thread", error);
        // Send error message back to parent
        worker_threads_1.parentPort?.postMessage({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
            jobId,
        });
    }
}
generateQRCodes();
