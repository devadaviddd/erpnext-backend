import express from 'express';
import { userRouter } from './user/index.js';
import { authRouter } from './auth/index.js';
import { schedulingExpiredPlan } from './scheduling-expired-plan.js';

const router = express.Router();
router.use('/user', userRouter);
router.use('/auth', authRouter);
router.get('/schedule-expired-plan', schedulingExpiredPlan);
export const applicationRouter = router;