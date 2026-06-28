const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Application extends Model {}

Application.init({
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  studentId:    { type: DataTypes.INTEGER, allowNull: false },
  scholarshipId:{ type: DataTypes.INTEGER, allowNull: false },
  status:       { type: DataTypes.ENUM('applied','under_review','approved','rejected','withdrawn'), defaultValue: 'applied' },
  appliedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  notes:        { type: DataTypes.TEXT },
  documents:    { type: DataTypes.TEXT, defaultValue: '[]',
    get() { const v = this.getDataValue('documents'); try { return v ? JSON.parse(v) : []; } catch { return []; } },
    set(v) { this.setDataValue('documents', JSON.stringify(v || [])); }
  },
  adminRemarks: { type: DataTypes.TEXT },
  reviewedAt:   { type: DataTypes.DATE },
  reviewedBy:   { type: DataTypes.INTEGER },
}, {
  sequelize,
  modelName: 'Application',
  tableName: 'applications',
  timestamps: true,
  indexes: [
    // Prevent duplicate applications
    { unique: true, fields: ['studentId', 'scholarshipId'] },
  ],
});

module.exports = Application;
