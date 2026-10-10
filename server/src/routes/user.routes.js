import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getMyNominations,
  getMyNominationById,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/user.controller.js";
import { protectUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// Protected user profile routes
router.get("/profile", protectUser, getUserProfile);
router.put("/profile", protectUser, updateUserProfile);

// Protected nominations routes for the user
router.get("/my-nominations", protectUser, getMyNominations);
router.get("/my-nominations/:id", protectUser, getMyNominationById);

export default router;
