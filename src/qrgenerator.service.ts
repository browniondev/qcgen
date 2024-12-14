const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const QRCode = require('qrcode');
const Jimp = require('jimp');

/**
 * Class to generate QR codes from an Excel file.
 *
 * @param source - The path to the Excel file.
 * @param urlTag - The column header containing the URLs. Defaults to 'URL'.
 * @param nameTag - The column header containing the names. Defaults to 'Name'.
 */
export class QRCodeGenerator {


    protected sheet: Array<object>;
    protected outputDir = './qrcodes';

    constructor(private source: string, private urlTag: string = 'LINK ', private nameTag: string = 'CODE ') {
        // Path to the Excel file and the logo image
        const logoFilePath = "C:/Users/hpath/Downloads/qrcode-generator/src/logo.jpeg";   // Path to your custom logo

        // Create the output directory if it doesn't exist
        if (!fs.existsSync(this.outputDir)){
            fs.mkdirSync(this.outputDir);
        }

        // Read the Excel file and generate QR codes
        if (this.readExcel()) {
            this.sheet.forEach(async (row) => {
                const link = row[`${this.urlTag}`];
                const name = row[`${this.nameTag}`];
            
                if (link && name) {
                    await this.generateQRCodeWithLogo(link, name, logoFilePath);
                } else {
                    console.error(`Invalid data in row:`, row);
                }
            });
        }
    }

    private readExcel() {
        // Read the Excel file
            const workbook = xlsx.readFile(this.source);
            const sheetName = workbook.SheetNames[0]; // Read the first sheet
            this.sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
            return true;
    }

    private async generateQRCodeWithLogo(link: string, name: string, logoPath: string) {
        try {
            // Generate the QR code as a buffer
            const qrCodeBuffer = await QRCode.toBuffer(link, { 
                errorCorrectionLevel: 'H', // High error correction to allow for logo overlay
                width: 500,                 // Increase size to fit the logo better
            });
    
            // Load the generated QR code and the logo image
            const qrImage = await Jimp.read(qrCodeBuffer);
            const logo = await Jimp.read(logoPath);
    
            // Resize the logo to fit in the middle (e.g., 80x80 pixels)
            logo.resize(80, 80);
    
            // Calculate position for the logo (center)
            const xPos = (qrImage.bitmap.width / 2) - (logo.bitmap.width / 2);
            const yPos = (qrImage.bitmap.height / 2) - (logo.bitmap.height / 2);
    
            // Composite the logo onto the QR code
            qrImage.composite(logo, xPos, yPos);
    
            // Save the final image as PNG
            const outputFilePath = path.join(this.outputDir, `${name}.png`);
            await qrImage.writeAsync(outputFilePath);
    
            console.log(`QR Code for ${name} saved to ${outputFilePath}`);
        } catch (error) {
            console.error(`Error generating QR code for ${name}:`, error);
        }
    }
}
