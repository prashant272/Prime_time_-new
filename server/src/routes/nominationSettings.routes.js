import express from 'express';
import {
  getNominationSettings,
  updateNominationSettings
} from '../controllers/nominationSettings.controller.js';
import { protectAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getNominationSettings)
  .put(protectAdmin, updateNominationSettings);

export default router;
