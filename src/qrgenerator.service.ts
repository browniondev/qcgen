const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const QRCode = require("qrcode");
const Jimp = require("jimp");

/**
 * Class to generate QR codes from an Excel file with optional user column input.
 *
 * @param source - The path to the Excel file.
 * @param urlTag - The column header containing the URLs. Defaults to 'LINK'.
 * @param nameTag - The column header containing the names. Defaults to 'CODE'.
 */
export class QRCodeGenerator {
  protected sheet: Array<object>;
  protected outputDir = "./qrcodes";

  constructor(
    private source: string,
    private urlTag: string,
    private nameTag: string
  ) {
    const logoFilePath = "D:/brown ion/qcgen-server-dev/src/logo.jpeg"; // Path to your custom logo

    // Validate and create the output directory
    this.ensureOutputDirectory();

    // Read and process the Excel file
    if (this.readExcel()) {
      this.generateQRCodes(logoFilePath);
    }
  }

  /**
   * Ensure the output directory exists.
   */
  private ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir);
    }
  }

  /**
   * Reads the Excel file and validates default or user-specified columns.
   */
  private readExcel() {
    try {
      const workbook = xlsx.readFile(this.source);
      const sheetName = workbook.SheetNames[0];
      this.sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!this.validateColumns()) {
        console.error(
          `Error: Specified columns '${this.urlTag}' or '${this.nameTag}' do not exist in the provided Excel file.`
        );
        return false;
      }

      // Find the actual column names (case-insensitive)
      const sampleRow = this.sheet[0];
      const columnNames = Object.keys(sampleRow);

      // Find the actual column matching the input tags (case-insensitive)
      this.urlTag = columnNames.find(
        (col) => col.trim().toLowerCase() === this.urlTag.trim().toLowerCase()
      );
      this.nameTag = columnNames.find(
        (col) => col.trim().toLowerCase() === this.nameTag.trim().toLowerCase()
      );

      return true;
    } catch (error) {
      console.error("Error reading Excel file:", error);
      return false;
    }
  }

  /**
   * Validates if specified or default columns exist in the Excel sheet.
   */
  private validateColumns(): boolean {
    const sampleRow = this.sheet[0]; // Take the first row as a sample
    if (!sampleRow) {
      console.error("Error: Excel file is empty.");
      return false;
    }

    const columnNames = Object.keys(sampleRow);

    // Convert both the input tags and existing column names to lowercase for comparison
    const normalizedColumnNames = columnNames.map((col) =>
      col.trim().toLowerCase()
    );
    const normalizedUrlTag = this.urlTag.trim().toLowerCase();
    const normalizedNameTag = this.nameTag.trim().toLowerCase();

    // Check if the normalized columns exist
    const urlColumnExists = normalizedColumnNames.includes(normalizedUrlTag);
    const nameColumnExists = normalizedColumnNames.includes(normalizedNameTag);

    if (!urlColumnExists || !nameColumnExists) {
      console.error(
        `Error: Required columns not found.
        Looking for: '${this.urlTag}' and '${this.nameTag}'
        Available columns: ${columnNames.join(", ")}`
      );
      return false;
    }

    // If we've made it here, columns exist
    return true;
  }

  /**
   * Generates QR codes with an optional logo for each row in the Excel file.
   */

  private generateQRCodes(logoFilePath: string) {
    this.sheet.forEach(async (row, index) => {
      const link = row[this.urlTag];
      const name = row[this.nameTag];

      if (link && name) {
        // Create a safe filename from the URL
        const sanitizedName = this.sanitizeFilename(name);

        try {
          await this.generateQRCodeWithLogo(link, sanitizedName, logoFilePath);
        } catch (error) {
          console.error(
            `Failed to generate QR code for row ${index + 1}:`,
            error
          );
        }
      } else {
        console.error(
          `Invalid data in row ${index + 1}: Missing '${this.urlTag}'.`
        );
      }
    });
  }
  /**
   * Sanitizes a filename to be safe for file system
   */
  private sanitizeFilename(filename: string): string {
    // Remove invalid characters and replace with underscores
    return filename
      .toString()
      .replace(/[/\\?%*:|"<>]/g, "_") // Remove invalid file system characters
      .trim() // Remove leading/trailing whitespace
      .substring(0, 255); // Limit filename length
  }
  /**
   * Generates a QR code with an embedded logo.
   */

  private async generateQRCodeWithLogo(
    link: string,
    name: string,
    logoPath: string
  ) {
    try {
      // Generate the QR code as a buffer
      const qrCodeBuffer = await QRCode.toBuffer(name, {
        errorCorrectionLevel: "H",
        width: 500,
      });

      // Load the QR code and logo image
      const qrImage = await Jimp.read(qrCodeBuffer);
      const logo = await Jimp.read(logoPath);

      // Resize the logo
      logo.resize(80, 80);

      // Calculate center position for the logo
      const xPos = qrImage.bitmap.width / 2 - logo.bitmap.width / 2;
      const yPos = qrImage.bitmap.height / 2 - logo.bitmap.height / 2;

      // Composite the logo onto the QR code
      qrImage.composite(logo, xPos, yPos);

      // Save the QR code as a file
      const outputFilePath = path.join(this.outputDir, `${link}.png`);
      await qrImage.writeAsync(outputFilePath);

      console.log(`QR Code for '${name}' saved to '${outputFilePath}'`);
    } catch (error) {
      console.error(`Error generating QR code for '${link}':`, error);
    }
  }
  public getOutputDirectory(): string {
    return this.outputDir;
  }
}
