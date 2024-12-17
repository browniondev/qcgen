"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const qrgenerator_service_1 = require("./qrgenerator.service");
async function generateQRCodes() {
    try {
        const { filePath, urlTag, nameTag } = worker_threads_1.workerData;
        // Initialize QR Code Generator in the worker thread
        const generator = new qrgenerator_service_1.QRCodeGenerator(filePath, urlTag, nameTag);
        // Send success message back to parent
        worker_threads_1.parentPort?.postMessage({
            success: true,
            message: "QR codes generated successfully",
            outputDirectory: generator.getOutputDirectory(),
        });
    }
    catch (error) {
        // Send error message back to parent
        worker_threads_1.parentPort?.postMessage({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
}
generateQRCodes();
