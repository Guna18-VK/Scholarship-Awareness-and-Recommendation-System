const express = require('express');
const router = express.Router();
const { Notification, Scholarship } = require('../models/index');
const { protect } = require('../middleware/auth');

// ─── GET /api/notifications ───────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { recipientId: req.user.id },
      include: [{ model: Scholarship, as: 'scholarship', attributes: ['id','name'], required: false }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    const unreadCount = await Notification.count({ where: { recipientId: req.user.id, isRead: false } });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/notifications/read-all ─────────────────────────────────────────
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { recipientId: req.user.id, isRead: false } });
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────────
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { id: req.params.id, recipientId: req.user.id } });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.destroy({ where: { id: req.params.id, recipientId: req.user.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
