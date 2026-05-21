# ✂️ HairDrama — Task Management Platform

> Luxury fashion-forward task management for the HairDrama team. Built with Next.js, Flask, Supabase, and Google OAuth.

---

## 🌐 Live Demo

| Service  | URL |
|----------|-----|
| Frontend | `https://hairdrama-tasks.vercel.app` *(deploy and update)* |
| Backend  | `https://hairdrama-tasks-api.railway.app` *(deploy and update)* |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              Next.js 14 + TypeScript (Vercel)               │
│                                                             │
│  ┌─────────────┐   ┌───────────────┐   ┌────────────────┐  │
│  │  Auth Pages  │   │  Dashboard    │   │  Task Detail   │  │
│  │  (Google    │   │  (Kanban      │   │  (CRUD +       │  │
│  │   OAuth)    │   │   Board)      │   │   Status)      │  │
│  └──────┬──────┘   └───────┬───────┘   └───────┬────────┘  │
│         │                  │                    │           │
│         └──────────────────┴────────────────────┘           │
│                            │                                │
│                  Supabase JS Client                         │
│              (Auth tokens + session mgmt)                   │
└────────────────────────────┬────────────────────────────────┘
                             │ Bearer JWT
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│                  Flask REST API (Railway)                   │
│                                                             │
│  /api/auth     /api/tasks     /api/users                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Auth Middleware                          │  │
│  │    (validates Supabase JWT on every request)         │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                   │
│  ┌────────────┐   ┌──────┴──────┐   ┌────────────────────┐ │
│  │  Supabase  │   │   Email     │   │   Task CRUD        │ │
│  │   Client   │   │  Service    │   │   (with RLS)       │ │
│  │  (admin)   │   │  (Gmail     │   │                    │ │
│  └────────────┘   │   SMTP)     │   └────────────────────┘ │
│                   └─────────────┘                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌──────────────────┐              ┌──────────────────────┐
│    SUPABASE      │              │      GMAIL SMTP      │
│                  │              │                      │
│  auth.users      │              │  Task Created Email  │
│  profiles        │              │  Task Done Email     │
│  tasks           │              │                      │
│                  │              │  (via App Password)  │
│  Row-Level       │              └──────────────────────┘
│  Security (RLS)  │
└──────────────────┘
```

### Data Flow

1. **Login**: User clicks "Continue with Google" → Supabase OAuth → redirect to `/auth/callback` → session stored in browser
2. **API Calls**: Frontend attaches Supabase JWT as `Authorization: Bearer <token>` header
3. **Auth Middleware**: Flask validates JWT against Supabase → extracts `user_id`
4. **Database**: Supabase Postgres with Row-Level Security (users only see their own tasks)
5. **Emails**: When task is created/completed, Flask sends HTML email via Gmail SMTP

---

## 📁 Project Structure

```
hairdrama-tasks/
├── backend/                    # Flask REST API
│   ├── app.py                  # App factory + blueprint registration
│   ├── config.py               # Environment config
│   ├── Procfile                # Railway/Render deploy command
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/
│   │   ├── auth.py             # /api/auth/* endpoints
│   │   ├── tasks.py            # /api/tasks/* CRUD + email triggers
│   │   └── users.py            # /api/users/* profile endpoints
│   └── services/
│       ├── supabase_client.py  # Supabase admin + anon clients
│       ├── email_service.py    # Gmail SMTP email templates
│       └── auth_middleware.py  # JWT validation decorator
│
├── frontend/                   # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout (fonts, Toaster, AuthProvider)
│   │   │   ├── globals.css     # CSS variables + animations
│   │   │   ├── page.tsx        # Landing / login page
│   │   │   ├── auth/callback/  # OAuth redirect handler
│   │   │   ├── dashboard/      # Kanban board dashboard
│   │   │   └── tasks/
│   │   │       ├── page.tsx    # All tasks (searchable/filterable list)
│   │   │       └── [id]/       # Task detail + edit
│   │   ├── components/
│   │   │   ├── layout/Navbar.tsx
│   │   │   └── tasks/
│   │   │       ├── TaskCard.tsx
│   │   │       └── CreateTaskModal.tsx
│   │   ├── hooks/useAuth.tsx   # Supabase auth context
│   │   ├── lib/
│   │   │   ├── supabase.ts     # Browser Supabase client
│   │   │   └── api.ts          # Typed API client (all backend calls)
│   │   └── types/index.ts      # Shared TypeScript types
│   ├── .env.example
│   └── package.json
│
└── migrations/
    └── 001_initial_schema.sql  # Supabase schema + RLS + triggers
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account
- Google Cloud Console project (for OAuth)
- Gmail account with App Password

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `migrations/001_initial_schema.sql`
3. Go to **Authentication → Providers → Google** and enable it
4. Add your Google OAuth credentials (Client ID + Secret)
5. Add your redirect URL: `https://your-project.supabase.co/auth/v1/callback`
6. Copy your **Project URL**, **Anon Key**, and **Service Role Key**

