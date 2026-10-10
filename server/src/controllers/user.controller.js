import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Nomination from "../models/Nomination.js";
import QuestionnaireNomination from "../models/QuestionnaireNomination.js";
import config from "../config/env.js";
import { sendPasswordResetOtpEmail } from "../services/email.service.js";

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: "30d",
  });
};

// Helper for cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.env === "production",
  sameSite: config.env === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});

// Helper to build nomination matching query by email and/or phone
const buildNominationMatchingConditions = (userId, email, phone) => {
  const orConditions = [];

  if (userId) {
    orConditions.push({ user: userId });
  }

  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    orConditions.push({ contactEmail: cleanEmail });
    orConditions.push({ headEmail: cleanEmail });
  }

  if (phone) {
    const cleanPhone = phone.trim();
    orConditions.push({ contactMobile: cleanPhone });
    orConditions.push({ headMobile: cleanPhone });

    // Also match by trailing digits (e.g. 10 digits) to handle +91, spaces, dashes
    const digits = cleanPhone.replace(/\D/g, '');
    if (digits.length >= 7) {
      const lastDigits = digits.slice(-10);
      const phoneRegex = new RegExp(lastDigits + '$');
      orConditions.push({ contactMobile: { $regex: phoneRegex } });
      orConditions.push({ headMobile: { $regex: phoneRegex } });
    }
  }

  return orConditions;
};

// Helper to build questionnaire nomination matching query
const buildQuestionnaireMatchingConditions = (userId, email, phone) => {
  const orConditions = [];

  if (userId) {
    orConditions.push({ user: userId });
  }

  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    orConditions.push({ contactEmail: cleanEmail });
    orConditions.push({ headEmail: cleanEmail });
  }

  if (phone) {
    const cleanPhone = phone.trim();
    orConditions.push({ contactNumber: cleanPhone });
    orConditions.push({ headNumber: cleanPhone });

    const digits = cleanPhone.replace(/\D/g, '');
    if (digits.length >= 7) {
      const lastDigits = digits.slice(-10);
      const phoneRegex = new RegExp(lastDigits + '$');
      orConditions.push({ contactNumber: { $regex: phoneRegex } });
      orConditions.push({ headNumber: { $regex: phoneRegex } });
    }
  }

  return orConditions;
};

