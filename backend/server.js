const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

const clientUrl = (process.env.CLIENT_URL || '').trim().replace(/[\r\n]/g, '');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === 'http://localhost:3000' ||
      origin === clientUrl ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) return callback(null, true);
    return callback(null, true); // allow all in free tier
  },
  credentials: true,
}));

// ─── Health Check (before rate limiter) ───────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date(), env: process.env.NODE_ENV, db: 'mysql', version: '3.0' }));
app.get('/', (req, res) => res.json({ message: 'ScholarPath API running', status: 'OK', db: 'mysql', version: '3.0' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests' } }));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Database Connect & Sync ──────────────────────────────────────────────────
const { sequelize } = require('./models/index');

sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL connected');
    // sync tables — alter:true updates schema without dropping data
    return sequelize.sync({ alter: true });
  })
  .then(() => console.log('✅ MySQL tables synced'))
  .catch(err => { console.error('❌ MySQL connection error:', err.message); process.exit(1); });

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/users',           require('./routes/users'));
app.use('/api/scholarships',    require('./routes/scholarships'));
app.use('/api/applications',    require('./routes/applications'));
app.use('/api/notifications',   require('./routes/notifications'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/admin',           require('./routes/admin'));
app.use('/api/chatbot',         require('./routes/chatbot'));
app.use('/api/pdf',             require('./routes/pdf'));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ─── Cron: Deadline Reminders at 8 AM ────────────────────────────────────────
cron.schedule('0 8 * * *', async () => {
  try {
    const { sendDeadlineReminders } = require('./utils/reminderService');
    await sendDeadlineReminders();
    console.log('✅ Deadline reminders sent');
  } catch (err) {
    console.error('❌ Cron error:', err.message);
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: MySQL`);
});
