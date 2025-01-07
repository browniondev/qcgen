// src/routes/qrRoutes.ts
import { Router } from "express";
import multer from "multer";
import { generateQRCode } from "../controllers/qr.controller";
import { existsSync, mkdirSync } from "fs";
import { auth } from "../middlewares/auth.middleware";

import { QRCodeModel } from "../models/singleqr.model";
import { QRCodeController } from "../controllers/singleqr.controller";

const router = Router();
const singleQrController = new QRCodeController(QRCodeModel);

const uploadDir = "./uploads";
const logoDir = "./logos";
[uploadDir, logoDir].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.fieldname === "logo" ? "./logos" : "./uploads";
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.fieldname === "logo" &&
      ["image/jpeg", "image/png", "image/gif"].includes(file.mimetype)
    ) {
      cb(null, true);
    } else if (
      [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ].includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: "File upload error",
      error: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      message: "Invalid file type or size",
      error: err.message,
    });
  }
  next();
};

router.post(
  "/generate",
  auth,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  handleMulterError,
  generateQRCode
);

router.post("/generate-single", singleQrController.generateQR);
export default router;
