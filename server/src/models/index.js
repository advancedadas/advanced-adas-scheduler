import { User } from './User.js';
import { Job } from './Job.js';
import { Photo } from './Photo.js';

User.hasMany(Job, {
  foreignKey: { name: 'assignedToId', field: 'assigned_to_id', allowNull: false },
  as: 'assignedJobs'
});
Job.belongsTo(User, {
  foreignKey: { name: 'assignedToId', field: 'assigned_to_id', allowNull: false },
  as: 'assignedTo'
});

User.hasMany(Job, {
  foreignKey: { name: 'createdById', field: 'created_by_id', allowNull: false },
  as: 'createdJobs'
});
Job.belongsTo(User, {
  foreignKey: { name: 'createdById', field: 'created_by_id', allowNull: false },
  as: 'createdBy'
});

Job.hasMany(Photo, {
  foreignKey: { name: 'jobId', field: 'job_id', allowNull: false },
  as: 'photos',
  onDelete: 'CASCADE'
});
Photo.belongsTo(Job, {
  foreignKey: { name: 'jobId', field: 'job_id', allowNull: false },
  as: 'job'
});

User.hasMany(Photo, {
  foreignKey: { name: 'uploadedById', field: 'uploaded_by_id', allowNull: false },
  as: 'uploadedPhotos'
});
Photo.belongsTo(User, {
  foreignKey: { name: 'uploadedById', field: 'uploaded_by_id', allowNull: false },
  as: 'uploadedBy'
});

export { User, Job, Photo };
