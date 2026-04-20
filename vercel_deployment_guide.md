# Vercel Deployment Guide — Vortex Gen

## Architecture Overview

Your project has two parts that need **separate deployment strategies**:

| Part | Tech | Vercel-deployable? |
|------|------|--------------------|
| `frontend/` | React + Vite | ✅ Yes — directly |
| `backend/` | Node.js + **Python (NeuralFoil)** | ⚠️ Not natively |

> [!CAUTION]
> Vercel's serverless functions **cannot run a persistent Python daemon** or install Python packages like `neuralfoil` and `numpy`. Your backend spawns a long-lived Python process via `child_process`, which is **incompatible with Vercel's execution model**. The backend needs its own hosting.

---

## Step 1 — Choose a Backend Host

Your backend requires a server that:
- Runs Node.js
- Can install Python + `neuralfoil` + `numpy`
- Keeps a persistent process alive

**Recommended free/cheap options:**

| Platform | Notes |
|----------|-------|
| **Railway** ⭐ | Best fit. Free tier, supports Node + Python in one repo, auto-detects Nixpacks |
| **Render** | Free tier (sleeps after 15 min idle), good Python support |
| **Fly.io** | More complex setup but powerful |
| **DigitalOcean App Platform** | Paid but simple |

> [!TIP]
> **Railway is the easiest path.** It will auto-detect your `backend/` folder, install Python via a `requirements.txt`, and run `node server.js`.

---

## Step 2 — Files to Create/Fix Before Pushing to GitHub

### 2a. `backend/requirements.txt` — **[MISSING — Must Create]**

Vercel/Railway need to know your Python dependencies. Create this file:

```
neuralfoil
numpy
```

### 2b. `backend/package.json` — Add a `start` script

```json
"scripts": {
  "start": "node server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

### 2c. `frontend/.env.production` — **[Must Create]**

Your frontend currently calls `axios` to the backend. In production, it must point to your deployed backend URL (not `localhost:5000`).

```
VITE_API_URL=https://your-backend.railway.app
```

Then in your frontend code, wherever you have `http://localhost:5000`, replace with:
```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### 2d. `vercel.json` — **[Must Create in root]**

This tells Vercel to build only the frontend subfolder:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "echo 'skip root install'",
  "framework": null
}
```

### 2e. `.gitignore` — Add missing entries

Add these to the root `.gitignore`:
```
# Python virtual env
backend/venv/
# Python temp files
backend/tmp_airfoil_*.dat
```

---

## Step 3 — Fix the Frontend API URL

Find all `localhost:5000` calls in your frontend source and make them env-aware. Look in:
```
frontend/src/
```
Replace hardcoded URLs like:
```js
// Before
axios.post('http://localhost:5000/api/analyze', ...)

// After
axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analyze`, ...)
```

---

## Step 4 — GitHub Setup (if not done)

```bash
# In the project root (2jaefar/)
git add .
git commit -m "chore: prepare for Vercel + Railway deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

> [!NOTE]
> Your project already has a `.git` folder, so `git init` is not needed.

---

## Step 5 — Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub Repo**
2. Select your repo → choose **only the `backend/` subfolder** as the root
3. Railway will detect Node.js. Add a build step for Python:
   - In Railway settings → **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `node server.js`
4. After deploy, **copy the generated URL** (e.g. `https://vortex-gen-backend.railway.app`)

---

## Step 6 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project → Import Git Repository**
2. Select your GitHub repo
3. Vercel will auto-detect the `vercel.json` you created
4. Under **Environment Variables**, add:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.railway.app` (from Step 5)
5. Click **Deploy** ✅

---

## Step 7 — Fix CORS on the Backend

Your backend must allow requests from your Vercel domain. Update `backend/server.js`:

```js
// Replace this:
app.use(cors());

// With this:
app.use(cors({
  origin: [
    'http://localhost:5173',                    // local dev
    'https://your-project.vercel.app',          // Vercel production
    /\.vercel\.app$/                            // all Vercel preview URLs
  ]
}));
```

---

## Summary Checklist

- [ ] Create `backend/requirements.txt` with `neuralfoil` and `numpy`
- [ ] Add `"start": "node server.js"` to `backend/package.json`
- [ ] Create `frontend/.env.production` with `VITE_API_URL=<backend_url>`
- [ ] Create root `vercel.json` pointing to `frontend/`
- [ ] Replace all `localhost:5000` in frontend with `import.meta.env.VITE_API_URL`
- [ ] Fix CORS in `backend/server.js` to allow Vercel domain
- [ ] Push all changes to GitHub
- [ ] Deploy backend on Railway (or Render)
- [ ] Deploy frontend on Vercel with `VITE_API_URL` env var set
- [ ] Test the live URL end-to-end

---

## Want me to do all of this automatically?

Say **"yes, do it all"** and I will:
1. Create all the missing files
2. Fix the frontend API URLs
3. Update the CORS config
4. Commit everything to GitHub-ready state
