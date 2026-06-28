/**
 * Remote MySQL Seed Script — seeds FreeSQLDatabase.net
 * Run: node database/seed.remote.js
 */
process.env.MYSQL_URL = 'mysql://sql12831754:wY51UcbDBe@sql12.freesqldatabase.com:3306/sql12831754';
process.env.NODE_ENV = 'production';

const { sequelize, User, Scholarship, Notification } = require('../models/index');

const scholarshipsData = [
  { name: 'National Merit Scholarship', provider: 'Ministry of Education, India', description: 'Awarded to meritorious students from economically weaker sections.', amount: 12000, category: 'merit', eligibilityCriteria: 'Students with 80%+ in Class 10 from EWS families.', minPercentage: 80, maxAnnualIncome: 150000, eligibleCommunities: [], eligibleGenders: [], eligibleCourses: [], eligibleStates: [], deadline: new Date(Date.now() + 60*24*60*60*1000), applicationLink: 'https://scholarships.gov.in', requiredDocuments: ['Income Certificate','Class 10 Marksheet','Aadhaar Card'], isActive: true, isFeatured: true, tags: ['merit','central'] },
  { name: 'Post Matric Scholarship for SC Students', provider: 'Ministry of Social Justice', description: 'Financial assistance to SC students.', amount: 23000, category: 'government', eligibilityCriteria: 'SC students with income below 2.5 lakhs.', minPercentage: 0, maxAnnualIncome: 250000, eligibleCommunities: ['SC'], eligibleGenders: [], eligibleCourses: [], eligibleStates: [], deadline: new Date(Date.now() + 45*24*60*60*1000), applicationLink: 'https://scholarships.gov.in', requiredDocuments: ['Caste Certificate','Income Certificate','Marksheet'], isActive: true, isFeatured: true, tags: ['SC','government'] },
  { name: 'Begum Hazrat Mahal Scholarship', provider: 'Maulana Azad Education Foundation', description: 'For meritorious minority girls.', amount: 10000, category: 'minority', eligibilityCriteria: 'Minority girls with 50%+ marks, income below 2 lakhs.', minPercentage: 50, maxAnnualIncome: 200000, eligibleCommunities: ['Muslim','Christian','Sikh','Buddhist'], eligibleGenders: ['female'], eligibleCourses: [], eligibleStates: [], deadline: new Date(Date.now() + 30*24*60*60*1000), applicationLink: 'https://maef.net.in', requiredDocuments: ['Minority Certificate','Income Certificate'], isActive: true, isFeatured: false, tags: ['minority','girls'] },
  { name: 'Inspire Scholarship', provider: 'Department of Science & Technology', description: 'For Natural Sciences students.', amount: 80000, category: 'merit', eligibilityCriteria: 'Top 1% in Class 12, pursuing BSc/MSc.', minPercentage: 90, maxAnnualIncome: null, eligibleCommunities: [], eligibleGenders: [], eligibleCourses: ['BSc','MSc'], eligibleStates: [], deadline: new Date(Date.now() + 90*24*60*60*1000), applicationLink: 'https://online-inspire.gov.in', requiredDocuments: ['Class 12 Marksheet','Admission Letter'], isActive: true, isFeatured: true, tags: ['science','merit'] },
  { name: 'Tata Capital Pankh Scholarship', provider: 'Tata Capital', description: 'For underprivileged professional students.', amount: 50000, category: 'need-based', eligibilityCriteria: '60%+ marks, income below 4 lakhs.', minPercentage: 60, maxAnnualIncome: 400000, eligibleCommunities: [], eligibleGenders: [], eligibleCourses: ['B.Tech','MBBS','BBA'], eligibleStates: [], deadline: new Date(Date.now() + 75*24*60*60*1000), applicationLink: 'https://www.b4s.in/tatacapital/PKS', requiredDocuments: ['Income Certificate','Marksheet'], isActive: true, isFeatured: true, tags: ['private','professional'] },
  { name: 'Vidyasaarathi Scholarship', provider: 'NSDL e-Governance', description: 'For low-income technical students.', amount: 30000, category: 'need-based', eligibilityCriteria: '60%+ in Class 12, income below 3 lakhs.', minPercentage: 60, maxAnnualIncome: 300000, eligibleCommunities: [], eligibleGenders: [], eligibleCourses: ['B.Tech','Diploma','ITI'], eligibleStates: [], deadline: new Date(Date.now() + 50*24*60*60*1000), applicationLink: 'https://www.vidyasaarathi.co.in', requiredDocuments: ['Income Certificate','Class 12 Marksheet'], isActive: true, isFeatured: false, tags: ['technical','need-based'] },
  { name: 'AICTE Pragati Scholarship for Girls', provider: 'AICTE', description: 'For girls in technical education.', amount: 50000, category: 'government', eligibilityCriteria: 'Girl students, income below 8 lakhs.', minPercentage: 0, maxAnnualIncome: 800000, eligibleCommunities: [], eligibleGenders: ['female'], eligibleCourses: ['B.Tech','MBA','MCA'], eligibleStates: [], deadline: new Date(Date.now() + 40*24*60*60*1000), applicationLink: 'https://www.aicte-india.org', requiredDocuments: ['Income Certificate','Admission Letter'], isActive: true, isFeatured: true, tags: ['girls','technical'] },
  { name: 'Sitaram Jindal Foundation Scholarship', provider: 'Sitaram Jindal Foundation', description: 'Merit-cum-means scholarship.', amount: 24000, category: 'need-based', eligibilityCriteria: '55%+ marks, income below 2.5 lakhs.', minPercentage: 55, maxAnnualIncome: 250000, eligibleCommunities: [], eligibleGenders: [], eligibleCourses: [], eligibleStates: [], deadline: new Date(Date.now() + 20*24*60*60*1000), applicationLink: 'https://www.sitaramjindalfoundation.org', requiredDocuments: ['Income Certificate','Marksheet'], isActive: true, isFeatured: false, tags: ['private','need-based'] },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Remote MySQL connected');

    await sequelize.sync({ force: true });
    console.log('✅ Tables created on remote DB');

    const admin = await User.create({ name: 'Admin User', email: 'admin@scholarship.com', password: 'Admin@123', role: 'admin', isVerified: true });
    console.log('👤 Admin created');

    const student = await User.create({ name: 'Priya Sharma', email: 'student@scholarship.com', password: 'Student@123', role: 'student', isVerified: true, age: 20, gender: 'female', course: 'B.Tech', college: 'Anna University', state: 'Tamil Nadu', community: 'OBC', annualIncome: 180000, academicPercentage: 85, cgpa: 8.5 });
    console.log('👤 Student created');

    const scholarships = await Scholarship.bulkCreate(scholarshipsData.map(s => ({ ...s, createdBy: admin.id })));
    console.log(`🎓 ${scholarships.length} scholarships created`);

    await Notification.bulkCreate([
      { recipientId: student.id, title: 'Welcome to ScholarPath!', message: 'Complete your profile for personalized recommendations.', type: 'system' },
      { recipientId: student.id, title: 'New Scholarship Available', message: 'National Merit Scholarship is now open.', type: 'new_scholarship', scholarshipId: scholarships[0].id },
    ]);
    console.log('🔔 Notifications created');

    console.log('\n✅ Remote database seeded!');
    console.log('Admin:   admin@scholarship.com / Admin@123');
    console.log('Student: student@scholarship.com / Student@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
