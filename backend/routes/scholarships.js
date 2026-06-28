const express = require('express');
const router = express.Router();
const { Op, literal } = require('sequelize');
const { Scholarship, User, Notification } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');

// ─── GET /api/scholarships ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, category, state, course, provider, minAmount, maxAmount,
            page = 1, limit = 12, sortBy = 'deadline' } = req.query;

    const where = { isActive: true };
    if (category) where.category = category;
    if (provider) where.provider = { [Op.like]: `%${provider}%` };
    if (minAmount) where.amount = { ...where.amount, [Op.gte]: Number(minAmount) };
    if (maxAmount) where.amount = { ...where.amount, [Op.lte]: Number(maxAmount) };

    // Full-text search on name, provider, description
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { provider: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const sortMap = {
      deadline: [['deadline', 'ASC']],
      amount:   [['amount', 'DESC']],
      newest:   [['createdAt', 'DESC']],
      popular:  [['applicationsCount', 'DESC']],
    };
    const order = sortMap[sortBy] || [['deadline', 'ASC']];
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: scholarships } = await Scholarship.findAndCountAll({
      where, order, offset, limit: Number(limit),
    });

    // Post-filter by state/course (JSON array fields)
    const filtered = scholarships.filter(s => {
      if (state) {
        const states = s.eligibleStates || [];
        if (states.length > 0 && !states.some(st => st.toLowerCase().includes(state.toLowerCase()))) return false;
      }
      if (course) {
        const courses = s.eligibleCourses || [];
        if (courses.length > 0 && !courses.some(c => c.toLowerCase().includes(course.toLowerCase()))) return false;
      }
      return true;
    });

    res.json({ success: true, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)), scholarships: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/scholarships/featured ──────────────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const scholarships = await Scholarship.findAll({ where: { isActive: true, isFeatured: true }, limit: 6 });
    res.json({ success: true, scholarships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/scholarships/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['name'] }],
    });
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });
    await scholarship.increment('views');
    res.json({ success: true, scholarship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/scholarships ───────────────────────────────────────────────────
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const scholarship = await Scholarship.create({ ...req.body, createdBy: req.user.id });

    // Notify all students
    const students = await User.findAll({ where: { role: 'student', notificationsEnabled: true }, attributes: ['id'] });
    if (students.length) {
      await Notification.bulkCreate(students.map(s => ({
        recipientId: s.id,
        title: 'New Scholarship Available!',
        message: `${scholarship.name} by ${scholarship.provider} – ₹${Number(scholarship.amount).toLocaleString()}`,
        type: 'new_scholarship',
        scholarshipId: scholarship.id,
        link: `/scholarships/${scholarship.id}`,
      })));
    }
    res.status(201).json({ success: true, scholarship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/scholarships/:id ────────────────────────────────────────────────
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const scholarship = await Scholarship.findByPk(req.params.id);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });
    await scholarship.update(req.body);
    res.json({ success: true, scholarship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/scholarships/:id ────────────────────────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const scholarship = await Scholarship.findByPk(req.params.id);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });
    await scholarship.destroy();
    res.json({ success: true, message: 'Scholarship deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
