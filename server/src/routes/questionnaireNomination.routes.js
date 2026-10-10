import express from 'express';
import {
  submitQuestionnaireNomination,
  getQuestionnaireNominations,
  assignQuestionnaireNomination,
  updateQuestionnaireNominationStatus,
  updateQuestionnaireNomination,
  deleteQuestionnaireNomination,
} from '../controllers/questionnaireNomination.controller.js';
import { protectAdmin, requirePermission, optionalUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public submission (with optional user attachment)
router.post('/submit', optionalUser, submitQuestionnaireNomination);

// Protected Admin routes
router.get('/all', protectAdmin, requirePermission('questionnaireNominations'), getQuestionnaireNominations);
router.patch('/:id/assign', protectAdmin, assignQuestionnaireNomination);
router.patch('/:id/status', protectAdmin, requirePermission('questionnaireNominations'), updateQuestionnaireNominationStatus);
router.put('/:id', protectAdmin, requirePermission('questionnaireNominations'), updateQuestionnaireNomination);
router.delete('/:id', protectAdmin, requirePermission('questionnaireNominations'), deleteQuestionnaireNomination);

export default router;
