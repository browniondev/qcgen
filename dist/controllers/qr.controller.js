"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRCode = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const file_cleanup_service_1 = require("../services/file-cleanup.service");
const logger_service_1 = require("../services/logger.service");
const queue_service_1 = require("../services/queue.service");
const qrCodeQueue = new queue_service_1.QRCodeGenerationQueue();
const MAX_ROWS = 200;
const generateQRCode = async (req, res) => {
    console.log("request received");
    const jobId = `job-${Date.now()}`;
    logger_service_1.logger.startJobLog(jobId);
    try {
        const files = req.files;
        if (!files.file || !files.file[0]) {
            logger_service_1.logger.error(jobId, "No Excel file uploaded");
            res.status(400).json({
                error: "No Excel file uploaded.",
                jobId,
                logs: logger_service_1.logger.getJobLogs(jobId),
            });
            return;
        }
        const filePath = files.file[0].path;
        const logoPath = files.logo?.[0]?.path;
        logger_service_1.logger.info(jobId, "Files uploaded successfully", { filePath, logoPath });
        const query = req.body;
        const urlTag = query.urlTag || "LINK";
        const nameTag = query.nameTag || "CODE";
        const workbook = xlsx_1.default.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (sheet.length > MAX_ROWS) {
            logger_service_1.logger.error(jobId, "Excel file exceeds maximum allowed rows", {
                currentRows: sheet.length,
                maxAllowed: MAX_ROWS,
            });
            res.status(400).json({
                error: `Excel file exceeds maximum allowed rows (${MAX_ROWS}).`,
                jobId,
            });
            return;
        }
        const fileId = file_cleanup_service_1.fileCleanupService.registerFile(filePath);
        let logoId;
        if (logoPath) {
            logoId = file_cleanup_service_1.fileCleanupService.registerFile(logoPath);
        }
        const result = await qrCodeQueue.enqueue({
            filePath,
            urlTag,
            nameTag,
            logoPath,
            jobId,
        });
        logger_service_1.logger.info(jobId, "Job queued successfully");
        res.status(200).json({
            message: "QR code generation queued successfully and they will be downloaded shortly!",
            jobId,
            jobDetails: result,
            logs: logger_service_1.logger.getJobLogs(jobId),
        });
    }
    catch (error) {
        logger_service_1.logger.error(jobId, "Unexpected error during QR code generation", error);
        res.status(500).json({
            error: "Internal server error",
            jobId,
            logs: logger_service_1.logger.getJobLogs(jobId),
        });
    }
};
exports.generateQRCode = generateQRCode;
