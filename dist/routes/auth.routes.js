"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// Validation middleware
const registerValidation = [
    (0, express_validator_1.check)("email", "Please include a valid email").isEmail(),
    (0, express_validator_1.check)("password", "Password must be 6 or more characters").isLength({
        min: 6,
    }),
    (0, express_validator_1.check)("firstName", "First name is required").not().isEmpty(),
    (0, express_validator_1.check)("lastName", "Last name is required").not().isEmpty(),
];
const loginValidation = [
    (0, express_validator_1.check)("email", "Please include a valid email").isEmail(),
    (0, express_validator_1.check)("password", "Password is required").exists(),
];
// Routes
router.post("/register", registerValidation, auth_controller_1.AuthController.register);
router.post("/login", loginValidation, auth_controller_1.AuthController.login);
// Google OAuth routes
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
}));
router.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: "/login",
    session: false,
}), auth_controller_1.AuthController.googleAuthCallback);
exports.default = router;
