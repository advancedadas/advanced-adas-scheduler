import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Job extends Model {}

Job.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  shopName: { type: DataTypes.STRING(180), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.TIME, allowNull: false },
  job: { type: DataTypes.TEXT, allowNull: false },
  completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  completedAt: { type: DataTypes.DATE, allowNull: true }
}, {
  sequelize,
  modelName: 'Job',
  tableName: 'jobs',
  timestamps: true
});
