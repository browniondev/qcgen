import { Request, Response } from "express";
import { QRCodeModel } from "../models/singleqr.model";
import { QRCodeResponse, GenerateQRRequest } from "../types/qr.types";

export class QRCodeController {
  private qrModel: typeof QRCodeModel;

  constructor(qrModel: typeof QRCodeModel) {
    this.qrModel = qrModel;
  }

  generateQR = async (
    req: Request<{}, {}, GenerateQRRequest>,
    res: Response<QRCodeResponse>
  ): Promise<void> => {
    try {
      const { content, type } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          message: "Content is required",
        });
        return;
      }

      // Validate URL if type is url
      if (type === "url") {
        try {
          new URL(content);
        } catch (error) {
          res.status(400).json({
            success: false,
            message: "Invalid URL format",
          });
          return;
        }
      }

      // Validate text length
      if (content.length > 2000) {
        res.status(400).json({
          success: false,
          message: "Content exceeds maximum length of 2000 characters",
        });
        return;
      }

      const qrCode = await this.qrModel.generateQRCode(content);

      res.status(200).json({
        success: true,
        data: qrCode,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };
}
