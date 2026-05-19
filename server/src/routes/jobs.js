import express from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { uploadPhotos } from '../middleware/upload.js';
import { Job, User, Photo } from '../models/index.js';
import { persistUploadedPhoto } from '../services/storage.js';

const router = express.Router();

const jobSchema = z.object({
  shopName: z.string().min(1).max(180),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(4).max(8),
  job: z.string().min(1),
  assignedToId: z.string().uuid(),
  completed: z.boolean().optional()
});

function jobIncludes() {
  return [
    { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email', 'color'] },
    { model: Photo, as: 'photos' }
  ];
}

async function getAuthorizedJob(req, res, next) {
  const where = { id: req.params.id };
  if (req.user.role !== 'admin') where.assignedToId = req.user.id;
  const job = await Job.findOne({ where, include: jobIncludes() });
  if (!job) return res.status(404).json({ message: 'Job not found' });
  req.jobRecord = job;
  next();
}

router.get('/', requireAuth, async (req, res) => {
  const where = {};
  if (req.user.role !== 'admin') where.assignedToId = req.user.id;
  if (req.query.employeeId && req.user.role === 'admin') where.assignedToId = req.query.employeeId;
  if (req.query.status === 'completed') where.completed = true;
  if (req.query.status === 'pending') where.completed = false;
  if (req.query.startDate || req.query.endDate) {
    where.date = {};
    if (req.query.startDate) where.date[Op.gte] = req.query.startDate;
    if (req.query.endDate) where.date[Op.lte] = req.query.endDate;
  }
  const jobs = await Job.findAll({ where, include: jobIncludes(), order: [['date', 'ASC'], ['time', 'ASC']] });
  res.json({ jobs });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const parsed = jobSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid job payload', issues: parsed.error.issues });
  const employee = await User.findOne({ where: { id: parsed.data.assignedToId, role: 'employee', active: true } });
  if (!employee) return res.status(400).json({ message: 'Assigned employee not found' });
  const job = await Job.create({ ...parsed.data, createdById: req.user.id });
  const saved = await Job.findByPk(job.id, { include: jobIncludes() });
  res.status(201).json({ job: saved });
});

router.get('/:id', requireAuth, getAuthorizedJob, async (req, res) => res.json({ job: req.jobRecord }));

router.put('/:id', requireAuth, getAuthorizedJob, async (req, res) => {
  if (req.user.role !== 'admin') {
    const employeeSchema = z.object({ completed: z.boolean().optional() });
    const parsed = employeeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(403).json({ message: 'Employees can only update completion status' });
    const completed = parsed.data.completed ?? req.jobRecord.completed;
    await req.jobRecord.update({ completed, completedAt: completed ? new Date() : null });
  } else {
    const parsed = jobSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Invalid job payload', issues: parsed.error.issues });
    if (parsed.data.assignedToId) {
      const employee = await User.findOne({ where: { id: parsed.data.assignedToId, role: 'employee', active: true } });
      if (!employee) return res.status(400).json({ message: 'Assigned employee not found' });
    }
    const update = { ...parsed.data };
    if (Object.prototype.hasOwnProperty.call(update, 'completed')) update.completedAt = update.completed ? new Date() : null;
    await req.jobRecord.update(update);
  }
  const saved = await Job.findByPk(req.jobRecord.id, { include: jobIncludes() });
  res.json({ job: saved });
});

router.patch('/:id/complete', requireAuth, getAuthorizedJob, async (req, res) => {
  const completed = req.body.completed !== false;
  await req.jobRecord.update({ completed, completedAt: completed ? new Date() : null });
  const saved = await Job.findByPk(req.jobRecord.id, { include: jobIncludes() });
  res.json({ job: saved });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  await job.destroy();
  res.status(204).send();
});

router.post('/:id/photos', requireAuth, getAuthorizedJob, uploadPhotos.array('photos', 10), async (req, res) => {
  const photos = await Promise.all((req.files || []).map(async file => {
    const stored = await persistUploadedPhoto(file);
    return Photo.create({
      jobId: req.jobRecord.id,
      uploadedById: req.user.id,
      originalName: file.originalname,
      filename: stored.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: stored.url
    });
  }));
  res.status(201).json({ photos });
});

export default router;
