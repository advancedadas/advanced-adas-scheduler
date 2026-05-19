import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Photo extends Model {}

Photo.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  originalName: { type: DataTypes.STRING(255), allowNull: false },
  filename: { type: DataTypes.STRING(255), allowNull: false },
  mimeType: { type: DataTypes.STRING(100), allowNull: false },
  size: { type: DataTypes.INTEGER, allowNull: false },
  url: { type: DataTypes.STRING(500), allowNull: false }
}, {
  sequelize,
  modelName: 'Photo',
  tableName: 'photos',
  timestamps: true
});
