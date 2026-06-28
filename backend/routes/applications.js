const express = require('express');
const router = express.Router();
const { Application, Scholarship, Notification, User } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');

// ─── POST /api/applications/:scholarshipId ────────────────────────────────────
router.post('/:scholarshipId', protect, async (req, res) => {
  try {
    const scholarship = await Scholarship.findByPk(req.params.scholarshipId);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });
    if (!scholarship.isActive) return res.status(400).json({ success: false, message: 'Scholarship is no longer active' });
    if (new Date(scholarship.deadline) < new Date()) return res.status(400).json({ success: false, message: 'Deadline has passed' });

    const existing = await Application.findOne({ where: { studentId: req.user.id, scholarshipId: req.params.scholarshipId } });
    if (existing) return res.status(400).json({ success: false, message: 'Already applied' });

    const application = await Application.create({ studentId: req.user.id, scholarshipId: req.params.scholarshipId, notes: req.body.notes });
    await scholarship.increment('applicationsCount');

    await Notification.create({
      recipientId: req.user.id,
      title: 'Application Submitted',
      message: `Your application for "${scholarship.name}" has been submitted.`,
      type: 'application_update',
      scholarshipId: scholarship.id,
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ success: false, message: 'Already applied' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/applications ────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? {} : { studentId: req.user.id };
    const applications = await Application.findAll({
      where,
      include: [
        { model: Scholarship, as: 'scholarship', attributes: ['id','name','provider','amount','deadline','category'] },
        { model: User, as: 'student', attributes: ['id','name','email'] },
      ],
      order: [['appliedAt', 'DESC']],
    });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/applications/:id/status ────────────────────────────────────────
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Scholarship, as: 'scholarship', attributes: ['id','name'] },
        { model: User, as: 'student', attributes: ['id','name','email'] },
      ],
    });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    await application.update({ status, adminRemarks, reviewedAt: new Date(), reviewedBy: req.user.id });

    await Notification.create({
      recipientId: application.student.id,
      title: 'Application Status Updated',
      message: `Your application for "${application.scholarship.name}" is now: ${status.replace('_',' ').toUpperCase()}`,
      type: 'application_update',
      scholarshipId: application.scholarship.id,
    });

    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/applications/:id ────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findOne({ where: { id: req.params.id, studentId: req.user.id } });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.status !== 'applied') return res.status(400).json({ success: false, message: 'Cannot withdraw at this stage' });
    await application.destroy();
    await Scholarship.findByPk(application.scholarshipId).then(s => s && s.decrement('applicationsCount'));
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
