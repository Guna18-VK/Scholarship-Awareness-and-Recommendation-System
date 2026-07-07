# 🎓 ScholarPath — Scholarship Awareness and Recommendation System

<div align="center">

![ScholarPath Banner](https://img.shields.io/badge/ScholarPath-Scholarship%20System-4f46e5?style=for-the-badge&logo=graduation-cap)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://scholarpath.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://scholarpath-backend-5f2o.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Guna18-VK/Scholarship-Awareness-and-Recommendation-System)

**A modern full-stack web application that helps students discover, filter, and apply for scholarships with personalized AI-powered recommendations.**

</div>

---

## 🌐 Live Links

| Service | URL |
|---------|-----|
| 🌐 Frontend | https://scholarpath.vercel.app |
| ⚙️ Backend API | https://scholarpath-backend-5f2o.onrender.com |
| 🏥 Health Check | https://scholarpath-backend-5f2o.onrender.com/api/health |
| 📦 GitHub | https://github.com/Guna18-VK/Scholarship-Awareness-and-Recommendation-System |

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | admin@scholarship.com | Admin@123 |
| 🎓 Student | student@scholarship.com | Student@123 |

---

## 📸 Features

### 👨‍🎓 Student Features
- ✅ Register with email OTP verification
- ✅ Login with saved email suggestions
- ✅ Smart profile with completion tracker
- ✅ Personalized scholarship recommendations
- ✅ Eligibility checking (auto-match)
- ✅ Apply, Save & Track scholarships
- ✅ Deadline reminders (1/3/7 days)
- ✅ Bell notifications
- ✅ Download PDF of scholarship details
- ✅ AI chatbot for guidance
- ✅ Voice input support (Web Speech API)
- ✅ Dark / Light mode toggle
- ✅ Multi-language: English / Hindi / Tamil

### 🛡️ Admin Features
- ✅ Dashboard with analytics charts
- ✅ Add / Edit / Delete scholarships
- ✅ Manage all student applications
- ✅ Update application status
- ✅ View all registered students
- ✅ Real-time statistics

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 18, React Router v6, Recharts, jsPDF |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (Sequelize ORM) |
| **Auth** | JWT + OTP Email Verification |
| **Email** | Nodemailer (Gmail SMTP) |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Render |
| **Cloud Database** | FreeSQLDatabase.net |

---

## 📁 Project Structure

```
Scholarship-Awareness-and-Recommendation-System/
│
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── database.js         # MySQL/Sequelize connection
│   ├── models/
│   │   ├── index.js            # All model associations
│   │   ├── User.js
│   │   ├── Scholarship.js
│   │   ├── Application.js
│   │   ├── Notification.js
│   │   └── SavedScholarship.js
│   ├── routes/
│   │   ├── auth.js             # Register, Login, OTP, Reset
│   │   ├── scholarships.js     # CRUD scholarships
│   │   ├── users.js            # Profile management
│   │   ├── applications.js     # Apply & track
│   │   ├── recommendations.js  # Smart eligibility matching
│   │   ├── notifications.js    # Bell notifications
│   │   ├── admin.js            # Admin stats & management
│   │   ├── chatbot.js          # AI chatbot
│   │   └── pdf.js              # PDF generation
│   ├── middleware/
│   │   └── auth.js             # JWT protect + role authorize
│   ├── utils/
│   │   ├── emailService.js     # OTP & reminder emails
│   │   ├── recommendationEngine.js  # Eligibility checker
│   │   └── reminderService.js  # Cron deadline reminders
│   ├── database/
│   │   ├── seed.js             # Local database seed
│   │   └── seed.remote.js      # Remote MySQL seed
│   └── server.js               # Express entry point
│
├── frontend/                   # React.js application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Sidebar
│   │   │   ├── common/         # StateInput, Guards
│   │   │   ├── scholarships/   # ScholarshipCard
│   │   │   └── chatbot/        # AI chatbot widget
│   │   ├── context/
│   │   │   ├── AuthContext.js  # Global auth state
│   │   │   └── ThemeContext.js # Dark/light mode
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── ScholarshipsPage.js
│   │   │   ├── ScholarshipDetailPage.js
│   │   │   └── ProfilePage.js
│   │   ├── services/
│   │   │   └── api.js          # Axios instance
│   │   └── utils/
│   │       ├── keepAlive.js    # Render cold start prevention
│   │       ├── savedEmails.js  # Login email suggestions
│   │       └── normalizeState.js # State name normalization
│   └── package.json
│
└── database/
    └── schema.md               # MySQL table documentation
```

---

## 🗄️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `users` | Students and admins |
| `scholarships` | Scholarship listings |
| `applications` | Student applications |
| `notifications` | User notifications |
| `saved_scholarships` | Bookmarked scholarships |

---

## 🔌 API Reference

### Authentication
```
POST /api/auth/register       Register new user
POST /api/auth/verify-otp     Verify email OTP
POST /api/auth/resend-otp     Resend OTP
POST /api/auth/login          Login
POST /api/auth/forgot-password Send reset OTP
POST /api/auth/reset-password  Reset password
GET  /api/auth/me             Get current user
```

### Scholarships
```
GET    /api/scholarships          List with filters
GET    /api/scholarships/featured Featured scholarships
GET    /api/scholarships/:id      Single scholarship
POST   /api/scholarships          Create (admin only)
PUT    /api/scholarships/:id      Update (admin only)
DELETE /api/scholarships/:id      Delete (admin only)
```

### Other Endpoints
```
GET  /api/recommendations         Personalized matches
GET  /api/users/profile           Get profile
PUT  /api/users/profile           Update profile
POST /api/applications/:id        Apply for scholarship
GET  /api/notifications           Get notifications
GET  /api/admin/stats             Dashboard statistics
POST /api/chatbot/message         AI chatbot
GET  /api/pdf/scholarship/:id     Download PDF
GET  /api/health                  Health check
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js >= 16
- MySQL 8.x
- npm

### Step 1 — Clone the Repository
```bash
git clone https://github.com/Guna18-VK/Scholarship-Awareness-and-Recommendation-System.git
cd Scholarship-Awareness-and-Recommendation-System
```

### Step 2 — Setup MySQL Database
```sql
mysql -u root -p
CREATE DATABASE scholarship_db;
EXIT;
```

### Step 3 — Configure Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=scholarship_db
DB_USER=root
DB_PASS=your_mysql_password
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:3000
```

### Step 4 — Seed the Database
```bash
npm run seed
```

Output:
```
✅ MySQL connected
✅ Tables created
👤 Admin: admin@scholarship.com / Admin@123
👤 Student: student@scholarship.com / Student@123
🎓 8 scholarships created
✅ Database seeded successfully!
```

### Step 5 — Start Backend
```bash
npm run dev
# Server running on http://localhost:5000
```

### Step 6 — Start Frontend
```bash
cd ../frontend
npm install
npm start
# App running on http://localhost:3000
```

---

## 🌍 Production Deployment

### Backend (Render)
1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repo
3. Settings:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `node server.js`
4. Add environment variables (see `.env` above, use `MYSQL_URL` for cloud DB)

### Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo
3. Settings:
   - Root Directory: `frontend`
   - Framework: Create React App
4. Add env variable: `REACT_APP_API_URL=https://your-render-url.onrender.com/api`

### Cloud MySQL (FreeSQLDatabase.net)
1. Sign up at [freesqldatabase.com](https://www.freesqldatabase.com)
2. Create database → copy credentials
3. Set `MYSQL_URL=mysql://user:pass@host:3306/dbname` on Render

---

## 📦 Sample Scholarships

| Scholarship | Amount | Category |
|-------------|--------|----------|
| National Merit Scholarship | ₹12,000 | Merit |
| Post Matric SC Scholarship | ₹23,000 | Government |
| Begum Hazrat Mahal | ₹10,000 | Minority |
| Inspire Scholarship | ₹80,000 | Merit |
| Tata Capital Pankh | ₹50,000 | Need-based |
| Vidyasaarathi | ₹30,000 | Need-based |
| AICTE Pragati (Girls) | ₹50,000 | Government |
| Sitaram Jindal | ₹24,000 | Need-based |

---

## 🛡️ Security Features

- JWT authentication with expiry
- Password hashing with bcrypt (12 rounds)
- OTP-based email verification
- Rate limiting (200 req/15min)
- Helmet.js security headers
- CORS protection
- Input validation

---

## 👨‍💻 Developer

**Gunaseelan**
- GitHub: [@Guna18-VK](https://github.com/Guna18-VK)
- Email: gunaseelan932006@gmail.com

---

## 📄 License

This project is built for educational purposes.

---

<div align="center">
Made with ❤️ for students across India
</div>
