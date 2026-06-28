const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Junction table for User ↔ Scholarship many-to-many saved relationship
class SavedScholarship extends Model {}

SavedScholarship.init({
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:       { type: DataTypes.INTEGER, allowNull: false },
  scholarshipId:{ type: DataTypes.INTEGER, allowNull: false },
}, {
  sequelize,
  modelName: 'SavedScholarship',
  tableName: 'saved_scholarships',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['userId', 'scholarshipId'] },
  ],
});

module.exports = SavedScholarship;
