import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import config from "../config/env.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: "30d",
  });
};

// @desc    Register new admin
// @route   POST /api/admin/signup
// @access  Public (protected by secret code)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, secretCode } = req.body;

    if (!name || !email || !password || !secretCode) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (secretCode !== config.adminSecretCode) {
      return res.status(401).json({ message: "Invalid Admin Secret Code" });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
    });

    if (admin) {
      const token = generateToken(admin._id);
      
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: config.env === "production",
        sameSite: config.env === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: token,
      });
    } else {
      res.status(400).json({ message: "Invalid admin data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      const token = generateToken(admin._id);

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: config.env === "production",
        sameSite: config.env === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role || "admin",
        permissions: admin.permissions || {},
        token: token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout admin / clear cookie
// @route   POST /api/admin/logout
// @access  Public
export const logoutAdmin = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "strict",
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get admin profile
// @route   GET /api/admin/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    if (admin) {
      if (!admin.role) admin.role = "admin";
      res.json(admin);
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// STAFF & PERMISSIONS MANAGEMENT (SUPERADMIN)
// ==========================================

// @desc    Get all staff members (excluding superadmins)
// @route   GET /api/admin/staff
// @access  Private/Admin
export const getStaffMembers = async (req, res) => {
  try {
    // Only return accounts with role: 'staff'
    const staff = await Admin.find({ role: "staff" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get assignable staff list for Nomination 'Assign To' dropdown (staff only)
// @route   GET /api/admin/staff/assignable
// @access  Private/Admin
export const getAssignableStaff = async (req, res) => {
  try {
    // Only active staff accounts are assignable
    const staff = await Admin.find({ role: "staff", status: { $ne: "inactive" } })
      .select("_id name email role")
      .sort({ name: 1 });
    res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new staff member with tab permissions
// @route   POST /api/admin/staff
// @access  Private/Admin
export const createStaffMember = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Admin.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "A staff account with this email already exists" });
    }

    const newStaff = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "staff",
      status: "active",
      permissions: permissions || {
        dashboard: true,
        nominations: true,
        nominationSettings: false,
        inquiries: false,
        awardCategories: false,
        awardEvents: false,
        blogs: false,
        gallery: false,
        settings: false,
        questionnaireNominations: false,
      },
    });

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: {
        _id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        status: newStaff.status,
        permissions: newStaff.permissions,
      },
    });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update staff tab permission matrix
// @route   PUT /api/admin/staff/:id/permissions
// @access  Private/Admin
export const updateStaffPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const staff = await Admin.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    staff.permissions = {
      ...staff.permissions,
      ...permissions,
    };

    await staff.save();

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
      data: {
        _id: staff._id,
        name: staff.name,
        permissions: staff.permissions,
      },
    });
  } catch (error) {
    console.error("Update permissions error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update staff member details (name, email, status, password)
// @route   PUT /api/admin/staff/:id
// @access  Private/Admin
export const updateStaffMember = async (req, res) => {
  try {
    const { name, email, status, password } = req.body;
    const staff = await Admin.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    if (name) staff.name = name.trim();
    if (email) staff.email = email.toLowerCase().trim();
    if (status) staff.status = status;
    if (password && password.length >= 6) {
      staff.password = password; // pre-save hook will hash
    }

    await staff.save();

    res.status(200).json({
      success: true,
      message: "Staff member details updated successfully",
      data: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        status: staff.status,
        permissions: staff.permissions,
      },
    });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a staff member
// @route   DELETE /api/admin/staff/:id
// @access  Private/Admin
export const deleteStaffMember = async (req, res) => {
  try {
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own administrator account" });
    }

    const staff = await Admin.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    await staff.deleteOne();

    res.status(200).json({
      success: true,
      message: "Staff member removed successfully",
    });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ message: error.message });
  }
};
