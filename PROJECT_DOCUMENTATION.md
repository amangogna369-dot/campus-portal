# 🎓 Campus News Portal - Comprehensive Project Report
**Project Type:** Bachelor of Computer Applications (BCA) Minor Project  
**Academic Year:** 2026  
**Technology Stack:** React 19, TypeScript, Node.js, Express.js, MongoDB/JSON Storage, JWT, Tailwind CSS, Google Gemini AI  

---

## 1. Abstract
The **Campus News Portal** is a web-based digital media and communications solution engineered to bridge communication gaps within a collegiate campus. Traditional campus notice boards and scattered messaging groups often result in communication delays, missed scholarship deadlines, unverified rumors, and low student participation in extracurricular programs.

This project delivers a multi-role digital publishing ecosystem where students and faculty can submit news and event reports, read verified circulars, engage in peer discussions, and access career and placement records. An administrative editorial pipeline ensures rigorous journalistic quality through an approval queue. Furthermore, modern artificial intelligence capabilities (Google Gemini 3.8 Flash) are integrated to assist student authors in generating journalistic headlines, executive summaries, and SEO metadata.

---

## 2. Introduction
In higher education institutions, effective information dissemination plays a critical role in student success and varsity prestige. A university campus buzzes with academic seminars, sporting tournaments, research milestones, placement recruitment drives, student council activities, and cultural festivals. 

The Campus News Portal serves as the single source of truth for the entire institution, combining the immediacy of modern digital publishing with the verification integrity of academic governance.

---

## 3. Problem Statement
Many contemporary colleges still rely upon:
1. **Physical Notice Boards:** Limited physical reach, vulnerable to weather conditions, and inaccessible to commuter and off-campus students.
2. **Scattered Social Media / Chat Channels:** Unmoderated, prone to misinformation, lacking archival searchability, and creating notification fatigue.
3. **Static Department Webpages:** Difficult for non-technical student club leaders to update without direct webmaster intervention.
4. **Lack of Interaction:** Absence of centralized platforms where students can comment, bookmark notices, or register for campus workshops.

---

## 4. Objectives of the Project
- **Centralized Publication:** Consolidate news across 10 distinct campus beats (Academic, Workshops, Student Activities, Announcements, Achievements, Clubs, Sports, Cultural, Placements, and Interviews).
- **Role-Based Workflows:** Implement a three-tiered permission architecture:
  - **Student:** Can browse, search, comment, like, bookmark, and submit news stories for review.
  - **Faculty:** Can publish academic circulars, organize workshops, and mentor student publications.
  - **Administrator / Chief Editor:** Complete control over user management, editorial approvals, category taxonomies, and audit activity logs.
- **Strict Verification Standards:** Enforce an editorial approval queue where student drafts remain in `pending` status until approved by an administrator.
- **Editorial Productivity with AI:** Leverage Generative AI (Gemini 3.8 Flash) for headline suggestions, summary generation, and proofreading.
- **Responsive & Accessible Design:** Provide an intuitive mobile-first interface featuring light/dark mode persistence and instant search indexing.

---

## 5. Existing System vs. Proposed System

| Feature | Existing Manual / Fragmented System | Proposed Digital Campus News Portal |
| :--- | :--- | :--- |
| **Notice Dissemination** | Printed circulars pinned to bulletin boards | Real-time digital alerts with priority tags (Urgent/Important) |
| **Searchability** | None; manual scanning of physical notices | Instant multi-field search (by author, beat, keyword, tag) |
| **Student Contributions** | Submitted via paper forms or emails | Digital authoring suite with status tracker (Pending/Published/Rejected) |
| **Editorial Review** | Manual red-pen editing and re-typing | Online review queue with one-click approval & feedback notes |
| **Authentication & Security**| None or rudimentary shared login | Bcrypt password hashing, JWT bearer tokens, and RBAC |
| **AI Capabilities** | None | Gemini 3.8 Flash automated headline & summary generator |
| **Audit & Accountability** | No historical activity trail | Automatic logging of publishing and moderation actions |

---

## 6. Functional & Non-Functional Requirements

### 6.1 Functional Requirements
- **FR1: User Authentication & Profile Management**
  - Registration with Student/Faculty ID, department, degree course, and year.
  - Secure login with JWT token issuance and password comparison via bcrypt.
  - Profile modification and password updates.
- **FR2: Article Authoring & Approval Lifecycle**
  - Rich content authoring supporting markdown headers, lists, and images.
  - Workflow status transitions: `Draft` -> `Pending` -> `Published` or `Rejected`.
  - Rejection notes sent automatically to author's notification center.
