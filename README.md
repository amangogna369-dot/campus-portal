# 🎓 Campus News Portal - BCA Minor Project

A full-stack, production-grade digital journalism and varsity media platform built as a Bachelor of Computer Applications (BCA) Minor Project.

---

## 🌟 Overview

The **Campus News Portal** provides an institutional media hub where students, faculty, and university administrators publish, discover, moderate, and interact with campus news, workshops, official circulars, student club initiatives, sports tournaments, and placement drives.

### Key Capabilities:
- **Real-Time News Beats:** Campus News, Events & Workshops, Student Activities, Announcements, Achievements, Clubs & Societies, Sports, Cultural, Placements, and Spotlight Interviews.
- **Role-Based Workflows:** Distinct privileges for **Student**, **Faculty**, and **Administrator**.
- **Editorial Approval Pipeline:** Student/faculty stories are queued in `pending` state; Administrators can review, approve, publish, or reject with custom editorial feedback notes.
- **Smart Editorial AI:** Integrated **Google Gemini 3.8 Flash** engine generating headlines, executive summaries, tags, proofreading, and SEO metadata.
- **Interactions & Community:** Real-time story likes, bookmarks list, threaded article discussions, and email newsletter subscriptions.
- **Urgent Broadcast System:** Pinned high-priority circulars with PDF attachment simulator and live ticker alerts.
- **Admin Control Center:** System dashboard metrics, beat breakdown charts, user permission management, audit trail logs, and one-click database re-seeding.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Plus Jakarta Sans & Playfair Display typography |
| **Backend** | Node.js, Express.js, TypeScript, REST API architecture |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt password hashing (10 salt rounds), Role-Based Access Control (RBAC) |
| **Database** | Persistent JSON store with Mongoose/MongoDB query interface & automated seed engine |
| **AI Integration** | Google Gemini API (`@google/genai` TypeScript SDK with `gemini-3.8-flash`) |

---

## 🔑 Demo Credentials (Ready for Viva & Evaluation)

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@campusnews.local` | `Admin@12345` | Chief Editor, approve/reject submissions, user roles, audit logs, system reset |
| **🎓 Faculty** | `faculty@campusnews.local` | `Faculty@12345` | HOD CS, publish workshops, create events, submit faculty articles |
| **🎒 Student** | `student@campusnews.local` | `Student@12345` | BCA 3rd Year, submit articles for review, comment, like, bookmark |

> 💡 **Quick Switcher:** Click the **"Demo Switcher"** button in the top navigation header or on the `/login` page to switch between accounts in 1 click without typing.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/campus-news-portal.git

# Navigate to project root
cd campus-news-portal

# Install all dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration values:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=campus_news_portal_secret_jwt_key_2026_bca
MONGODB_URI=mongodb://localhost:27017/campus_news_portal
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 4. Running the Application
```bash
# Start both Backend and Vite Frontend on port 3000
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Automated Tests
```bash
npm run test
```

---

## 📁 System Architecture & Directory Structure

