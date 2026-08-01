import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  reels: {
    type: [String],
    default: []
  },
  videos: {
    type: [String],
    default: []
  },
  photos: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);
