import express from 'express';
import {
  submitNomination,
  getNominations,
  assignNomination,
  updateNominationStatus,
  updateNomination,
  deleteNomination,
} from '../controllers/nomination.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { protectAdmin, optionalUser, requirePermission } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public route for submitting a nomination (with optional user attachment if logged in)
// Multer middleware handles 'file' field upload
router.post('/submit', optionalUser, upload.single('file'), submitNomination);

// Protected Admin routes
router.get('/all', protectAdmin, requirePermission('nominations'), getNominations);
router.patch('/:id/assign', protectAdmin, assignNomination);
router.patch('/:id/status', protectAdmin, requirePermission('nominations'), updateNominationStatus);
router.put('/:id', protectAdmin, requirePermission('nominations'), updateNomination);
router.delete('/:id', protectAdmin, requirePermission('nominations'), deleteNomination);

export default router;
