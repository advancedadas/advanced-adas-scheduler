import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { User } from '../models/index.js';

const router = express.Router();

router.get('/employees', requireAuth, requireAdmin, async (_req, res) => {
  const employees = await User.findAll({ where: { role: 'employee', active: true }, order: [['name', 'ASC']] });
  res.json({ employees });
});

export default router;
