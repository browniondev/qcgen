"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const express_validator_1 = require("express-validator");
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
class AuthController {
    static async register(req, res) {
        try {
            // Validation
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { email, password, firstName, lastName } = req.body;
            // Check if user already exists
            let user = await user_model_1.User.findOne({ email });
            if (user) {
                res.status(400).json({ message: "User already exists" });
                return;
            }
            // Create new user
            user = new user_model_1.User({
                email,
                password,
                firstName,
                lastName,
            });
            await user.save();
            // Generate JWT
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
                expiresIn: "24h",
            });
            res.status(201).json({
                message: "User registered successfully",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            });
        }
        catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
    static async login(req, res) {
        try {
            // Validation
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            console.log(req.body);
            const { email, password } = req.body;
            // Check if user exists
            const user = await user_model_1.User.findOne({ email });
            if (!user) {
                res.status(400).json({ message: "Invalid credentials" });
                return;
            }
            // Verify password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                res.status(400).json({ message: "Invalid credentials" });
                return;
            }
            // Generate JWT
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
                expiresIn: "24h",
            });
            res.json({
                message: "Logged in successfully",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            });
        }
        catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
    static async googleAuthCallback(req, res) {
        try {
            const user = req.user;
            // Generate JWT
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
                expiresIn: "24h",
            });
            // Redirect to client with token
            // In production, you might want to use a more secure method
            res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
            // res.redirect(`${CLIENT_URL}/`);
        }
        catch (error) {
            console.error("Google auth callback error:", error);
            res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
        }
    }
}
exports.AuthController = AuthController;
