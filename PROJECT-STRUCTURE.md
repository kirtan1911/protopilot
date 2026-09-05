# ProtoPilot — Project Structure

**Version:** 1.0.0  
**Last Updated:** 2026-07-16

---

## Full Folder Tree

```
ProtoPilot/
│
├── app/
│   ├── backend/                      ← Python FastAPI server
│   │   ├── server.py                 ← Main application: all routes, AI, auth, exports
│   │   ├── requirements.txt          ← Python package dependencies
│   │   ├── .env                      ← Secrets (gitignored — copy from .env.example)
│   │   ├── .gitignore                ← Backend-specific gitignore
│   │   ├── .venv/                    ← Python virtual environment (gitignored)
│   │   ├── __pycache__/              ← Python bytecode cache (gitignored)
│   │   ├── uploads/                  ← Uploaded audio files (runtime, gitignored)
│   │   └── exports/                  ← Generated DOCX/HTML files (runtime, gitignored)
│   │
│   └── frontend/                     ← React frontend (Create React App + CRACO)
│       ├── public/
│       │   └── index.html            ← HTML entry point, meta tags, SEO
│       ├── src/
│       │   ├── App.js                ← Route definitions, protected route wrappers
│       │   ├── App.css               ← Global accessibility styles
│       │   ├── index.js              ← React DOM root, QueryClientProvider
│       │   ├── index.css             ← Design system: glassmorphism, animations, fonts
│       │   │
│       │   ├── components/
│       │   │   ├── Layout.jsx        ← Sticky navbar with logo, user name, logout
│       │   │   └── VoiceRecorder.jsx ← Alexa-style mic recording with pulse animations
│       │   │
│       │   ├── context/
│       │   │   └── AuthContext.js    ← JWT auth state: login, signup, logout, getToken
│       │   │
│       │   ├── lib/
│       │   │   └── api.js            ← Axios instance with base URL and Bearer auth
│       │   │
│       │   └── pages/
│       │       ├── LandingPage.jsx           ← Public marketing / hero page
│       │       ├── LoginPage.jsx             ← Email+password login with forgot link
│       │       ├── SignupPage.jsx             ← Account registration
│       │       ├── ForgotPasswordPage.jsx    ← Step 1: Enter email → send OTP
│       │       ├── VerifyOtpPage.jsx         ← Step 2: 6-box OTP input + countdown
│       │       ├── ResetPasswordPage.jsx     ← Step 3: Set new password
│       │       ├── DashboardPage.jsx         ← Project grid with status badges + modal
│       │       └── ProjectDetailPage.jsx     ← Tabbed project view:
│       │                                         • Transcript (Type Text / Voice)
│       │                                         • Requirements (AI extraction)
│       │                                         • Wireframe (AI HTML preview)
│       │                                         • Schema (DB tables)
│       │                                         • API Spec (REST endpoints)
│       │
│       ├── package.json              ← Node dependencies and scripts
│       ├── craco.config.js           ← Webpack customization (@/ alias, dev server fix)
│       ├── tailwind.config.js        ← Tailwind theme tokens (colors, radius, keyframes)
│       ├── .env                      ← REACT_APP_BACKEND_URL (gitignored)
│       ├── .gitignore                ← Frontend gitignore
│       └── yarn.lock                 ← Locked dependency tree
│
├── .env.example                      ← Template for all required environment variables
├── .gitignore                        ← Root gitignore (OS, editors, Python, Node, secrets)
├── Dockerfile                        ← Backend Docker image (Python 3.11 slim)
├── docker-compose.yml                ← MongoDB + backend service orchestration
├── LICENSE                           ← MIT License
├── README.md                         ← Full project documentation
├── CHANGELOG.md                      ← Version history (Keep a Changelog format)
├── CONTRIBUTING.md                   ← How to contribute
├── SECURITY.md                       ← Security policy and vulnerability reporting
├── CODE_OF_CONDUCT.md                ← Community standards (Contributor Covenant)
├── DEBUGGING-REPORT.md               ← All bugs found + root causes + fixes
├── AI-DEVELOPMENT-REPORT.md          ← AI development report in Gujarati
└── PROJECT-STRUCTURE.md              ← This file
```

---

## Key Files Explained

### `app/backend/server.py`

The entire backend lives in a single file. It is organized as follows:

