import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import config from "../config/env.js";

export const protectAdmin = async (req, res, next) => {
  let token;

  // Read JWT from the 'jwt' cookie or Authorization header
  token = req.cookies.jwt;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);

      req.admin = await Admin.findById(decoded.id).select("-password");

      if (!req.admin) {
        return res.status(401).json({ message: "Not authorized as admin" });
      }

      if (req.admin.status === "inactive") {
        return res.status(403).json({ message: "Your staff account has been deactivated. Please contact administrator." });
      }

      // Ensure legacy admins default to admin (superadmin)
      if (!req.admin.role) {
        req.admin.role = "admin";
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

/**
 * Middleware to check specific module tab permissions for staff members
 * @param {string} moduleKey - e.g. 'nominations', 'blogs', 'gallery'
 */
export const requirePermission = (moduleKey) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Not authorized as admin" });
    }
    // 'admin' role (acting as superadmin) bypasses all permission checks
    if (req.admin.role === "admin" || req.admin.role === "superadmin") {
      return next();
    }
    // Staff members must have the specific tab permission set to true
    if (req.admin.permissions && req.admin.permissions[moduleKey] === true) {
      return next();
    }
    return res.status(403).json({
      message: `Access denied: You do not have permission to access the ${moduleKey} module`,
    });
  };
};

export const protectUser = async (req, res, next) => {
  let token;

  token = req.cookies.user_jwt || req.cookies.jwt;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found or session expired" });
      }

      next();
    } catch (error) {
      console.error("User auth failed:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, please log in" });
  }
};

// Optional user middleware: if token is present, attaches user; does not reject if absent
export const optionalUser = async (req, res, next) => {
  let token;

  token = req.cookies.user_jwt || req.cookies.jwt;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Ignored for optional auth
    }
  }
  next();
};
