// src/app.ts
import express from "express";
import qrRoutes from "./routes/qrRoutes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/qr", qrRoutes);

export default app;
