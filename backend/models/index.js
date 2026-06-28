const sequelize = require('../config/database');
const User = require('./User');
const Scholarship = require('./Scholarship');
const Application = require('./Application');
const Notification = require('./Notification');
const SavedScholarship = require('./SavedScholarship');

// ─── Associations ──────────────────────────────────────────────────────────────

// User creates many Scholarships
User.hasMany(Scholarship, { foreignKey: 'createdBy', as: 'createdScholarships' });
Scholarship.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User has many Applications
User.hasMany(Application, { foreignKey: 'studentId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

// Scholarship has many Applications
Scholarship.hasMany(Application, { foreignKey: 'scholarshipId', as: 'applications' });
Application.belongsTo(Scholarship, { foreignKey: 'scholarshipId', as: 'scholarship' });

// Application reviewed by admin User
User.hasMany(Application, { foreignKey: 'reviewedBy', as: 'reviewedApplications' });
Application.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// User saves many Scholarships (many-to-many via SavedScholarship)
User.belongsToMany(Scholarship, { through: SavedScholarship, foreignKey: 'userId', as: 'savedScholarships' });
Scholarship.belongsToMany(User, { through: SavedScholarship, foreignKey: 'scholarshipId', as: 'savedByUsers' });

// User receives many Notifications
User.hasMany(Notification, { foreignKey: 'recipientId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

// Scholarship can have many Notifications
Scholarship.hasMany(Notification, { foreignKey: 'scholarshipId', as: 'notifications' });
Notification.belongsTo(Scholarship, { foreignKey: 'scholarshipId', as: 'scholarship' });

module.exports = { sequelize, User, Scholarship, Application, Notification, SavedScholarship };
