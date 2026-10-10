import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "admin",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    permissions: {
      dashboard: { type: Boolean, default: true },
      nominations: { type: Boolean, default: true },
      nominationSettings: { type: Boolean, default: false },
      inquiries: { type: Boolean, default: false },
      awardCategories: { type: Boolean, default: false },
      awardEvents: { type: Boolean, default: false },
      blogs: { type: Boolean, default: false },
      gallery: { type: Boolean, default: false },
      settings: { type: Boolean, default: false },
      questionnaireNominations: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
