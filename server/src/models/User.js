import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

export class User extends Model {
  async verifyPassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }
}

User.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(180), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'employee'), allowNull: false, defaultValue: 'employee' },
  color: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '#64748b' },
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  defaultScope: { attributes: { exclude: ['passwordHash'] } },
  scopes: { withPassword: { attributes: {} } },
  hooks: {
    beforeCreate: async user => {
      if (user.passwordHash && !user.passwordHash.startsWith('$2')) user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
    },
    beforeUpdate: async user => {
      if (user.changed('passwordHash') && !user.passwordHash.startsWith('$2')) user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
    }
  }
});
