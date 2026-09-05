# Changelog

All notable changes to ProtoPilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-07-16

### Added — Core Features
- JWT-based user authentication (signup, login, logout)
- OTP-based forgot-password flow via Gmail SMTP
  - `POST /api/auth/forgot-password` — sends 6-digit OTP
  - `POST /api/auth/verify-otp` — validates OTP, returns short-lived reset token
  - `POST /api/auth/reset-password` — sets new password
- Project dashboard (create, list, delete projects)
- Audio transcription via OpenAI Whisper (MP3, WAV, M4A, WebM, up to 25MB)
- **Type Text** input mode — paste/type meeting notes directly
- **Voice Assistant** input mode — live in-browser mic recording (MediaRecorder API)
- AI requirements extraction via Google Gemini 2.5 Flash
- SRS document export (`.docx` via python-docx)
- Low-fidelity HTML wireframe generation
- Relational DB schema suggestion
- REST API specification suggestion
- Wireframe HTML export

### Added — Frontend Pages
- `LandingPage.jsx` — public marketing page
- `LoginPage.jsx` — email/password login with Forgot Password link
- `SignupPage.jsx` — account registration
- `ForgotPasswordPage.jsx` — email entry for OTP flow
- `VerifyOtpPage.jsx` — 6-box OTP input with countdown & resend
- `ResetPasswordPage.jsx` — new password form
- `DashboardPage.jsx` — project grid with status badges
- `ProjectDetailPage.jsx` — tabbed detail view (Transcript / Requirements / Wireframe / Schema / API)

### Added — Components
- `Layout.jsx` — sticky navbar with user info and logout
- `VoiceRecorder.jsx` — Alexa-style mic button with pulse animation and waveform

### Added — Infrastructure
- `Dockerfile` — Python 3.11 backend image
- `docker-compose.yml` — orchestrates MongoDB + backend
- `.env.example` — documented environment variable template
- `.gitignore` — comprehensive ignore rules for Python, Node, OS, editors
- `LICENSE` — MIT

### Added — Documentation
- `README.md` — full project documentation
- `CHANGELOG.md` — this file
- `CONTRIBUTING.md` — contribution guidelines
- `SECURITY.md` — security policy and reporting
- `CODE_OF_CONDUCT.md` — community standards
- `DEBUGGING-REPORT.md` — all bugs found and fixed
- `AI-DEVELOPMENT-REPORT.md` — AI development report (Gujarati)
- `PROJECT-STRUCTURE.md` — folder tree with explanations

### Fixed
- Backend `CORSMiddleware` ordering (must be registered before router include)
- Removed deprecated `starlette.middleware.cors` import (replaced with `fastapi.middleware.cors`)
- Removed unused `status` import from FastAPI
- Removed unused `Upload` and `X` lucide-react imports in `ProjectDetailPage`
- Removed dead Create React App boilerplate from `App.css`
- Fixed incorrect branding in `LandingPage` footer ("Emergent Universal LLM" → "Gemini AI · Whisper")
- Fixed `setProject` calls to use functional update pattern to avoid stale closure bugs
- Added missing `htmlFor`/`id` label associations for accessibility
- Added `autoComplete` attributes to all auth form inputs
- Added `aria-label`, `aria-hidden`, `aria-pressed`, `role="tab"`, `role="tabpanel"` throughout
- Added client-side password length validation on signup

### Security
- Updated Gemini API key to provided production key
- JWT secret is a 64-char hex string (configurable via `.env`)
- OTP rate-limited: max 1 request per email per 60 seconds
- OTP expires after 5 minutes
- Reset token is short-lived JWT (10-minute expiry) with `purpose: password_reset` claim
- Used OTP records deleted on successful password reset
- Whisper audio files stored server-side (not exposed via API)
- Secrets never committed — all in `.env` (gitignored)

### Performance
- Whisper transcription runs in `asyncio.to_thread` to avoid blocking the event loop
- SMTP email sending also uses `asyncio.to_thread`
- Gemini API calls use `aio` async client
- Frontend uses lazy loading via React Router
- Shimmer skeleton loading states prevent layout shift
