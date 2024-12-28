import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { validationResult } from "express-validator";

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      // Create new user
      user = new User({
        email,
        password,
        firstName,
        lastName,
      });

      await user.save();

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
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
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
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
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
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
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async googleAuthCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "24h",
      });

      // Redirect to client with token
      // In production, you might want to use a more secure method
      res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error("Google auth callback error:", error);
      res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
    }
  }
}
