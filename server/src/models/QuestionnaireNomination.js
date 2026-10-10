import mongoose from 'mongoose';

const questionnaireNominationSchema = new mongoose.Schema(
  {
    // Questionnaire Branching Fields
    edition: {
      type: String,
      required: [true, 'Please select an edition'],
      enum: [
        'US Edition (18 Nov, Washington D.C., USA)',
        'UAE Edition (Dubai, UAE)',
        'India Edition (New Delhi, India)',
      ],
    },
    hasUSVisa: {
      type: String,
      enum: ['Yes', 'No', 'N/A'],
      default: 'N/A',
    },
    itrExceeded12L: {
      type: String,
      enum: ['Yes', 'No', 'N/A'],
      default: 'N/A',
    },
    agreedToFees: {
      type: Boolean,
      default: true,
      required: [true, 'Fee agreement is required'],
    },

    // Applicant Dossier Details
    applyType: {
      type: String,
      required: [true, 'Please select how you would like to apply'],
      enum: ['Individual', 'Organization', 'Both'],
    },
    nomineeName: {
      type: String,
      required: [true, 'Nominee Name is required'],
      trim: true,
    },
    organizationName: {
      type: String,
      trim: true,
      default: '',
    },

    // Organization Head / Owner
    headName: {
      type: String,
      required: [true, 'Organization Head/Owner name is required'],
      trim: true,
    },
    headNumber: {
      type: String,
      required: [true, 'Organization Head/Owner number is required'],
      trim: true,
    },
    headEmail: {
      type: String,
      required: [true, 'Organization Head/Owner email is required'],
      trim: true,
      lowercase: true,
    },

    // Primary Contact Person
    contactName: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact person number is required'],
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact person email is required'],
      trim: true,
      lowercase: true,
    },

    // Online & Location
    website: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },

    // Administrative & Workflow
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    adminRemark: {
      type: String,
      default: '',
    },
    adminName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('QuestionnaireNomination', questionnaireNominationSchema);
