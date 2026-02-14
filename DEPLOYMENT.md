# UCMS — Deployment Guide

## Architecture
- **Vercel** → Next.js Frontend (14 routes)
- **Netlify** → Backend API (6 serverless functions)
- **Supabase** → Database + Auth + Storage

---

## Step 1: Supabase (Database + Auth)

### 1.1 Create Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Choose a name (e.g., `ucms-production`), set a database password → **Create**

### 1.2 Run Schema
1. **SQL Editor** → **+ New Query**
2. Paste contents of `supabase/schema.sql` → **Run** ▶
3. Verify in **Table Editor**: `profiles`, `applications`, `colleges`, `documents`, `notifications`, `fee_payments`, `offer_letters`

### 1.3 Configure Auth
1. **Authentication** → **Providers** → Email should be enabled
2. (Optional) Enable Google OAuth with credentials from [console.cloud.google.com](https://console.cloud.google.com)

### 1.4 Create Storage Bucket
1. **Storage** → **New Bucket** → Name: `documents` → Public: OFF → **Create**

### 1.5 Copy Credentials
Go to **Settings** → **API**:
- **Project URL**: `https://xxxxxxx.supabase.co`
- **Anon public key**: `eyJhbGci...`
- **Service role key**: `eyJhbGci...` (**SECRET** — only for backend)

---

## Step 2: Netlify (Backend API)

### 2.1 Deploy
1. Push code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Select your repo
4. Set **Base directory**: `netlify-backend`
5. **Build command**: `npm install`
6. **Publish directory**: `netlify-backend/public`
7. **Functions directory**: `netlify-backend/netlify/functions`

### 2.2 Environment Variables
In **Site settings** → **Environment variables**, add:

| Variable | Value |
|----------|-------|
| `APP_URL` | Your Vercel frontend URL (set after Step 3) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASSWORD` | Gmail App Password (see bottom of this doc) |

### 2.3 Verify
Your backend will be at: `https://your-site.netlify.app`
- Health check: `https://your-site.netlify.app/api/health`

---

## Step 3: Vercel (Frontend)

### 3.1 Deploy
1. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
2. Set **Root Directory**: `frontend`
3. Framework: **Next.js** (auto-detected)

### 3.2 Environment Variables
In **Settings** → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `NEXT_PUBLIC_API_URL` | Netlify backend URL (e.g., `https://your-site.netlify.app/api`) |

### 3.3 Deploy → live at `https://your-project.vercel.app`

---

## Step 4: Connect Everything

1. **Netlify** → Set `APP_URL` = Vercel frontend URL
2. **Supabase** → **Auth** → **URL Configuration**:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/**`

---

## Step 5: Verify

| Check | URL | Expected |
|-------|-----|----------|
| Frontend | `https://your-project.vercel.app` | Landing page |
| Login | `.../login` | Login form |
| Backend health | `https://your-site.netlify.app/api/health` | `{"status":"ok"}` |

---

## Gmail App Password (for SMTP)

1. Enable 2FA on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate App Password for "Mail"
4. Use the 16-char password as `SMTP_PASSWORD`