- **FR3: Discovery & Search**
  - Multi-beat filtering (Campus News, Sports, Clubs, Placements, etc.).
  - Sorting by latest, oldest, most viewed, and most liked.
  - Full-text keyword search across titles, descriptions, and author names.
- **FR4: Events & Registrations**
  - Campus event scheduling with venue, date, organizer, and capacity limits.
  - Real-time student workshop registration with capacity progress tracking.
- **FR5: Announcements & Priority Alerts**
  - Pinning of critical circulars with PDF attachment simulator.
  - Breaking news banner ticker across public pages.
- **FR6: Social & Community Interactions**
  - Interactive like and bookmark buttons.
  - Threaded comment section with role badges and deletion controls.
  - Newsletter email subscription.
- **FR7: AI Editorial Assistant**
  - Automated headline, summary, tags, and SEO metadata generation using Google Gemini.
- **FR8: Admin Control Center**
  - Metrics cards (Users, Articles, Views, Likes, Events, Announcements).
  - Category taxonomy management.
  - User role promotion/demotion and suspension.
  - Factory reset / database re-seeding engine for demonstrations.

### 6.2 Non-Functional Requirements
- **Performance:** Sub-100ms API response times for indexed database queries.
- **Security:** Passwords salted and hashed with 10 rounds of bcrypt; API endpoints protected via Bearer authentication tokens.
- **Reliability:** Dual-mode persistence engine ensuring zero crash risk during offline evaluations.
- **Usability:** Responsive layouts supporting desktop, tablet, and mobile viewports with accessible contrast.
- **Extensibility:** Modular MVC (Model-View-Controller) architecture enabling seamless addition of future varsity services.

---

## 7. System Architecture & Data Flow

### 7.1 System Architecture Diagram Description
The application follows a **Three-Tier Client-Server Architecture**:
1. **Presentation Tier (Frontend):** React SPA powered by Vite and Tailwind CSS. Manages local state via React Contexts (`AuthContext`, `ThemeContext`, `NotificationContext`).
2. **Application Tier (Backend REST API):** Express.js server hosted on Node.js. Enforces route guards, token validation (`authenticateToken`, `requireRoles`), and business logic controllers.
3. **Data Tier (Storage Engine):** Persistent JSON storage engine adhering to Mongoose/MongoDB data models and automated seed population.
4. **External AI Gateway:** Direct server-side proxy communicating with the Google Gemini API using `@google/genai`.

### 7.2 Data Flow Diagram (DFD)

#### Level 0 DFD (Context Diagram)
- **User (Student/Faculty)** -> [Submits Credentials / Articles / Comments / Event Registrations] -> **Campus News Portal System** -> [Receives News Feeds / Confirmations / Notifications].
- **Administrator** -> [Reviews Submissions / Manages Roles / Posts Announcements] -> **Campus News Portal System** -> [Receives Analytics & Audit Trail].

#### Level 1 DFD (Subsystem Breakdown)
- **Process 1.0 (Authentication):** Validates input, hashes password, verifies credentials, issues signed JWT token.
- **Process 2.0 (Editorial Pipeline):** Receives submission, assigns `pending` status, notifies Administrator. Admin reviews content; if approved, status becomes `published` and viewable publicly.
- **Process 3.0 (Interaction Engine):** Processes comment submissions, updates like counts, and stores bookmarks in user relation tables.
- **Process 4.0 (AI Assistant):** Takes raw article content, formats prompt for `gemini-3.8-flash`, returns structured editorial recommendations.

---

## 8. Database Design & Entity Relationship (ER)

### 8.1 Collections / Tables Summary

| Collection | Primary Key | Key Foreign Keys | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `id` | - | Student, faculty, and administrator profiles |
| `articles` | `id` | `authorId` -> `users.id` | News stories, statuses, views, and likes |
| `categories` | `id` | - | News beats and taxonomy tags |
| `events` | `id` | - | Workshops, hackathons, and sports tournaments |
| `announcements` | `id` | - | Official circulars, priority, and attachments |
| `interviews` | `id` | `authorId` -> `users.id` | Q&A spotlight conversations |
| `comments` | `id` | `articleId`, `userId` | Article reader discussions |
| `likes` | `id` | `articleId`, `userId` | Reaction tracking |
| `bookmarks` | `id` | `articleId`, `userId` | User reading list |
| `notifications` | `id` | `userId` -> `users.id` | Real-time user alert records |
| `activityLogs` | `id` | `userId` -> `users.id` | Administrative audit trail |