| Section | Lines | Description |
|---|---|---|
| Imports | 1–35 | All standard library, FastAPI, Pydantic, AI SDK imports |
| Config | 36–67 | Load environment variables, create upload/export dirs |
| Database | 68–73 | AsyncIOMotorClient MongoDB connection |
| AI Clients | 74–82 | Gemini client + Whisper model loaded once at startup |
| App Setup | 83–87 | FastAPI app, APIRouter with `/api` prefix, HTTPBearer |
| Helpers | 89–165 | `now_iso()`, `hash_password()`, `create_token()`, `send_otp_email()`, `extract_json()`, `gemini_json()`, `gemini_text()` |
| Auth Routes | 166–290 | signup, login, me, forgot-password, verify-otp, reset-password |
| Project Routes | 291–390 | CRUD for projects |
| Transcription | 391–430 | Whisper upload + save-text |
| AI Generation | 431–565 | extract, schema, api-spec, wireframe |
| Export Routes | 566–630 | SRS DOCX + wireframe HTML downloads |
| Health | 631–634 | `GET /api/` |
| Middleware | 636–645 | CORS, include router |
| Lifecycle | 647–650 | MongoDB shutdown |

---

### `app/frontend/src/pages/ProjectDetailPage.jsx`

The largest and most complex frontend file (732 lines). Contains:

| Component | Purpose |
|---|---|
| `ProjectDetailPage` | Tab navigation, project header, route-level data loading |
| `TranscriptTab` | Handles Type Text mode, Voice Assistant mode, audio upload fallback |
| `RequirementsTab` | Gemini extraction, requirements display, SRS export |
| `WireframeTab` | Wireframe generation, iframe preview, HTML export |
| `SchemaTab` | DB schema generation and table display |
| `ApiTab` | REST API spec generation and endpoint list |
| `InfoCard` | Reusable card for lists (roles, features, constraints) |
| `ReqGroup` | Reusable grid for FR/NFR cards with priority badges |

---

### `app/frontend/src/components/VoiceRecorder.jsx`

Uses the browser's **MediaRecorder API**:

1. Requests mic permission (`getUserMedia`)
2. Selects best MIME type (`audio/webm;codecs=opus` → `audio/webm`)
3. Records in 250ms chunks
4. On stop: assembles `Blob`, calls `onRecordingComplete({ blob, mimeType })`
5. Parent uploads blob to `POST /api/projects/:id/transcribe`

---

### `app/frontend/src/context/AuthContext.js`

Provides global auth state via React Context:

- `user` — current user object (or `null`)
- `loading` — true while checking existing token
- `login(email, password)` — POST login, store token, set user
- `signup(name, email, password)` — POST signup, store token, set user
- `logout()` — remove token, clear user
- `getToken()` — retrieve token from localStorage (used for download links)

---

### `app/frontend/src/lib/api.js`

Axios instance configured with:
- `baseURL`: `process.env.REACT_APP_BACKEND_URL + "/api"`
- Request interceptor: auto-attaches `Authorization: Bearer <token>` from localStorage

---

## Environment Variables Reference

| Variable | File | Required | Description |
|---|---|---|---|
| `MONGO_URL` | backend `.env` | ✅ | MongoDB connection string |
| `DB_NAME` | backend `.env` | ✅ | Database name |
| `JWT_SECRET` | backend `.env` | ✅ | JWT signing secret (≥32 chars) |
| `JWT_ALGORITHM` | backend `.env` | ✅ | JWT algorithm (HS256) |
| `GEMINI_API_KEY` | backend `.env` | ✅ | Google AI Studio API key |
| `GEMINI_MODEL` | backend `.env` | Optional | Default: `gemini-2.5-flash` |
| `WHISPER_MODEL_SIZE` | backend `.env` | Optional | Default: `base` |
| `SMTP_EMAIL` | backend `.env` | For OTP | Gmail address |
| `SMTP_APP_PASSWORD` | backend `.env` | For OTP | Gmail App Password |
| `REACT_APP_BACKEND_URL` | frontend `.env` | ✅ | Backend base URL |

---

## API Route Map

```
/api
├── /auth
│   ├── POST /signup
│   ├── POST /login
│   ├── GET  /me
│   ├── POST /forgot-password
│   ├── POST /verify-otp
│   └── POST /reset-password
│
└── /projects
    ├── GET  /                    → list all user's projects
    ├── POST /                    → create project
    └── /:id
        ├── GET    /              → get project
        ├── PATCH  /              → update project
        ├── DELETE /              → delete project
        ├── POST   /transcribe    → upload audio → Whisper
        ├── POST   /transcript    → save text transcript
        ├── POST   /extract       → Gemini requirements extraction
        ├── POST   /schema        → Gemini DB schema
        ├── POST   /api-spec      → Gemini REST API spec
        ├── POST   /wireframe     → Gemini HTML wireframe
        ├── GET    /srs.docx      → download SRS (token in query)
        └── GET    /wireframe.html→ download wireframe (token in query)
```
