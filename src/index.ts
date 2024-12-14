import express from 'express';
import { QRCodeGenerator } from './qrgenerator.service';
const app = express();

app.get('/', (req, res) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});

app.get('/generate', (req, res) => {
  const generator = new QRCodeGenerator("C:/Users/hpath/Downloads/qrcode-generator/src/link.xlsx");
  res.send("success");
});

const port = parseInt(process.env.PORT || '5000');
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
