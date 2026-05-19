import { User } from './User.js';
import { Job } from './Job.js';
import { Photo } from './Photo.js';

User.hasMany(Job, { foreignKey: { name: 'assignedToId', allowNull: false }, as: 'assignedJobs' });
Job.belongsTo(User, { foreignKey: { name: 'assignedToId', allowNull: false }, as: 'assignedTo' });

User.hasMany(Job, { foreignKey: { name: 'createdById', allowNull: false }, as: 'createdJobs' });
Job.belongsTo(User, { foreignKey: { name: 'createdById', allowNull: false }, as: 'createdBy' });

Job.hasMany(Photo, { foreignKey: { name: 'jobId', allowNull: false }, as: 'photos', onDelete: 'CASCADE' });
Photo.belongsTo(Job, { foreignKey: { name: 'jobId', allowNull: false }, as: 'job' });

User.hasMany(Photo, { foreignKey: { name: 'uploadedById', allowNull: false }, as: 'uploadedPhotos' });
Photo.belongsTo(User, { foreignKey: { name: 'uploadedById', allowNull: false }, as: 'uploadedBy' });

export { User, Job, Photo };
