import express from 'express';
import { createUser } from './create-user.js';

const router = express.Router();
router.post('/', createUser);
export const userRouter = router;