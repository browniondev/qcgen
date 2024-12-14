"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var qrgenerator_service_1 = require("./qrgenerator.service");
var app = (0, express_1.default)();
app.get('/', function (req, res) {
    var name = process.env.NAME || 'World';
    res.send("Hello ".concat(name, "!"));
});
app.get('/generate', function (req, res) {
    var generator = new qrgenerator_service_1.QRCodeGenerator("C:/Users/hpath/Downloads/qrcode-generator/src/link.xlsx");
    res.send("success");
});
var port = parseInt(process.env.PORT || '5000');
app.listen(port, function () {
    console.log("listening on port ".concat(port));
});
//# sourceMappingURL=index.js.map