const express = require('express');
const router = express.Router();
const { User, Scholarship, SavedScholarship } = require('../models/index');
const { protect } = require('../middleware/auth');

const STATE_ALIASES = { 'tamilnadu':'Tamil Nadu','tn':'Tamil Nadu','ap':'Andhra Pradesh','ka':'Karnataka','kl':'Kerala','mh':'Maharashtra','mp':'Madhya Pradesh','up':'Uttar Pradesh','wb':'West Bengal','dl':'Delhi','ts':'Telangana','rj':'Rajasthan','gj':'Gujarat','pb':'Punjab','hr':'Haryana','hp':'Himachal Pradesh','br':'Bihar','jh':'Jharkhand','od':'Odisha','as':'Assam','cg':'Chhattisgarh','la':'Ladakh','py':'Puducherry' };
const OFFICIAL_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry'];
const normalizeState = (input) => {
  if (!input) return input;
  const key = input.toLowerCase().trim().replace(/\s+/g,'');
  if (STATE_ALIASES[key]) return STATE_ALIASES[key];
  const direct = OFFICIAL_STATES.find(s => s.toLowerCase() === input.toLowerCase().trim());
  if (direct) return direct;
  return input;
};

// ─── GET /api/users/profile ───────────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Scholarship, as: 'savedScholarships', attributes: ['id','name','provider','amount','deadline'] }],
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name','age','gender','phone','course','college','state','community','annualIncome','academicPercentage','cgpa','avatar','preferredLanguage','notificationsEnabled'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (updates.state) updates.state = normalizeState(updates.state);
    if (updates.annualIncome !== undefined) {
      const inc = Number(updates.annualIncome);
      if (inc < 100000)      updates.incomeCategory = 'below_1L';
      else if (inc < 250000) updates.incomeCategory = '1L_2.5L';
      else if (inc < 500000) updates.incomeCategory = '2.5L_5L';
      else if (inc < 800000) updates.incomeCategory = '5L_8L';
      else                   updates.incomeCategory = 'above_8L';
    }
    const user = await User.findByPk(req.user.id);
    await user.update(updates);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/users/saved ─────────────────────────────────────────────────────
router.get('/saved', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Scholarship, as: 'savedScholarships', where: { isActive: true }, required: false }],
    });
    res.json({ success: true, savedScholarships: user.savedScholarships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/users/save/:id ─────────────────────────────────────────────────
router.post('/save/:id', protect, async (req, res) => {
  try {
    const existing = await SavedScholarship.findOne({ where: { userId: req.user.id, scholarshipId: req.params.id } });
    if (existing) return res.status(400).json({ success: false, message: 'Already saved' });
    await SavedScholarship.create({ userId: req.user.id, scholarshipId: req.params.id });
    res.json({ success: true, message: 'Scholarship saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/users/save/:id ───────────────────────────────────────────────
router.delete('/save/:id', protect, async (req, res) => {
  try {
    await SavedScholarship.destroy({ where: { userId: req.user.id, scholarshipId: req.params.id } });
    res.json({ success: true, message: 'Removed from saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/users/change-password ──────────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.scope('withPassword').findByPk(req.user.id);
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    await user.update({ password: newPassword });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
