import express from 'express';
import { z } from 'zod';
import { User } from '../models/index.js';
import { signToken } from '../utils/tokens.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid login payload' });

  const user = await User.scope('withPassword').findOne({ where: { email: parsed.data.email.toLowerCase(), active: true } });
  if (!user || !(await user.verifyPassword(parsed.data.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, color: user.color } });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json({ user });
});

export default router;