// Helper to link unlinked nominations & questionnaire nominations to user
const linkNominationsToUser = async (user) => {
  try {
    const orConditions = buildNominationMatchingConditions(null, user.email, user.phone);
    if (orConditions.length > 0) {
      await Nomination.updateMany(
        { $or: orConditions, user: null },
        { user: user._id }
      );
    }

    const qOrConditions = buildQuestionnaireMatchingConditions(null, user.email, user.phone);
    if (qOrConditions.length > 0) {
      await QuestionnaireNomination.updateMany(
        { $or: qOrConditions, user: null },
        { user: user._id }
      );
    }
  } catch (err) {
    console.warn("Error linking nominations:", err.message);
  }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // If phone is provided, check if already in use
    const cleanPhone = phone?.trim() || "";
    if (cleanPhone) {
      const phoneExists = await User.findOne({ phone: cleanPhone });
      if (phoneExists) {
        return res.status(400).json({ message: "An account with this phone number already exists" });
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: cleanPhone,
    });

    if (user) {
      // Automatically link previous nominations matching this email OR phone
      await linkNominationsToUser(user);

      const token = generateToken(user._id);
      res.cookie("user_jwt", token, getCookieOptions());

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          organization: user.organization,
          designation: user.designation,
          avatar: user.avatar,
          role: user.role,
          token,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid user registration data" });
    }
  } catch (error) {
    console.error("Register user error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token (Login via Email or Phone)
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.phone || "").trim();
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide email/phone and password" });
    }

    let user = null;

    if (identifier.includes("@")) {
      // Find by email
      user = await User.findOne({ email: identifier.toLowerCase() });
    } else {
      // Find by phone or phone suffix
      const digits = identifier.replace(/\D/g, "");
      if (digits.length >= 7) {
        const lastDigits = digits.slice(-10);
        const phoneRegex = new RegExp(lastDigits + "$");
        user = await User.findOne({
          $or: [{ phone: identifier }, { phone: phoneRegex }],
        });
      } else {
        user = await User.findOne({ phone: identifier });
      }
    }

    if (!user) {
      // Fallback try case-insensitive email match just in case
      user = await User.findOne({ email: identifier.toLowerCase() });
    }

    if (user && (await user.matchPassword(password))) {
      // Retroactively link nominations if any unlinked
      await linkNominationsToUser(user);

      const token = generateToken(user._id);
      res.cookie("user_jwt", token, getCookieOptions());

      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          organization: user.organization,
          designation: user.designation,
          avatar: user.avatar,
          role: user.role,
          token,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid email/phone or password" });
    }
  } catch (error) {
    console.error("Login user error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = async (req, res) => {
  res.cookie("user_jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (User)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (User)
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, phone, organization, designation, avatar, currentPassword, newPassword } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (organization !== undefined) user.organization = organization.trim();
    if (designation !== undefined) user.designation = designation.trim();
    if (avatar !== undefined) user.avatar = avatar;

    // Password change request
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new password" });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      user.password = newPassword;
    }

    const updatedUser = await user.save();

    // Re-link nominations if phone updated
    await linkNominationsToUser(updatedUser);

    const token = generateToken(updatedUser._id);

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        organization: updatedUser.organization,
        designation: updatedUser.designation,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        token,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's nominations (Matches User ID OR Email OR Phone Number from both standard & questionnaire submissions)
// @route   GET /api/users/my-nominations
// @access  Private (User)
export const getMyNominations = async (req, res) => {
  try {
    const orConditions = buildNominationMatchingConditions(
      req.user._id,
      req.user.email,
      req.user.phone
    );

    const standardNominations = await Nomination.find({
      $or: orConditions,
    }).sort({ createdAt: -1 });

    const qOrConditions = buildQuestionnaireMatchingConditions(
      req.user._id,
      req.user.email,
      req.user.phone
    );

    const questionnaireNominations = await QuestionnaireNomination.find({
      $or: qOrConditions,
    }).sort({ createdAt: -1 });

    // Format questionnaire nominations so they match standard nomination schema for the user dashboard
    const formattedQList = questionnaireNominations.map((q) => ({
      _id: q._id,
      nomineeName: q.nomineeName,
      organizationName: q.organizationName,
      awardName: q.edition,
      edition: [q.edition],
      categoryPath: ['Questionnaire Nomination', q.applyType],
      registrationType: q.applyType,
      status: q.status,
      paymentStatus: q.paymentStatus,
      city: q.city,
      state: q.state,
      country: q.country,
      headName: q.headName,
      headDesignation: 'Head / Owner',
      headMobile: q.headNumber,
      headEmail: q.headEmail,
      contactName: q.contactName,
      contactDesignation: 'Primary Contact',
      contactMobile: q.contactNumber,
      contactEmail: q.contactEmail,
      website: q.website,
      hasUSVisa: q.hasUSVisa,
      itrExceeded12L: q.itrExceeded12L,
      agreedToFees: q.agreedToFees,
      applyType: q.applyType,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      isQuestionnaire: true,
    }));

    const allNominations = [...standardNominations, ...formattedQList].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      count: allNominations.length,
      data: allNominations,
    });
  } catch (error) {
    console.error("Get my nominations error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single nomination detail for the user (Supports standard & questionnaire nominations)
// @route   GET /api/users/my-nominations/:id
// @access  Private (User)
export const getMyNominationById = async (req, res) => {
  try {
    let nomination = await Nomination.findById(req.params.id);
    let isQuestionnaire = false;

    if (!nomination) {
      const q = await QuestionnaireNomination.findById(req.params.id);
      if (q) {
        nomination = {
          _id: q._id,
          nomineeName: q.nomineeName,
          organizationName: q.organizationName,
          awardName: q.edition,
          edition: [q.edition],
          categoryPath: ['Questionnaire Nomination', q.applyType],
          registrationType: q.applyType,
          status: q.status,
          paymentStatus: q.paymentStatus,
          city: q.city,
          state: q.state,
          country: q.country,
          headName: q.headName,
          headDesignation: 'Head / Owner',
          headMobile: q.headNumber,
          headEmail: q.headEmail,
          contactName: q.contactName,
          contactDesignation: 'Primary Contact',
          contactMobile: q.contactNumber,
          contactEmail: q.contactEmail,
          website: q.website,
          hasUSVisa: q.hasUSVisa,
          itrExceeded12L: q.itrExceeded12L,
          agreedToFees: q.agreedToFees,
          applyType: q.applyType,
          user: q.user,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
          isQuestionnaire: true,
        };
        isQuestionnaire = true;
      }
    }

    if (!nomination) {
      return res.status(404).json({ message: "Nomination not found" });
    }

    const userEmail = req.user.email?.toLowerCase();
    const userPhone = req.user.phone?.trim();
    const userId = req.user._id.toString();

    // Check ownership by User ID, Email, or Phone
    let isOwner = false;

    if (nomination.user && nomination.user.toString() === userId) {
      isOwner = true;
    } else if (
      userEmail &&
      (nomination.contactEmail?.toLowerCase() === userEmail ||
        nomination.headEmail?.toLowerCase() === userEmail)
    ) {
      isOwner = true;
    } else if (userPhone) {
      const cleanDigits = userPhone.replace(/\D/g, "");
      const nomContactDigits = (nomination.contactMobile || "").replace(/\D/g, "");
      const nomHeadDigits = (nomination.headMobile || "").replace(/\D/g, "");

      if (
        nomination.contactMobile === userPhone ||
        nomination.headMobile === userPhone ||
        (cleanDigits.length >= 7 &&
          (nomContactDigits.endsWith(cleanDigits.slice(-10)) ||
            nomHeadDigits.endsWith(cleanDigits.slice(-10))))
      ) {
        isOwner = true;
      }
    }

    if (!isOwner) {
      return res.status(403).json({ message: "Not authorized to view this nomination" });
    }

    res.status(200).json({ success: true, data: nomination });
  } catch (error) {
    console.error("Get my nomination by id error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request Password Reset OTP
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide your registered email address" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email address" });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    // Send email via Brevo SMTP
    try {
      await sendPasswordResetOtpEmail(user.name, user.email, otp);
    } catch (mailError) {
      console.error("Failed to send OTP email:", mailError);
      return res.status(500).json({
        message: "Failed to dispatch verification email. Please check your connection and try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "A 6-digit verification code has been sent to your email address.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Password Reset OTP
// @route   POST /api/users/verify-otp
// @access  Public
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and 6-digit verification code are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== cleanOtp) {
      return res.status(400).json({ message: "Invalid verification code. Please check and try again." });
    }

    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
    }

    res.status(200).json({
      success: true,
      message: "Verification code verified successfully.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password with verified OTP
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, verification code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== cleanOtp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
    }

    // Set new password (pre-save hook will hash it with bcrypt)
    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message });
  }
};
