import express from 'express';
import { Op } from 'sequelize';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { Job, User, Photo } from '../models/index.js';

const router = express.Router();

router.get('/overview', requireAuth, requireAdmin, async (req, res) => {
  const where = {};
  if (req.query.employeeId) where.assignedToId = req.query.employeeId;
  if (req.query.status === 'completed') where.completed = true;
  if (req.query.status === 'pending') where.completed = false;
  if (req.query.startDate || req.query.endDate) {
    where.date = {};
    if (req.query.startDate) where.date[Op.gte] = req.query.startDate;
    if (req.query.endDate) where.date[Op.lte] = req.query.endDate;
  }
  const jobs = await Job.findAll({
    where,
    include: [
      { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email', 'color'] },
      { model: Photo, as: 'photos' }
    ],
    order: [['date', 'ASC'], ['time', 'ASC']]
  });
  res.json({
    totals: {
      scheduled: jobs.length,
      completed: jobs.filter(j => j.completed).length,
      pending: jobs.filter(j => !j.completed).length
    },
    jobs
  });
});

export default router;
