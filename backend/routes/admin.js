const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const { User, Scholarship, Application } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalStudents, totalScholarships, totalApplications, activeScholarships] = await Promise.all([
      User.count({ where: { role: 'student' } }),
      Scholarship.count(),
      Application.count(),
      Scholarship.count({ where: { isActive: true, deadline: { [Op.gte]: new Date() } } }),
    ]);

    // Applications by status
    const applicationsByStatus = await Application.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // Scholarships by category
    const scholarshipsByCategory = await Scholarship.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category'],
      raw: true,
    });

    // Monthly registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRegistrations = await User.findAll({
      attributes: [
        [fn('YEAR', col('createdAt')), 'year'],
        [fn('MONTH', col('createdAt')), 'month'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: sixMonthsAgo }, role: 'student' },
      group: [fn('YEAR', col('createdAt')), fn('MONTH', col('createdAt'))],
      order: [[fn('YEAR', col('createdAt')), 'ASC'], [fn('MONTH', col('createdAt')), 'ASC']],
      raw: true,
    });

    // Top scholarships by applications
    const topScholarships = await Application.findAll({
      attributes: ['scholarshipId', [fn('COUNT', col('Application.id')), 'count']],
      include: [{ model: Scholarship, as: 'scholarship', attributes: ['name'] }],
      group: ['scholarshipId', 'scholarship.id'],
      order: [[literal('count'), 'DESC']],
      limit: 5,
      raw: false,
    });

    res.json({
      success: true,
      stats: {
        totalStudents, totalScholarships, totalApplications, activeScholarships,
        applicationsByStatus: applicationsByStatus.map(r => ({ _id: r.status, count: Number(r.count) })),
        scholarshipsByCategory: scholarshipsByCategory.map(r => ({ _id: r.category, count: Number(r.count) })),
        monthlyRegistrations: monthlyRegistrations.map(r => ({ _id: { year: r.year, month: r.month }, count: Number(r.count) })),
        topScholarships: topScholarships.map(r => ({ name: r.scholarship?.name, count: Number(r.get('count')) })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = { role: 'student' };
    if (search) {
      where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }];
    }
    const { count: total, rows: users } = await User.findAndCountAll({
      where, order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit, limit: Number(limit),
    });
    res.json({ success: true, total, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
