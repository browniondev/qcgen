// import express, { Request, Response } from "express";
// import multer, { FileFilterCallback } from "multer";
// import { QRCodeGenerator } from "./qrgenerator.service";
// import { ParsedQs } from "qs";
// import { existsSync, mkdirSync } from "fs";
// import xlsx from "xlsx";

// const app = express();

// // Ensure the uploads directory exists
// const uploadDir = "./uploads";
// if (!existsSync(uploadDir)) {
//   mkdirSync(uploadDir);
// }

// // Multer configuration to handle file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });

// const fileFilter = (
//   req: Request,
//   file: Express.Multer.File,
//   cb: FileFilterCallback
// ) => {
//   // Allow only Excel files
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

// const upload = multer({ storage, fileFilter });

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// /**
//  * Health check route to verify server status.
//  */
// app.get("/", (req: Request, res: Response) => {
//   const name: string = process.env.NAME || "World";
//   res.send(`Hello ${name}! Server is running.`);
// });

// /**
//  * Route to upload an Excel file and generate QR codes.
//  * - Accepts file upload via multipart/form-data.
//  * - Optional query parameters: `urlTag` and `nameTag`.
//  */
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

//       const filePath: string = req.file.path; // Path to the uploaded file
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
//         res.status(400).json({
//           error: `Excel file exceeds maximum allowed rows. Only ${MAX_ROWS} rows are permitted.`,
//           currentRowCount: sheet.length,
//           maxAllowedRows: MAX_ROWS,
//         });
//         return;
//       }

//       // Initialize QRCodeGenerator
//       const generator = new QRCodeGenerator(filePath, urlTag, nameTag);

//       res.status(200).json({
//         message: "QR code generation started successfully!",
//         filePath,
//         urlTag,
//         nameTag,
//       });
//     } catch (error) {
//       console.error("Error during QR code generation:", error);
//       res
//         .status(500)
//         .json({ error: "Internal server error while generating QR codes." });
//     }
//   }
// );

// /**
//  * Start the server on the specified port.
//  */
// const port: number = parseInt(process.env.PORT || "3000");
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });

import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { QRCodeGenerationQueue } from "./queue.service";
import { ParsedQs } from "qs";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import xlsx from "xlsx";

const app = express();
const qrCodeQueue = new QRCodeGenerationQueue();

// Existing upload configuration remains the same...
const uploadDir = "./uploads";
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.mimetype === "text/csv"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel and csv files are allowed!"));
  }
};

const upload = multer({ storage, fileFilter });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post(
  "/generate",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure the file exists
      if (!req.file) {
        res.status(400).json({ error: "No Excel file uploaded." });
        return;
      }

      const filePath: string = req.file.path;
      const query: ParsedQs = req.body;

      // Optional user-specified column names
      const urlTag: string = (query.urlTag as string) || "CODE";
      const nameTag: string = (query.nameTag as string) || "LINK";

      // Read the Excel file to check row count
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Check row count limit
      const MAX_ROWS = 200;
      if (sheet.length > MAX_ROWS) {
        // Clean up the uploaded file
        unlinkSync(filePath);

        res.status(400).json({
          error: `Excel file exceeds maximum allowed rows. Only ${MAX_ROWS} rows are permitted.`,
          currentRowCount: sheet.length,
          maxAllowedRows: MAX_ROWS,
        });
        return;
      }

      // Enqueue the job for QR code generation
      const result = await qrCodeQueue.enqueue({
        filePath,
        urlTag,
        nameTag,
      });

      // Clean up the uploaded file after processing
      unlinkSync(filePath);

      // Respond to the client
      res.status(200).json({
        message: "QR code generation queued successfully!",
        jobDetails: result,
      });
    } catch (error) {
      console.error("Error during QR code generation:", error);
      res
        .status(500)
        .json({ error: "Internal server error while generating QR codes." });
    }
  }
);

const port: number = parseInt(process.env.PORT || "3000");
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
