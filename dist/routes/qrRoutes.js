"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/qrRoutes.ts
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const qr_controller_1 = require("../controllers/qr.controller");
const fs_1 = require("fs");
const router = (0, express_1.Router)();
const uploadDir = "./uploads";
const logoDir = "./logos";
[uploadDir, logoDir].forEach((dir) => {
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
});
const storage = multer_1.default.diskStorage({
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
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "logo" &&
            ["image/jpeg", "image/png", "image/gif"].includes(file.mimetype)) {
            cb(null, true);
        }
        else if ([
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
        ].includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type"));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});
router.post("/generate", upload.fields([
    { name: "file", maxCount: 1 },
    { name: "logo", maxCount: 1 },
]), qr_controller_1.generateQRCode);
exports.default = router;
