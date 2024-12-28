import express from "express";
import passport from "passport";
import { AuthController } from "../controllers/auth.controller";
import { check } from "express-validator";

const router = express.Router();

// Validation middleware
const registerValidation = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password must be 6 or more characters").isLength({
    min: 6,
  }),
  check("firstName", "First name is required").not().isEmpty(),
  check("lastName", "Last name is required").not().isEmpty(),
];

const loginValidation = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
];

// Routes
router.post("/register", registerValidation, AuthController.register);
router.post("/login", loginValidation, AuthController.login);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  AuthController.googleAuthCallback
);

export default router;
