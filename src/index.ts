import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { QRCodeGenerationQueue } from "./queue.service";
import { ParsedQs } from "qs";
import { existsSync, mkdirSync } from "fs";
import { fileCleanupService } from "./file-cleanup-service";
import { logger } from "./logger-service";
import xlsx from "xlsx";

const app = express();
const qrCodeQueue = new QRCodeGenerationQueue();

const uploadDir = "./uploads";
const logoDir = "./logos";
[uploadDir, logoDir].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
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

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.fieldname === "logo") {
    // Allow common image formats for logo
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/gif" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and GIF images are allowed for logo!"));
    }
  } else {
    // Excel file validation
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "text/csv"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel and CSV files are allowed!"));
    }
  }
};

// const upload = multer({ storage, fileFilter });
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post(
  "/generate",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    const jobId = `job-${Date.now()}`;
    logger.startJobLog(jobId);
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.file || !files.file[0]) {
        logger.error(jobId, "No Excel file uploaded");
        res.status(400).json({
          error: "No Excel file uploaded.",
          jobId,
          logs: logger.getJobLogs(jobId),
        });
        return;
      }

      const filePath: string = files.file[0].path;
      const logoPath: string | undefined = files.logo?.[0]?.path;
      logger.info(jobId, "Files uploaded successfully", { filePath, logoPath });
      const query: ParsedQs = req.body;

      // Optional user-specified column names
      const urlTag: string = (query.urlTag as string) || "LINK";
      const nameTag: string = (query.nameTag as string) || "CODE";

      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        logger.info(jobId, "Excel file read successfully", {
          rowCount: sheet.length,
        });

        const MAX_ROWS = 200;
        if (sheet.length > MAX_ROWS) {
          logger.error(jobId, "Excel file exceeds maximum allowed rows", {
            currentRows: sheet.length,
            maxAllowed: MAX_ROWS,
          });
          res.status(400).json({
            error: `Excel file exceeds maximum allowed rows. Only ${MAX_ROWS} rows are permitted.`,
            currentRowCount: sheet.length,
            maxAllowedRows: MAX_ROWS,
            jobId,
            logs: logger.getJobLogs(jobId),
          });
          return;
        }

        // Register files for cleanup
        const fileId = fileCleanupService.registerFile(filePath);
        let logoId: string | undefined;
        if (logoPath) {
          logoId = fileCleanupService.registerFile(logoPath);
          logger.info(jobId, "Files registered for cleanup", {
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

        logger.info(jobId, "Job queued successfully");

        // Respond to the client
        res.status(200).json({
          message: "QR code generation queued successfully!",
          fileId,
          logoId,
          jobId,
          jobDetails: result,
          logs: logger.getJobLogs(jobId),
        });
      } catch (error) {
        logger.error(jobId, "Error processing Excel file", error);

        res.status(400).json({
          error: "Failed to process Excel file",
          details: error instanceof Error ? error.message : "Unknown error",
          jobId,
          logs: logger.getJobLogs(jobId), // Now returns sanitized logs
        });
      }
    } catch (error) {
      logger.error(jobId, "Unexpected error during QR code generation", error);
      res.status(500).json({
        error: "Internal server error while generating QR codes",
        details: error instanceof Error ? error.message : "Unknown error",
        jobId,
        logs: logger.getJobLogs(jobId), // Now returns sanitized logs
      });
    }
  }
);

process.on("SIGINT", () => {
  fileCleanupService.shutdown();
  process.exit();
});

const port: number = parseInt(process.env.PORT || "3000");
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
