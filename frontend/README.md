# NrityaAI Frontend (React)

## Pages

| Route | Screen |
|-------|--------|
| `/` | Home — Upload Image / Live Detection |
| `/upload` | Upload image + results |
| `/live` | Open camera (start) |
| `/live/capture` | Live camera + capture + results |

## Setup

```powershell
cd frontend
npm install
```

## Run (development)

**Terminal 1 — Backend:**
```powershell
cd ..
.\venv\Scripts\activate
python app.py
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

Open **http://localhost:5173**

## Build for production

```powershell
npm run build
```

Output in `frontend/dist/` — can be served by FastAPI or any static host.
