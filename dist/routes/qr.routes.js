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
const auth_middleware_1 = require("../middlewares/auth.middleware");
const singleqr_model_1 = require("../models/singleqr.model");
const singleqr_controller_1 = require("../controllers/singleqr.controller");
const router = (0, express_1.Router)();
const singleQrController = new singleqr_controller_1.QRCodeController(singleqr_model_1.QRCodeModel);
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
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        return res.status(400).json({
            message: "File upload error",
            error: err.message,
        });
    }
    else if (err) {
        return res.status(400).json({
            message: "Invalid file type or size",
            error: err.message,
        });
    }
    next();
};
router.post("/generate", auth_middleware_1.auth, upload.fields([
    { name: "file", maxCount: 1 },
    { name: "logo", maxCount: 1 },
]), handleMulterError, qr_controller_1.generateQRCode);
router.post("/generate-single", singleQrController.generateQR);
exports.default = router;
