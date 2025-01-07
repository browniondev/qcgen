"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeModel = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
class QRCodeModel {
    static async generateQRCode(content, options) {
        try {
            const defaultOptions = {
                width: 300,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            };
            const qrCodeDataURL = await qrcode_1.default.toDataURL(content, {
                ...defaultOptions,
                ...options,
            });
            return qrCodeDataURL;
        }
        catch (error) {
            throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
exports.QRCodeModel = QRCodeModel;
