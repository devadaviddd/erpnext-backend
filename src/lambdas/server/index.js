import express from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { configSite } from './config-site.js';

const router = express.Router();
router.post('/config-site', authMiddleware, configSite);

export const serverRouter = router;