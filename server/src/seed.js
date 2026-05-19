import dotenv from 'dotenv';
import { sequelize } from './config/database.js';
import { User, Job } from './models/index.js';
import './models/index.js';

dotenv.config();

await sequelize.sync({ force: true });

const admin = await User.create({ name: 'Shane Smith', email: 'admin@advancedadas.com.au', passwordHash: 'Admin123!', role: 'admin', color: '#111827' });
const brett = await User.create({ name: 'Brett', email: 'brett@advancedadas.com.au', passwordHash: 'Employee123!', role: 'employee', color: '#dc2626' });
const tech = await User.create({ name: 'ADAS Technician', email: 'tech@advancedadas.com.au', passwordHash: 'Employee123!', role: 'employee', color: '#2563eb' });

await Job.bulkCreate([
  { shopName: 'Norwood Panel Works', date: '2026-05-20', time: '09:00', job: 'Front radar calibration and documentation photos', assignedToId: brett.id, createdById: admin.id },
  { shopName: 'Auto Transformers', date: '2026-05-20', time: '13:30', job: 'Windscreen camera calibration', assignedToId: tech.id, createdById: admin.id },
  { shopName: 'Athol Park Workshop', date: '2026-05-21', time: '10:00', job: 'Blind spot monitor calibration', assignedToId: brett.id, createdById: admin.id, completed: true, completedAt: new Date() }
]);

console.log('Database seeded.');
await sequelize.close();