```
campus-news-portal/
├── data/
│   └── campus_db.json              # Persistent database storage
├── server/
│   └── src/
│       ├── config/env.ts           # Environment configuration
│       ├── db/
│       │   ├── index.ts            # Persistent DB Manager with Mongoose-style API
│       │   ├── schemaTypes.ts      # TypeScript interfaces for all collections
│       │   └── seedData.ts         # Realistic pre-seeded university dataset
│       ├── middleware/
│       │   ├── auth.ts             # JWT token verification & role authorization
│       │   └── error.ts            # Global error handling middleware
│       ├── controllers/
│       │   ├── authController.ts   # Login, registration, profile, password change
│       │   ├── articleController.ts# News CRUD, approval, likes, bookmarks
│       │   ├── eventController.ts  # Workshop creation & live registrations
│       │   ├── announcementController.ts # Circulars with priority broadcast
│       │   ├── interviewController.ts # Spotlight Q&A interviews
│       │   ├── categoryController.ts # Beat management
│       │   ├── commentController.ts # Discussion moderation
│       │   ├── userController.ts   # Admin user management & role updates
│       │   ├── miscController.ts   # Stats, audit logs, contact messages
│       │   └── aiController.ts     # Google Gemini 3.8 Flash editorial AI
│       ├── routes/                 # Express API router endpoints
│       └── tests/api.test.ts       # Automated unit test suite
├── src/
│   ├── components/
│   │   ├── common/                 # Header, Navbar, Footer, Modal, Badge, Pagination
│   │   ├── news/                   # HeroFeatured, ArticleCard, CommentSection
│   │   ├── ai/                     # AIAssistantModal (Gemini generation)
│   │   └── admin/                  # AdminSidebar
│   ├── context/
│   │   ├── AuthContext.tsx         # User authentication state
│   │   ├── ThemeContext.tsx        # Light/Dark mode with persistence
│   │   └── NotificationContext.tsx # Toast alerts & user notifications
│   ├── pages/
│   │   ├── Home.tsx                # Dynamic homepage with ticker & hero
│   │   ├── NewsList.tsx            # Multi-category news grid with filters
│   │   ├── ArticleDetail.tsx       # Full reading view with likes & comments
│   │   ├── EventsPage.tsx          # Workshops with 1-click registration
│   │   ├── AnnouncementsPage.tsx   # Urgent circulars with notice board
│   │   ├── InterviewsPage.tsx      # Spotlight interviews
│   │   ├── InterviewDetail.tsx     # Q&A transcript view
│   │   ├── StudentActivitiesPage.tsx
│   │   ├── AchievementsPage.tsx
│   │   ├── ClubsPage.tsx
│   │   ├── SportsPage.tsx
│   │   ├── PlacementsPage.tsx
│   │   ├── SearchPage.tsx          # Full-text multi-field search
│   │   ├── AboutPage.tsx           # BCA project documentation & board
│   │   ├── ContactPage.tsx         # Working press inquiry form
│   │   ├── LoginPage.tsx           # Login with 1-click quick demo buttons
│   │   ├── RegisterPage.tsx        # Student/Faculty registration
│   │   ├── ProfilePage.tsx         # Profile edit & password update
│   │   ├── SubmitArticlePage.tsx   # Authoring suite with AI assistant
│   │   ├── BookmarksPage.tsx       # Personal reading list
│   │   ├── MySubmissionsPage.tsx   # Author review status tracker
│   │   └── admin/                  # Admin management pages
│   ├── services/api.ts             # Type-safe API client
│   ├── types/index.ts              # Frontend types
│   ├── App.tsx                     # Route hierarchy
│   ├── index.css                   # Tailwind styles & typography
│   └── main.tsx                    # React DOM entrypoint
├── server.ts                       # Full-stack server entrypoint
├── package.json
└── README.md
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student or faculty account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user profile fields |
| `POST` | `/api/auth/change-password` | Authenticated | Change account password |
| `GET` | `/api/articles` | Public / Auth | List articles with search, category, sort |
| `GET` | `/api/articles/:slug` | Public | Get single article, view count, comments |
| `POST` | `/api/articles` | Authenticated | Submit article (pending review or published) |
| `PUT` | `/api/articles/:id/status` | Admin | Approve or reject submitted article |
| `POST` | `/api/articles/:id/like` | Authenticated | Toggle like on article |
| `POST` | `/api/articles/:id/bookmark` | Authenticated | Toggle bookmark on article |
| `GET` | `/api/events` | Public | List campus events & workshops |
| `POST` | `/api/events/:id/register` | Authenticated | Register student for campus event |
| `GET` | `/api/announcements` | Public | List official academic circulars |
| `POST` | `/api/comments` | Authenticated | Post comment on news story |
| `GET` | `/api/stats` | Admin | System dashboard metrics & beat stats |
| `POST` | `/api/ai/editorial` | Authenticated | Generate headlines, summaries via Gemini |
| `POST` | `/api/seed/reset` | Admin | Factory reset database to initial seed |

---

## 🎓 Academic Viva Highlights (BCA Minor Project)
- **Zero Placeholder Buttons:** Every form, registration, comment, like, bookmark, and admin toggle works with real backend persistence.
- **Fail-Safe Operation:** Runs seamlessly in any demo environment without third-party database installation barriers.
- **Separation of Concerns:** Clear modular separation between presentation (`src/pages`), controllers (`server/src/controllers`), and data models (`server/src/db`).
- **Comprehensive Documentation:** Full viva preparation guide with ER and DFD descriptions in `PROJECT_DOCUMENTATION.md`.