### 2. Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the **Google+ API**
4. Create **OAuth 2.0 Credentials** (Web application)
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret into Supabase

### 3. Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com) → Security
2. Enable 2-Step Verification
3. Under "2-Step Verification" → **App passwords**
4. Generate a password for "Mail"
5. Copy the 16-character password

### 4. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your credentials

python app.py
# API runs on http://localhost:5000
```

### 5. Frontend

```bash
cd frontend
npm install

cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# NEXT_PUBLIC_API_URL=http://localhost:5000

npm run dev
# App runs on http://localhost:3001
```

---

## ☁️ Deployment

### Backend → Railway

1. Push code to GitHub
2. Create new Railway project → **Deploy from GitHub repo**
3. Select the `backend/` folder (or set root directory)
4. Add all environment variables from `backend/.env.example`
5. Railway auto-detects `Procfile` and deploys with Gunicorn
6. Copy the Railway URL → set as `NEXT_PUBLIC_API_URL` in Vercel

### Frontend → Vercel

1. Import GitHub repo into [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend/`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (your Railway URL)
4. Deploy — Vercel handles the rest

### Post-Deployment

Update these values with your live URLs:
- Supabase → **Authentication → URL Configuration**:
  - Site URL: `https://your-app.vercel.app`
  - Redirect URLs: `https://your-app.vercel.app/auth/callback`
- Backend `.env`: `FRONTEND_URL=https://your-app.vercel.app`
- Backend `.env`: `ALLOWED_ORIGINS=https://your-app.vercel.app`

---

## 🔑 API Endpoints

All endpoints require `Authorization: Bearer <supabase_jwt>` except `/api/health`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/me` | Current user profile |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/tasks` | List tasks (created by or assigned to user) |
| POST | `/api/tasks` | Create task + send email notification |
| GET | `/api/tasks/:id` | Get task detail |
| PATCH | `/api/tasks/:id` | Update task (triggers completion email) |
| DELETE | `/api/tasks/:id` | Delete task (creator only) |
| GET | `/api/users` | List all users (for assignment dropdown) |
| PATCH | `/api/users/profile` | Update own profile |

---

## ✉️ Email Notifications

Two automated emails are sent:

| Trigger | Recipient | Subject |
|---------|-----------|---------|
| Task created with assignee | Assignee | `✂️ New Task Assigned: {title}` |
| Task status changed to "done" | Task creator | `✅ Task Completed: {title}` |

Emails use HairDrama's brand aesthetic (dark background, gold accents, Playfair typography).

---

## 🛡 Security

- **Row-Level Security**: Supabase RLS policies ensure users only access their own data
- **JWT Validation**: Every Flask endpoint validates the Supabase JWT
- **Service Role**: Backend uses service role key (never exposed to frontend)
- **CORS**: Restricted to configured `ALLOWED_ORIGINS`
- **Env Variables**: No secrets committed — all via `.env` / hosting env vars

---

## 🎨 Design

The HairDrama brand aesthetic uses:
- **Fonts**: Playfair Display (headings) + Cormorant Garamond (body)
- **Colors**: Deep ink black (#0a0a0a), champagne gold (#c9a84c), soft cream (#f5f0eb)
- **Style**: Luxury editorial — sparse, refined, fashion-forward
- **Animations**: Subtle fade-up entrances, gold shimmer text, micro-hover transitions
# HairDrama
