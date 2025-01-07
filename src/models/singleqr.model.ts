import QRCode from "qrcode";
import { QRCodeOptions } from "../types/qr.types";

export class QRCodeModel {
  static async generateQRCode(
    content: string,
    options?: Partial<QRCodeOptions>
  ): Promise<string> {
    try {
      const defaultOptions: QRCodeOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      };

      const qrCodeDataURL = await QRCode.toDataURL(content, {
        ...defaultOptions,
        ...options,
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error(
        `Failed to generate QR code: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
