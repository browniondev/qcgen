// src/routes/qrRoutes.ts
import { Router } from "express";
import multer from "multer";
import { generateQRCode } from "../controllers/qr.controller";
import { existsSync, mkdirSync } from "fs";
const router = Router();

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

router.post(
  "/generate",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  generateQRCode
);

export default router;
