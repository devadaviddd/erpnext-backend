import express from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { registerTrialPlan } from './register-trial-plan.js';
import { registerPremiumPlan } from './register-premium-plan.js';

const router = express.Router();
router.post('/trial', authMiddleware, registerTrialPlan);
router.post('/premium', authMiddleware, registerPremiumPlan);
export const userRouter = router;