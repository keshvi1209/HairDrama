# ✂️ HairDrama — Task Management

Luxury editorial task management system tailored for the HairDrama team. Implements a responsive, fashion-forward interface with fine-grained status locks, role-based workflows, and real-time transaction notifications.

---

## 🎨 Brand Aesthetic & Experience
- **Typography:** Playfair Display headings & Cormorant Garamond body fonts.
- **Color Palette:** Luxury deep ink black (`#0a0a0a`), champagne gold (`#c9a84c`), and soft cream (`#f5f0eb`).
- **Interactive UI:** Subtle gold hover effects, responsive layout grids, and visual gold back arrow controls.

---

## 🏗 Tech Stack & Architecture
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS (deployed on Vercel)
- **Backend:** Flask REST API + Gunicorn (deployed on Railway)
- **Database & Auth:** Supabase (Postgres with RLS & Google OAuth integration)
- **Notifications:** Transactional HTML emails sent via Brevo/Resend HTTP APIs, with Gmail SMTP fallback

---

## 🔒 Status & Editing Permissions
The application enforces strict state-based and role-based permissions:

| Task Status | Creator Permissions | Assignee Permissions | Card Interaction |
| :--- | :--- | :--- | :--- |
| **`To Do`** | Full Edit (`Edit` button visible on Assigned board) | Status Update Only (`Update Status` enabled) | Clickable for quick status shift |
| **`In Progress`** | Read Only (No changes allowed) | Status Update Only (`Update Status` enabled) | Clickable for quick status shift |
| **`Done`** | Locked (Read-Only) | Locked (Read-Only) | Locked card (No actions) |

### Page Scopes
- **Workload Dashboard (`/dashboard`):** Filtered strictly to tasks assigned *to* the active user. Showcases personalized stats and dynamic status boards.
- **Delegation Board (`/tasks/assigned`):** Grouped as *"Assigned by You"* (tasks created *by* the active user).
- **Global Archive (`/tasks`):** Fully read-only index of all tasks across the workspace; all creation buttons and action controls are completely stripped.

---

## 📧 Transactional Emails
Automated, luxury-styled HTML emails are dispatched with clear **`Move to Dashboard →`** CTAs pointing directly to the workload page:
1. **Assignment / Reassignment:** Dispatched to the assignee immediately upon task setup or update.
2. **Task Completion:** Sent to the creator as soon as the assignee transitions the status to **`Done`**.

For deployed environments, prefer an HTTP email provider because many hosts block or throttle outbound SMTP. Configure either Brevo or Resend in the backend service dashboard:

```env
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=your-verified-sender@example.com

# or
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=notifications@your-verified-domain.com
```

Gmail SMTP is kept as a fallback and can work locally:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

If deployed emails fail, check the backend logs. Notification failures are logged with the provider response while task creation/update still succeeds.

---

## 🚀 Quick Start

### 1. Environment Config
Configure these in your local root or service dashboards:

**Backend (`backend/.env`):**
```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-16-char-app-password
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=your-verified-sender@example.com
# or:
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=notifications@your-verified-domain.com
FRONTEND_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3001
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Execution

**Start Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```