### 8.2 ER Relationship Description
- **User to Article (1:N):** One student or faculty member can author multiple news articles.
- **Article to Comment (1:N):** One published article can receive multiple reader comments.
- **User to Comment (1:N):** One user can post comments across different articles.
- **User to Bookmark (1:N):** One user can bookmark multiple articles.
- **Category to Article (1:N):** One category beat organizes multiple news articles.

---

## 9. Security & Hardening Measures
1. **Password Hashing:** Passwords are never stored in plaintext. `bcryptjs` is utilized with 10 salt rounds to defend against rainbow table attacks.
2. **Stateless JWT Authentication:** Users receive a signed JSON Web Token upon successful credential validation. Sensitive routes check authorization via `Bearer <token>`.
3. **Role-Based Authorization:** Custom Express middleware `requireRoles('admin')` validates authorization level before granting access to moderation endpoints.
4. **Input Sanitization & Slugs:** URL slugs are dynamically sanitized using regular expressions to prevent path traversal and injection flaws.
5. **Secure Environment Variables:** Secrets such as `JWT_SECRET` and `GEMINI_API_KEY` are isolated in environment variables.

---

## 10. Testing & Verification

### 10.1 Automated Test Execution Log (`npm run test`)
```
🧪 Starting Campus News Portal API & Database Unit Tests...

  ✅ PASS: Database contains initial seed users
  ✅ PASS: Database contains 15+ articles across campus categories
  ✅ PASS: Database contains upcoming campus events
  ✅ PASS: Database contains priority announcements
  ✅ PASS: Admin user account exists with admin role
  ✅ PASS: Student user account exists with student role
  ✅ PASS: Bcrypt password comparison succeeds for Admin credentials
  ✅ PASS: JWT token generated successfully
  ✅ PASS: JWT token decoded and verified successfully
  ✅ PASS: Article created with pending review status
  ✅ PASS: Admin approves and publishes article
  ✅ PASS: Article like count incremented
  ✅ PASS: Article successfully saved to user bookmarks
  ✅ PASS: Comment successfully attached to article
  ✅ PASS: Event registered attendance count increments

=======================================================
Test Execution Finished: 15 Passed, 0 Failed
=======================================================
```

---

## 11. Viva Voce Preparation Guide (Questions & Answers)

**Q1: Why did you choose React and Express for this project?**  
*Answer:* React provides a component-driven, declarative architecture enabling instant reactive UI updates (like toggling likes and bookmark counters without page reloads). Express on Node.js offers a non-blocking, event-driven REST API capable of handling concurrent requests with minimal overhead.

**Q2: How does the editorial approval pipeline work?**  
*Answer:* When a student or faculty member authors a story, the server assigns it a `pending` status. The article is excluded from public queries. Administrators review the pending queue in the Admin Control Center, where they can either publish the story (changing status to `published` and broadcasting a notification) or reject it with feedback notes explaining why revisions are needed.

**Q3: How is authentication managed securely?**  
*Answer:* Plaintext passwords are encrypted using `bcryptjs` with 10 salt rounds before storage. Upon login, the server verifies the password hash and returns a signed JSON Web Token (JWT). The client transmits this token via the `Authorization: Bearer <token>` HTTP header, which is verified by server middleware.

**Q4: How does the Google Gemini AI integration assist editors?**  
*Answer:* The backend interacts with the Gemini 3.8 Flash model (`@google/genai`). When an author drafts rough content, the AI assistant can formulate three journalistic headlines, synthesize an executive summary, generate search tags, and rewrite the draft in academic journalistic style. If the AI key is unavailable, a local algorithmic engine provides fallback responses to ensure continuous uptime.

**Q5: What happens if MongoDB is offline during an on-campus viva demonstration?**  
*Answer:* The system implements a resilient dual-mode database manager. If an external MongoDB cluster is disconnected, the server automatically operates using its embedded JSON persistence engine (`data/campus_db.json`), retaining all CRUD modifications and pre-seeded accounts without interruption.

---

## 12. Conclusion & Future Enhancements
The **Campus News Portal** successfully delivers an end-to-end digital news publication platform tailored to the operational requirements of collegiate institutions. By combining role-based access control, an editorial review pipeline, automated AI assistance, and interactive community features, the platform modernizes campus communication.

### Future Enhancements:
- Push notifications via Progressive Web App (PWA) service workers.
- Multilingual translation of campus notices into regional languages using Gemini.
- Direct digital voter ballots for annual Student Council elections.
