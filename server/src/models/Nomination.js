import mongoose from 'mongoose';

const nominationSchema = new mongoose.Schema(
  {
    awardName: {
      type: String,
      required: [true, 'Award name is required'],
    },
    edition: {
      type: [String],
      required: [true, 'Edition is required'],
    },
    categoryPath: {
      type: [String],
      required: [true, 'Category classification is required'],
    },
    wantTo: {
      type: String,
      required: true,
    },
    registrationType: {
      type: String,
      enum: ['organisation', 'individual'],
      required: true,
    },
    nomineeName: {
      type: String,
      required: true,
      trim: true,
    },
    organizationName: {
      type: String,
      trim: true,
    },
    headName: {
      type: String,
      trim: true,
    },
    headDesignation: {
      type: String,
      trim: true,
    },
    headEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    headMobile: {
      type: String,
      trim: true,
    },
    contactName: {
      type: String,
      trim: true,
    },
    contactDesignation: {
      type: String,
      trim: true,
    },
    contactMobile: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    turnover: {
      type: String,
      trim: true,
    },
    streetAddress: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      // Will store either S3 URL or local path
    },
    referredBy: {
      type: String,
    },
    message: {
      type: String,
    },
    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      enum: [
        'NOMINATION RECEIVED',
        'UNDER EVALUATION',
        'IN PROGRESS (SHORTLISTED)',
        'SELECTED (WINNER)',
        'REJECTED',
      ],
      default: 'NOMINATION RECEIVED',
    },
    paymentStatus: {
      type: String,
      enum: ['not_paid', 'initial_paid', 'paid', 'not_interested'],
      default: 'not_paid',
    },
    amount: {
      type: String,
      trim: true,
    },
    adminName: {
      type: String,
      trim: true,
    },
    adminRemark: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Nomination = mongoose.model('Nomination', nominationSchema);

export default Nomination;
