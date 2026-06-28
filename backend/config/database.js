const { Sequelize } = require('sequelize');
require('dotenv').config();

// ─── Parse MySQL URL or use individual env vars ───────────────────────────────
let sequelize;

if (process.env.MYSQL_URL) {
  sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
      ssl: false,
      connectTimeout: 60000,
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'scholarship_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
      dialectOptions: { connectTimeout: 60000 },
    }
  );
}

module.exports = sequelize;
