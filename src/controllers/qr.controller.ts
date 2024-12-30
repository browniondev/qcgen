// src/controllers/qr.controller.ts
import { Request, Response } from "express";
import xlsx from "xlsx";
import { fileCleanupService } from "../services/file-cleanup.service";
import { logger } from "../services/logger.service";
import { QRCodeGenerationQueue } from "../services/queue.service";

const qrCodeQueue = new QRCodeGenerationQueue();

const MAX_ROWS = 200;

export const generateQRCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("request received");
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
    const query = req.body;

    const urlTag: string = query.urlTag || "LINK";
    const nameTag: string = query.nameTag || "CODE";

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheet.length > MAX_ROWS) {
      logger.error(jobId, "Excel file exceeds maximum allowed rows", {
        currentRows: sheet.length,
        maxAllowed: MAX_ROWS,
      });
      res.status(400).json({
        error: `Excel file exceeds maximum allowed rows (${MAX_ROWS}).`,
        jobId,
      });
      return;
    }

    const fileId = fileCleanupService.registerFile(filePath);
    let logoId: string | undefined;
    if (logoPath) {
      logoId = fileCleanupService.registerFile(logoPath);
    }

    const result = await qrCodeQueue.enqueue({
      filePath,
      urlTag,
      nameTag,
      logoPath,
      jobId,
    });
    logger.info(jobId, "Job queued successfully");

    res.status(200).json({
      message:
        "QR code generation queued successfully and they will be downloaded shortly!",
      jobId,
      jobDetails: result,
      logs: logger.getJobLogs(jobId),
    });
  } catch (error) {
    logger.error(jobId, "Unexpected error during QR code generation", error);
    res.status(500).json({
      error: "Internal server error",
      jobId,
      logs: logger.getJobLogs(jobId),
    });
  }
};
