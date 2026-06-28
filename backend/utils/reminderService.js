const { Op } = require('sequelize');
const { Scholarship, SavedScholarship, User, Notification } = require('../models/index');
const { sendDeadlineReminderEmail } = require('./emailService');

exports.sendDeadlineReminders = async () => {
  const today = new Date();

  for (const days of [1, 3, 7]) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + days);
    const start = new Date(targetDate.setHours(0, 0, 0, 0));
    const end = new Date(targetDate.setHours(23, 59, 59, 999));

    const scholarships = await Scholarship.findAll({
      where: { deadline: { [Op.between]: [start, end] }, isActive: true },
    });

    for (const scholarship of scholarships) {
      // Find users who saved this scholarship
      const saved = await SavedScholarship.findAll({ where: { scholarshipId: scholarship.id } });
      const userIds = saved.map(s => s.userId);
      const users = await User.findAll({ where: { id: userIds, notificationsEnabled: true } });

      for (const user of users) {
        await Notification.create({
          recipientId: user.id,
          title: 'Scholarship Deadline Reminder',
          message: `${scholarship.name} deadline is in ${days} day(s)!`,
          type: 'deadline_reminder',
          scholarshipId: scholarship.id,
          link: `/scholarships/${scholarship.id}`,
        });
        try {
          await sendDeadlineReminderEmail(user.email, scholarship.name, scholarship.deadline, days);
        } catch (err) {
          console.error(`Failed email to ${user.email}:`, err.message);
        }
      }
    }
  }
};
