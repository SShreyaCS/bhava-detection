# NrityaAI — Deployment Guide

Deploy in two parts:

| Part | What | Where (recommended) |
|------|------|---------------------|
| **Backend** | FastAPI + TensorFlow + model (~23 MB) | [Render](https://render.com) (Starter plan) |
| **Frontend** | React (Vite) | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) |

**Important:** Live camera only works on **HTTPS** (production URLs). Upload image works on HTTP too.

---

## Before you start

### 1. Checklist

- [ ] GitHub account
- [ ] Project pushed to GitHub (include `model/emotion_mobilenetv2.h5` and `model/class_names.txt`)
- [ ] Do **not** commit `venv/`, `node_modules/`, or `.env` with secrets

### 2. Test build locally

**Backend:**

```powershell
cd "Emotion detection"
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000/health — should return `"status":"ok"`.

**Frontend:**

```powershell
cd frontend
npm install
npm run build
```

Folder `frontend/dist` should be created with no errors.

---

## Step 1 — Push code to GitHub

1. Create a new repo on GitHub (e.g. `nrityaai-emotion`).
2. In your project folder:

```powershell
cd "c:\Users\Shreya Suresh\OneDrive\Desktop\Emotion detection"
git init
git add app.py requirements.txt model/ frontend/ render.yaml DEPLOY.md
git add frontend/public frontend/src/assets
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

If `model/emotion_mobilenetv2.h5` is rejected (large file), use [Git LFS](https://git-lfs.github.com/) or upload the model via Render’s shell after first deploy.

---

## Step 2 — Deploy the backend (Render)

TensorFlow needs **at least ~1–2 GB RAM**. Free tiers often fail; use **Starter** ($7/mo) or similar.

1. Go to https://dashboard.render.com → **New +** → **Web Service**.
2. Connect your GitHub repo.
3. Settings:

   | Field | Value |
   |-------|--------|
   | **Name** | `nrityaai-api` |
   | **Root Directory** | *(leave empty — repo root)* |
   | **Runtime** | Python 3 |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app:app --host 0.0.0.0 --port $PORT` |
   | **Plan** | Starter (or higher) |

4. **Choose ONE of these runtimes:**

   **Option A — Docker (recommended, fixes TensorFlow install):**
   - **Runtime:** Docker
   - **Dockerfile Path:** `./Dockerfile`
   - **Build Command:** *(leave empty)*
   - **Start Command:** *(leave empty — uses Dockerfile CMD)*

   **Option B — Native Python:**
   - **Runtime:** Python 3
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Environment:** `PYTHON_VERSION` = `3.11.9` *(must be full version, not 3.11)*
   - Repo must include `.python-version` with `3.11.9`

   > New Render services default to **Python 3.14**, which has **no TensorFlow**. That causes `from versions: none`.

5. **Environment variables** → Add:

   | Key | Value (example) |
   |-----|------------------|
   | `ALLOWED_ORIGINS` | `https://your-app.vercel.app` *(add frontend URL after Step 3)* |

6. Click **Create Web Service**.
6. Wait 5–15 minutes (first deploy installs TensorFlow and loads the model).
7. Copy your backend URL, e.g. `https://nrityaai-api.onrender.com`.
8. Test: open `https://nrityaai-api.onrender.com/health` — should show JSON with `"status":"ok"`.

**Note:** Render free instances spin down when idle; first request may take 30–60 seconds.

---

## Step 3 — Deploy the frontend (Vercel)

1. Go to https://vercel.com → **Add New** → **Project**.
2. Import your GitHub repo.
3. Settings:

   | Field | Value |
   |-------|--------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

4. **Environment variables**:

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | `https://nrityaai-api.onrender.com` *(your backend URL, no trailing slash)* |

5. Click **Deploy**.
6. Copy your frontend URL, e.g. `https://nrityaai.vercel.app`.

---

## Step 4 — Connect frontend and backend

1. In **Render** → your backend service → **Environment**:
   - Set `ALLOWED_ORIGINS` to your Vercel URL, e.g. `https://nrityaai.vercel.app`
   - Save → **Manual Deploy** (or wait for redeploy).

2. In **Vercel** → **Settings** → **Environment Variables**:
   - Confirm `VITE_API_URL` points to the backend.
   - **Redeploy** if you changed it.

---

## Step 5 — Test the live app

1. Open your **Vercel URL** in Chrome/Edge.
2. **Upload Image** — pick a face photo → should show Bhava + confidence.
3. **Live Detection** — allow camera → **Capture** (needs HTTPS; Vercel provides this).
4. If upload fails with network error:
   - Check `VITE_API_URL` in Vercel
   - Check `ALLOWED_ORIGINS` in Render includes the exact Vercel URL (https, no trailing slash)

---

## Optional — Build frontend locally with production API

```powershell
cd frontend
copy .env.production.example .env.production
# Edit .env.production — set VITE_API_URL to your backend URL
npm run build
npm run preview
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Could not find a version that satisfies tensorflow` | Render is on **Python 3.14** by default. Use **Docker** deploy (`Dockerfile`) OR set **`PYTHON_VERSION`** = `3.11.9` (full version) + add `.python-version` file |
| Deploy fails after `cpu_feature_guard` log line | That line is **INFO**, not an error. Push latest `app.py` (background model load). Set health check path to `/health` |
| `Unrecognized keyword arguments: batch_shape, optional` | Model saved with **Keras 3** (TF 2.16+). Use `tensorflow==2.19.1` in `requirements.txt` + `PYTHON_VERSION=3.11.9` — not TF 2.15 |
| Backend build fails / out of memory | Use Render **Starter** plan or Railway with 2 GB+ RAM |
| `Model not found` | Ensure `model/emotion_mobilenetv2.h5` is in the repo or uploaded to the server |
| CORS error in browser | Add frontend URL to `ALLOWED_ORIGINS` on Render |
| Camera not working | Use HTTPS URL (Vercel/Netlify), not `http://` |
| Slow first request | Render cold start; wait or upgrade plan |
| 502 on predict | Model still loading; wait and retry `/health` |

---

## Alternative platforms

| Platform | Backend | Frontend |
|----------|---------|----------|
| **Railway** | Good for ML, set start: `uvicorn app:app --host 0.0.0.0 --port $PORT` | Deploy `frontend` separately or use Vercel |
| **Fly.io** | Docker, more control | Vercel |
| **PythonAnywhere** | Possible with paid plan | Static files or Vercel |

---

## Quick reference — run locally

```powershell
# Terminal 1 — Backend
cd "Emotion detection"
.\venv\Scripts\activate
python app.py

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open http://localhost:5173
