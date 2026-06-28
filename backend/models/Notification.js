const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Notification extends Model {}

Notification.init({
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  recipientId:  { type: DataTypes.INTEGER, allowNull: false },
  title:        { type: DataTypes.STRING(255), allowNull: false },
  message:      { type: DataTypes.TEXT, allowNull: false },
  type:         { type: DataTypes.ENUM('deadline_reminder','new_scholarship','application_update','system','recommendation'), defaultValue: 'system' },
  isRead:       { type: DataTypes.BOOLEAN, defaultValue: false },
  link:         { type: DataTypes.STRING(500) },
  scholarshipId:{ type: DataTypes.INTEGER },
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications',
  timestamps: true,
});

module.exports = Notification;
