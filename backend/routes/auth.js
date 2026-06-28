const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { protect } = require('../middleware/auth');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.create({ name, email, password, otp, otpExpiry });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      userId: user.id,
      devOtp: otp,
    });

    // Send email in background
    console.log(`📧 OTP for ${email}: ${otp}`);
    setImmediate(() => sendOTPEmail(email, otp));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    // Use unscoped to get otp and otpExpiry fields excluded by defaultScope
    const user = await User.unscoped().findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.otp !== String(otp) || user.otpExpiry < new Date())
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    await user.update({ isVerified: true, otp: null, otpExpiry: null });
    const token = signToken(user.id);
    res.json({ success: true, message: 'Email verified', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.unscoped().findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = generateOTP();
    await user.update({ otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) });
    console.log(`📧 OTP for ${user.email}: ${otp}`);
    setImmediate(() => sendOTPEmail(user.email, otp));
    res.json({ success: true, message: 'OTP resent', devOtp: otp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isVerified)
      return res.status(403).json({ success: false, message: 'Please verify your email first', userId: user.id });

    const token = signToken(user.id);
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.unscoped().findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });

    const otp = generateOTP();
    await user.update({ resetPasswordOtp: otp, resetPasswordOtpExpiry: new Date(Date.now() + 10 * 60 * 1000) });
    setImmediate(() => sendPasswordResetEmail(email, otp));
    res.json({ success: true, message: 'Password reset OTP sent', userId: user.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.unscoped().findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.resetPasswordOtp !== String(otp) || user.resetPasswordOtpExpiry < new Date())
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    await user.update({ password: newPassword, resetPasswordOtp: null, resetPasswordOtpExpiry: null });
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
