import express from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getMe,
  getStaffMembers,
  getAssignableStaff,
  createStaffMember,
  updateStaffPermissions,
  updateStaffMember,
  deleteStaffMember,
} from "../controllers/admin.controller.js";
import { protectAdmin, requirePermission } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/me", protectAdmin, getMe);

// Staff & Permissions Management
router.get("/staff/assignable", protectAdmin, getAssignableStaff);
router.get("/staff", protectAdmin, requirePermission("settings"), getStaffMembers);
router.post("/staff", protectAdmin, requirePermission("settings"), createStaffMember);
router.put("/staff/:id/permissions", protectAdmin, requirePermission("settings"), updateStaffPermissions);
router.put("/staff/:id", protectAdmin, requirePermission("settings"), updateStaffMember);
router.delete("/staff/:id", protectAdmin, requirePermission("settings"), deleteStaffMember);

export default router;
