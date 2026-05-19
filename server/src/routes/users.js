import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'role', 'color', 'active'],
    order: [['name', 'ASC']]
  });

  res.json(users);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, email, password, role, color, active = true } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password and role are required.' });
  }

  if (!['admin', 'employee'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  const existing = await User.findOne({ where: { email } });

  if (existing) {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash: hash,
    role,
    color: color || '#2563eb',
    active
  });

  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    color: user.color,
    active: user.active
  });
});

export default router;
