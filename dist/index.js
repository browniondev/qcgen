"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const queue_service_1 = require("./queue.service");
const fs_1 = require("fs");
const file_cleanup_service_1 = require("./file-cleanup-service");
const logger_service_1 = require("./logger-service");
const xlsx_1 = __importDefault(require("xlsx"));
const app = (0, express_1.default)();
const qrCodeQueue = new queue_service_1.QRCodeGenerationQueue();
// Existing upload configuration remains the same...
// const uploadDir = "./uploads";
// if (!existsSync(uploadDir)) {
//   mkdirSync(uploadDir);
// }
const uploadDir = "./uploads";
const logoDir = "./logos";
[uploadDir, logoDir].forEach((dir) => {
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
});
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Store logos in the logos subdirectory
        const dest = file.fieldname === "logo" ? logoDir : uploadDir;
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});
// const fileFilter = (
//   req: Request,
//   file: Express.Multer.File,
//   cb: FileFilterCallback
// ) => {
//   if (
//     file.mimetype ===
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
//     file.mimetype === "application/vnd.ms-excel" ||
//     file.mimetype === "text/csv"
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only Excel and csv files are allowed!"));
//   }
// };
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "logo") {
        // Allow common image formats for logo
        if (file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/gif" ||
            file.mimetype === "image/jpg") {
            cb(null, true);
        }
        else {
            cb(new Error("Only JPG, PNG, and GIF images are allowed for logo!"));
        }
    }
    else {
        // Excel file validation
        if (file.mimetype ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.mimetype === "application/vnd.ms-excel" ||
            file.mimetype === "text/csv") {
            cb(null, true);
        }
        else {
            cb(new Error("Only Excel and CSV files are allowed!"));
        }
    }
};
// const upload = multer({ storage, fileFilter });
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// app.post(
//   "/generate",
//   upload.single("file"),
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       // Ensure the file exists
//       if (!req.file) {
//         res.status(400).json({ error: "No Excel file uploaded." });
//         return;
//       }
//       const filePath: string = req.file.path;
//       const query: ParsedQs = req.body;
//       // Optional user-specified column names
//       const urlTag: string = (query.urlTag as string) || "CODE";
//       const nameTag: string = (query.nameTag as string) || "LINK";
//       // Read the Excel file to check row count
//       const workbook = xlsx.readFile(filePath);
//       const sheetName = workbook.SheetNames[0];
//       const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
//       // Check row count limit
//       const MAX_ROWS = 200;
//       if (sheet.length > MAX_ROWS) {
//         // Clean up the uploaded file
//         unlinkSync(filePath);
//         res.status(400).json({
//           error: `Excel file exceeds maximum allowed rows. Only ${MAX_ROWS} rows are permitted.`,
//           currentRowCount: sheet.length,
//           maxAllowedRows: MAX_ROWS,
//         });
//         return;
//       }
//       // Enqueue the job for QR code generation
//       const result = await qrCodeQueue.enqueue({
//         filePath,
//         urlTag,
//         nameTag,
//       });
//       // Clean up the uploaded file after processing
//       unlinkSync(filePath);
//       // Respond to the client
//       res.status(200).json({
//         message: "QR code generation queued successfully!",
//         jobDetails: result,
//       });
//     } catch (error) {
//       console.error("Error during QR code generation:", error);
//       res
//         .status(500)
//         .json({ error: "Internal server error while generating QR codes." });
//     }
//   }
// );
app.post("/generate", upload.fields([
    { name: "file", maxCount: 1 },
    { name: "logo", maxCount: 1 },
]), async (req, res) => {
    const jobId = `job-${Date.now()}`;
    logger_service_1.logger.startJobLog(jobId);
    try {
        const files = req.files;
        // Check for Excel file
        // if (!files.file || !files.file[0]) {
        //   res.status(400).json({ error: "No Excel file uploaded." });
        //   return;
        // }
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
        // Optional user-specified column names
        const urlTag = query.urlTag || "LINK";
        const nameTag = query.nameTag || "CODE";
        // // Read the Excel file to check row count
        // const workbook = xlsx.readFile(filePath);
        // const sheetName = workbook.SheetNames[0];
        // const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        // logger.info(jobId, "Excel file read successfully", {
        //   rowCount: sheet.length,
        // });
        // // Check row count limit
        // const MAX_ROWS = 200;
        // if (sheet.length > MAX_ROWS) {
        //   logger.error(jobId, "Excel file exceeds maximum allowed rows", {
        //     currentRows: sheet.length,
        //     maxAllowed: MAX_ROWS,
        //   });
        //   res.status(400).json({
        //     error: `Excel file exceeds maximum allowed rows. Only ${MAX_ROWS} rows are permitted.`,
        //     currentRowCount: sheet.length,
        //     maxAllowedRows: MAX_ROWS,
        //     jobId,
        //     logs: logger.getJobLogs(jobId),
        //   });
        //   return;
        // }
        // // Register files for cleanup
        // const fileId = fileCleanupService.registerFile(filePath);
        // let logoId: string | undefined;
        // if (logoPath) {
        //   logoId = fileCleanupService.registerFile(logoPath);
        //   logger.info(jobId, "Files registered for cleanup", { fileId, logoId });
        // }
        // // Enqueue the job for QR code generation
        // const result = await qrCodeQueue.enqueue({
        //   filePath,
        //   urlTag,
        //   nameTag,
        //   logoPath,
        //   jobId,
        // });
        // logger.info(jobId, "Job queued successfully");
        // // Respond to the client
        // res.status(200).json({
        //   message: "QR code generation queued successfully!",
        //   fileId,
        //   logoId,
        //   jobId,
        //   jobDetails: result,
        //   logs: logger.getJobLogs(jobId),
        // });
        try {
            const workbook = xlsx_1.default.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetName]);
            logger_service_1.logger.info(jobId, "Excel file read successfully", {
                rowCount: sheet.length,
            });
            const MAX_ROWS = 200;
            if (sheet.length > MAX_ROWS) {
                logger_service_1.logger.error(jobId, "Excel file exceeds maximum allowed rows", {
                    currentRows: sheet.length,
                    maxAllowed: MAX_ROWS,
                });
                res.status(400).json({
                    error: `Excel file exceeds maximum allowed rows. Only ${MAX_ROWS} rows are permitted.`,
                    currentRowCount: sheet.length,
                    maxAllowedRows: MAX_ROWS,
                    jobId,
                    logs: logger_service_1.logger.getJobLogs(jobId),
                });
                return;
            }
            // Register files for cleanup
            const fileId = file_cleanup_service_1.fileCleanupService.registerFile(filePath);
            let logoId;
            if (logoPath) {
                logoId = file_cleanup_service_1.fileCleanupService.registerFile(logoPath);
                logger_service_1.logger.info(jobId, "Files registered for cleanup", {
                    fileId,
                    logoId,
                });
            }
            // Enqueue the job for QR code generation
            const result = await qrCodeQueue.enqueue({
                filePath,
                urlTag,
                nameTag,
                logoPath,
                jobId,
            });
            logger_service_1.logger.info(jobId, "Job queued successfully");
            // Respond to the client
            res.status(200).json({
                message: "QR code generation queued successfully!",
                fileId,
                logoId,
                jobId,
                jobDetails: result,
                logs: logger_service_1.logger.getJobLogs(jobId),
            });
        }
        catch (error) {
            logger_service_1.logger.error(jobId, "Error processing Excel file", error);
            res.status(400).json({
                error: "Failed to process Excel file",
                details: error instanceof Error ? error.message : "Unknown error",
                jobId,
                logs: logger_service_1.logger.getJobLogs(jobId), // Now returns sanitized logs
            });
        }
    }
    catch (error) {
        logger_service_1.logger.error(jobId, "Unexpected error during QR code generation", error);
        res.status(500).json({
            error: "Internal server error while generating QR codes",
            details: error instanceof Error ? error.message : "Unknown error",
            jobId,
            logs: logger_service_1.logger.getJobLogs(jobId), // Now returns sanitized logs
        });
    }
});
process.on("SIGINT", () => {
    file_cleanup_service_1.fileCleanupService.shutdown();
    process.exit();
});
const port = parseInt(process.env.PORT || "3000");
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
