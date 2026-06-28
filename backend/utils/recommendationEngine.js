/**
 * Recommendation Engine — works with MySQL/Sequelize models
 * JSON array fields from MySQL are already parsed by Sequelize
 */

exports.checkEligibility = (student, scholarship) => {
  const reasons = [];
  let eligible = true;

  const communities = scholarship.eligibleCommunities || [];
  const genders     = scholarship.eligibleGenders || [];
  const courses     = scholarship.eligibleCourses || [];
  const states      = scholarship.eligibleStates || [];

  // Academic percentage
  if (scholarship.minPercentage > 0) {
    const score = parseFloat(student.academicPercentage) || 0;
    if (score < scholarship.minPercentage) {
      eligible = false;
      reasons.push(`Requires ${scholarship.minPercentage}% (you have ${score}%)`);
    }
  }

  // CGPA
  if (scholarship.minCGPA > 0) {
    const cgpa = parseFloat(student.cgpa) || 0;
    if (cgpa < scholarship.minCGPA) {
      eligible = false;
      reasons.push(`Requires CGPA ${scholarship.minCGPA} (you have ${cgpa})`);
    }
  }

  // Income
  if (scholarship.maxAnnualIncome) {
    const income = parseFloat(student.annualIncome) || 0;
    if (income > scholarship.maxAnnualIncome) {
      eligible = false;
      reasons.push(`Income limit ₹${Number(scholarship.maxAnnualIncome).toLocaleString()}`);
    }
  }

  // Community
  if (communities.length > 0) {
    if (!student.community || !communities.includes(student.community)) {
      eligible = false;
      reasons.push(`Only for: ${communities.join(', ')}`);
    }
  }

  // Gender
  if (genders.length > 0) {
    if (!student.gender || !genders.includes(student.gender)) {
      eligible = false;
      reasons.push(`Only for: ${genders.join(', ')}`);
    }
  }

  // Course
  if (courses.length > 0) {
    const match = courses.some(c => c.toLowerCase() === (student.course || '').toLowerCase());
    if (!match) {
      eligible = false;
      reasons.push(`Only for courses: ${courses.join(', ')}`);
    }
  }

  // State
  if (states.length > 0) {
    const match = states.some(s => s.toLowerCase() === (student.state || '').toLowerCase());
    if (!match) {
      eligible = false;
      reasons.push(`Only for states: ${states.join(', ')}`);
    }
  }

  // Age
  if (student.age) {
    const age = parseInt(student.age);
    if (age < (scholarship.minAge || 0) || age > (scholarship.maxAge || 100)) {
      eligible = false;
      reasons.push(`Age must be between ${scholarship.minAge || 0} and ${scholarship.maxAge || 100}`);
    }
  }

  return { eligible, reasons };
};

exports.scoreScholarship = (student, scholarship) => {
  const { eligible } = exports.checkEligibility(student, scholarship);
  if (!eligible) return -1;

  let score = 0;
  score += Math.min(Number(scholarship.amount) / 10000, 50);

  const daysLeft = Math.ceil((new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (daysLeft > 0 && daysLeft <= 30)  score += 20;
  else if (daysLeft <= 90)             score += 10;

  if (scholarship.isFeatured) score += 15;

  const communities = scholarship.eligibleCommunities || [];
  if (communities.includes(student.community)) score += 10;

  const states = scholarship.eligibleStates || [];
  if (states.includes(student.state)) score += 10;

  return score;
};
