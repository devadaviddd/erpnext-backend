import express from 'express';
import { userRouter } from './user/index.js';
import { authRouter } from './auth/index.js';

const router = express.Router();
router.use('/user', userRouter);
router.use('/auth', authRouter);
export const applicationRouter = router;