const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

class User extends Model {
  // Compare password
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Safe JSON output — exclude password
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.otp;
    delete values.otpExpiry;
    delete values.resetPasswordOtp;
    delete values.resetPasswordOtpExpiry;
    return values;
  }
}

User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  // ─── Basic Info ──────────────────────────────────────────────────────────
  name:     { type: DataTypes.STRING(100), allowNull: false },
  email:    { type: DataTypes.STRING(150), allowNull: false, unique: true,
              validate: { isEmail: true } },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role:     { type: DataTypes.ENUM('student', 'admin'), defaultValue: 'student' },

  // ─── Profile ─────────────────────────────────────────────────────────────
  age:                { type: DataTypes.INTEGER },
  gender:             { type: DataTypes.ENUM('male', 'female', 'other') },
  phone:              { type: DataTypes.STRING(20) },
  course:             { type: DataTypes.STRING(100) },
  college:            { type: DataTypes.STRING(200) },
  state:              { type: DataTypes.STRING(100) },
  community:          { type: DataTypes.STRING(50) },
  incomeCategory:     { type: DataTypes.ENUM('below_1L','1L_2.5L','2.5L_5L','5L_8L','above_8L') },
  annualIncome:       { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  academicPercentage: { type: DataTypes.DECIMAL(5,2) },
  cgpa:               { type: DataTypes.DECIMAL(4,2) },

  // ─── Auth ─────────────────────────────────────────────────────────────────
  isVerified:                { type: DataTypes.BOOLEAN, defaultValue: false },
  otp:                       { type: DataTypes.STRING(6) },
  otpExpiry:                 { type: DataTypes.DATE },
  resetPasswordOtp:          { type: DataTypes.STRING(6) },
  resetPasswordOtpExpiry:    { type: DataTypes.DATE },

  // ─── Preferences ─────────────────────────────────────────────────────────
  preferredLanguage:     { type: DataTypes.STRING(5), defaultValue: 'en' },
  notificationsEnabled:  { type: DataTypes.BOOLEAN, defaultValue: true },
  avatar:                { type: DataTypes.TEXT },

}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['password', 'otp', 'otpExpiry', 'resetPasswordOtp', 'resetPasswordOtpExpiry'] },
  },
  scopes: {
    withPassword: { attributes: {} }, // include everything
  },
  hooks: {
    // Hash password before create
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
      user.setIncomeCategory();
    },
    // Hash password before update if changed
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
      if (user.changed('annualIncome')) {
        user.setIncomeCategory();
      }
    },
  },
});

// Auto-set income category
User.prototype.setIncomeCategory = function () {
  const income = parseFloat(this.annualIncome) || 0;
  if (income < 100000)      this.incomeCategory = 'below_1L';
  else if (income < 250000) this.incomeCategory = '1L_2.5L';
  else if (income < 500000) this.incomeCategory = '2.5L_5L';
  else if (income < 800000) this.incomeCategory = '5L_8L';
  else                      this.incomeCategory = 'above_8L';
};

module.exports = User;
