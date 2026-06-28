const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Scholarship extends Model {}

Scholarship.init({
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING(255), allowNull: false },
  provider:    { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  amount:      { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  category:    { type: DataTypes.ENUM('merit','need-based','minority','sports','disability','research','government','private','other'), allowNull: false },

  // ─── Eligibility ──────────────────────────────────────────────────────────
  eligibilityCriteria:  { type: DataTypes.TEXT },
  minPercentage:        { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  minCGPA:              { type: DataTypes.DECIMAL(4,2), defaultValue: 0 },
  maxAnnualIncome:      { type: DataTypes.DECIMAL(12,2), defaultValue: null },

  // Arrays stored as JSON in MySQL
  eligibleCommunities:  { type: DataTypes.JSON, defaultValue: [] },
  eligibleGenders:      { type: DataTypes.JSON, defaultValue: [] },
  eligibleCourses:      { type: DataTypes.JSON, defaultValue: [] },
  eligibleStates:       { type: DataTypes.JSON, defaultValue: [] },
  requiredDocuments:    { type: DataTypes.JSON, defaultValue: [] },
  tags:                 { type: DataTypes.JSON, defaultValue: [] },

  minAge: { type: DataTypes.INTEGER, defaultValue: 0 },
  maxAge: { type: DataTypes.INTEGER, defaultValue: 100 },

  // ─── Application Info ──────────────────────────────────────────────────────
  deadline:        { type: DataTypes.DATE, allowNull: false },
  applicationLink: { type: DataTypes.STRING(500) },

  // ─── Status ────────────────────────────────────────────────────────────────
  isActive:          { type: DataTypes.BOOLEAN, defaultValue: true },
  isFeatured:        { type: DataTypes.BOOLEAN, defaultValue: false },
  views:             { type: DataTypes.INTEGER, defaultValue: 0 },
  applicationsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  image:             { type: DataTypes.STRING(500) },
  createdBy:         { type: DataTypes.INTEGER },

}, {
  sequelize,
  modelName: 'Scholarship',
  tableName: 'scholarships',
  timestamps: true,
  indexes: [
    { type: 'FULLTEXT', fields: ['name', 'provider', 'description'] },
  ],
});

module.exports = Scholarship;
