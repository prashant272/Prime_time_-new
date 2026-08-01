import express from 'express';
import {
  getGallery,
  updateGallery,
  uploadGalleryPhoto
} from '../controllers/gallery.controller.js';
import { protectAdmin } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Public Routes
router.get('/', getGallery);

// Protected Admin Routes
router.put('/', protectAdmin, updateGallery);
router.post('/upload', protectAdmin, upload.array('images', 20), uploadGalleryPhoto);

export default router;
