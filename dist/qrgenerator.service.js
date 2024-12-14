"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeGenerator = void 0;
var fs = require('fs');
var path = require('path');
var xlsx = require('xlsx');
var QRCode = require('qrcode');
var Jimp = require('jimp');
/**
 * Class to generate QR codes from an Excel file.
 *
 * @param source - The path to the Excel file.
 * @param urlTag - The column header containing the URLs. Defaults to 'URL'.
 * @param nameTag - The column header containing the names. Defaults to 'Name'.
 */
var QRCodeGenerator = /** @class */ (function () {
    function QRCodeGenerator(source, urlTag, nameTag) {
        if (urlTag === void 0) { urlTag = 'LINK '; }
        if (nameTag === void 0) { nameTag = 'CODE '; }
        var _this = this;
        this.source = source;
        this.urlTag = urlTag;
        this.nameTag = nameTag;
        this.outputDir = './qrcodes';
        // Path to the Excel file and the logo image
        var logoFilePath = "C:/Users/hpath/Downloads/qrcode-generator/src/logo.jpeg"; // Path to your custom logo
        // Create the output directory if it doesn't exist
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir);
        }
        // Read the Excel file and generate QR codes
        if (this.readExcel()) {
            this.sheet.forEach(function (row) { return __awaiter(_this, void 0, void 0, function () {
                var link, name;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            link = row["".concat(this.urlTag)];
                            name = row["".concat(this.nameTag)];
                            if (!(link && name)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.generateQRCodeWithLogo(link, name, logoFilePath)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            console.error("Invalid data in row:", row);
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        }
    }
    QRCodeGenerator.prototype.readExcel = function () {
        // Read the Excel file
        var workbook = xlsx.readFile(this.source);
        var sheetName = workbook.SheetNames[0]; // Read the first sheet
        this.sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        return true;
    };
    QRCodeGenerator.prototype.generateQRCodeWithLogo = function (link, name, logoPath) {
        return __awaiter(this, void 0, void 0, function () {
            var qrCodeBuffer, qrImage, logo, xPos, yPos, outputFilePath, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, QRCode.toBuffer(link, {
                                errorCorrectionLevel: 'H', // High error correction to allow for logo overlay
                                width: 500, // Increase size to fit the logo better
                            })];
                    case 1:
                        qrCodeBuffer = _a.sent();
                        return [4 /*yield*/, Jimp.read(qrCodeBuffer)];
                    case 2:
                        qrImage = _a.sent();
                        return [4 /*yield*/, Jimp.read(logoPath)];
                    case 3:
                        logo = _a.sent();
                        // Resize the logo to fit in the middle (e.g., 80x80 pixels)
                        logo.resize(80, 80);
                        xPos = (qrImage.bitmap.width / 2) - (logo.bitmap.width / 2);
                        yPos = (qrImage.bitmap.height / 2) - (logo.bitmap.height / 2);
                        // Composite the logo onto the QR code
                        qrImage.composite(logo, xPos, yPos);
                        outputFilePath = path.join(this.outputDir, "".concat(name, ".png"));
                        return [4 /*yield*/, qrImage.writeAsync(outputFilePath)];
                    case 4:
                        _a.sent();
                        console.log("QR Code for ".concat(name, " saved to ").concat(outputFilePath));
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error("Error generating QR code for ".concat(name, ":"), error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return QRCodeGenerator;
}());
exports.QRCodeGenerator = QRCodeGenerator;
//# sourceMappingURL=qrgenerator.service.js.map