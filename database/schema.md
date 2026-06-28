# Database Schema – Scholarship Awareness and Recommendation System
## Database: MySQL (via Sequelize ORM)

---

## Tables

### 1. users
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | bcrypt hashed |
| role | ENUM('student','admin') | default: student |
| age | INT | |
| gender | ENUM('male','female','other') | |
| phone | VARCHAR(20) | |
| course | VARCHAR(100) | |
| college | VARCHAR(200) | |
| state | VARCHAR(100) | normalized |
| community | VARCHAR(50) | SC/ST/OBC/General etc |
| incomeCategory | ENUM | auto-set from annualIncome |
| annualIncome | DECIMAL(12,2) | |
| academicPercentage | DECIMAL(5,2) | |
| cgpa | DECIMAL(4,2) | |
| isVerified | BOOLEAN | default: false |
| otp | VARCHAR(6) | |
| otpExpiry | DATETIME | |
| resetPasswordOtp | VARCHAR(6) | |
| resetPasswordOtpExpiry | DATETIME | |
| preferredLanguage | VARCHAR(5) | en/hi/ta |
| notificationsEnabled | BOOLEAN | default: true |
| avatar | TEXT | |
| createdAt | DATETIME | |
| updatedAt | DATETIME | |

### 2. scholarships
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| name | VARCHAR(255) | NOT NULL, FULLTEXT |
| provider | VARCHAR(255) | NOT NULL, FULLTEXT |
| description | TEXT | FULLTEXT |
| amount | DECIMAL(12,2) | |
| category | ENUM | merit/need-based/minority/etc |
| eligibilityCriteria | TEXT | |
| minPercentage | DECIMAL(5,2) | |
| minCGPA | DECIMAL(4,2) | |
| maxAnnualIncome | DECIMAL(12,2) | NULL = no limit |
| eligibleCommunities | JSON | [] = all |
| eligibleGenders | JSON | [] = all |
| eligibleCourses | JSON | [] = all |
| eligibleStates | JSON | [] = all |
| requiredDocuments | JSON | |
| tags | JSON | |
| minAge | INT | |
| maxAge | INT | |
| deadline | DATETIME | |
| applicationLink | VARCHAR(500) | |
| isActive | BOOLEAN | |
| isFeatured | BOOLEAN | |
| views | INT | |
| applicationsCount | INT | |
| image | VARCHAR(500) | |
| createdBy | INT FK → users.id | |

### 3. applications
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| studentId | INT FK → users.id | |
| scholarshipId | INT FK → scholarships.id | |
| status | ENUM | applied/under_review/approved/rejected/withdrawn |
| appliedAt | DATETIME | |
| notes | TEXT | |
| documents | JSON | |
| adminRemarks | TEXT | |
| reviewedAt | DATETIME | |
| reviewedBy | INT FK → users.id | |
| UNIQUE | (studentId, scholarshipId) | prevents duplicates |

### 4. notifications
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| recipientId | INT FK → users.id | |
| title | VARCHAR(255) | |
| message | TEXT | |
| type | ENUM | deadline_reminder/new_scholarship/etc |
| isRead | BOOLEAN | default: false |
| link | VARCHAR(500) | |
| scholarshipId | INT FK → scholarships.id | nullable |

### 5. saved_scholarships (junction table)
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| userId | INT FK → users.id | |
| scholarshipId | INT FK → scholarships.id | |
| UNIQUE | (userId, scholarshipId) | |
