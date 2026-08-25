import mongoose from 'mongoose';

const nominationFormSettingsSchema = new mongoose.Schema(
  {
    categories: [
      {
        categoryName: {
          type: String,
          required: true,
          trim: true
        },
        awards: [
          {
            type: String,
            trim: true
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

const NominationFormSettings = mongoose.model('NominationFormSettings', nominationFormSettingsSchema);

export default NominationFormSettings;
