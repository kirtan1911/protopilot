# ProtoPilot 🚀

> **AI-powered meeting-to-prototype generation platform.**  
> Upload or record a meeting → get transcription, structured requirements, SRS document, DB schema, REST API spec, and a live wireframe — all powered by Gemini AI and Whisper.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)
![React](https://img.shields.io/badge/react-19-61dafb.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.110-009688.svg)
![MongoDB](https://img.shields.io/badge/mongodb-7-green.svg)

---

## 📋 Table of Contents

- [Description](#description)
- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## 📝 Description

**ProtoPilot** automates the software requirement-gathering process. Dev teams, freelancers, and student project teams can upload or record a meeting, and ProtoPilot will:

1. Transcribe the audio using **OpenAI Whisper**
2. Extract structured requirements using **Google Gemini AI**
3. Generate a professional **SRS document** (DOCX export)
4. Create a **low-fidelity HTML wireframe**
5. Suggest a **relational DB schema**
6. Propose a **REST API specification**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | JWT email/password login & signup |
| 🔑 **Forgot Password** | OTP-based reset via Gmail SMTP |
| 🎙️ **Audio Upload** | MP3, WAV, M4A, WebM (max 25MB) |
| 🎤 **Live Voice Recording** | Alexa-style in-browser mic recording |
| ✍️ **Type Text** | Paste meeting notes directly |
| 🤖 **AI Requirements** | Structured functional/non-functional reqs |
| 📄 **SRS Export** | Download as `.docx` |
| 🖼️ **Wireframe** | AI HTML wireframe with live preview |
| 🗄️ **DB Schema** | Relational tables with relationships |
| 🔌 **API Spec** | REST endpoints with auth flags |
| 🌑 **Dark Theme** | Glassmorphism SaaS UI |

---

## 🛠 Technologies

### Backend
- **FastAPI** 0.110 — REST API framework
- **Motor** + **MongoDB** — Async database
- **OpenAI Whisper** — Audio transcription
- **Google Gemini 2.5 Flash** — LLM for AI generation
- **PyJWT** + **bcrypt** — Authentication
- **python-docx** — DOCX generation
- **smtplib** — OTP email delivery

### Frontend
- **React 19** with Create React App + CRACO
- **Tailwind CSS** — Styling
- **React Router v7** — Routing
- **Axios** — API calls
- **Lucide React** — Icons
- **Sonner** — Toast notifications
- **Outfit + JetBrains Mono** — Typography

---

## 📁 Project Structure

```
ProtoPilot/
├── app/
│   ├── backend/
│   │   ├── server.py          # FastAPI app — all routes, AI logic, auth
│   │   ├── requirements.txt   # Python dependencies
│   │   ├── .env               # Secrets (not committed)
│   │   ├── .gitignore
│   │   ├── uploads/           # Audio files (runtime, gitignored)
│   │   └── exports/           # Generated docs (runtime, gitignored)
│   └── frontend/
│       ├── public/
│       │   └── index.html
│       ├── src/
│       │   ├── App.js              # Routes
│       │   ├── index.js            # Entry point
│       │   ├── index.css           # Global styles + animations
│       │   ├── App.css
│       │   ├── components/
│       │   │   ├── Layout.jsx      # Navbar + page wrapper
│       │   │   └── VoiceRecorder.jsx # Live mic recording
│       │   ├── context/
│       │   │   └── AuthContext.js  # JWT auth state
│       │   ├── lib/
│       │   │   └── api.js          # Axios instance
│       │   └── pages/
│       │       ├── LandingPage.jsx
│       │       ├── LoginPage.jsx
│       │       ├── SignupPage.jsx
│       │       ├── ForgotPasswordPage.jsx
│       │       ├── VerifyOtpPage.jsx
│       │       ├── ResetPasswordPage.jsx
│       │       ├── DashboardPage.jsx
│       │       └── ProjectDetailPage.jsx
│       ├── package.json
│       ├── tailwind.config.js
│       └── craco.config.js
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── DEBUGGING-REPORT.md
├── AI-DEVELOPMENT-REPORT.md
└── PROJECT-STRUCTURE.md
```

---

## ⚙️ Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** + **Yarn** (for frontend)
- **MongoDB** (local or Atlas)
- **Google Gemini API key** — [Get one here](https://aistudio.google.com/apikey)
- **ffmpeg** — Required by Whisper for audio processing

### Install ffmpeg

```bash
# Windows (with chocolatey)
choco install ffmpeg

# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/protopilot.git
cd protopilot
```

### 2. Backend setup

```bash
cd app/backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp ../../.env.example .env
# Edit .env with your values
```

### 3. Frontend setup

```bash
cd app/frontend

# Install dependencies
yarn install

# Copy and configure environment
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env
```

---

## 🔑 Configuration

Copy `.env.example` to `app/backend/.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `MONGO_URL` | ✅ | MongoDB connection string |
| `DB_NAME` | ✅ | Database name |
| `JWT_SECRET` | ✅ | Random secret (min 32 chars) |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `SMTP_EMAIL` | For OTP | Gmail address |
| `SMTP_APP_PASSWORD` | For OTP | Gmail App Password |

---

## 🏃 Running Locally

### Start backend

```bash
cd app/backend
.venv\Scripts\activate
uvicorn server:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Start frontend

```bash
cd app/frontend
yarn start
```

App available at: http://localhost:3000

---

## 🐳 Docker Deployment

```bash
# Copy env file
cp .env.example app/backend/.env
# Edit app/backend/.env with your values

# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down
```

---

## 🌐 Environment Variables

See [`.env.example`](.env.example) for the full list with descriptions.

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Auth endpoints use `Bearer <token>`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Register new account |
| POST | `/api/auth/login` | No | Login and get JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/forgot-password` | No | Send OTP to email |
| POST | `/api/auth/verify-otp` | No | Verify OTP, get reset token |
| POST | `/api/auth/reset-password` | No | Set new password |
| GET | `/api/projects` | Yes | List user's projects |
| POST | `/api/projects` | Yes | Create new project |
| GET | `/api/projects/:id` | Yes | Get project details |
| PATCH | `/api/projects/:id` | Yes | Update project |
| DELETE | `/api/projects/:id` | Yes | Delete project |
| POST | `/api/projects/:id/transcribe` | Yes | Transcribe audio file |
| POST | `/api/projects/:id/transcript` | Yes | Save text transcript |
| POST | `/api/projects/:id/extract` | Yes | Extract requirements with AI |
| POST | `/api/projects/:id/schema` | Yes | Generate DB schema |
| POST | `/api/projects/:id/api-spec` | Yes | Generate API spec |
| POST | `/api/projects/:id/wireframe` | Yes | Generate wireframe |
| GET | `/api/projects/:id/srs.docx` | Token | Download SRS document |
| GET | `/api/projects/:id/wireframe.html` | Token | Download wireframe |

---

## 📸 Screenshots

> _Add screenshots here once the app is running_

| Landing Page | Dashboard | Project Detail |
|---|---|---|
| ![Landing](screenshots/landing.png) | ![Dashboard](screenshots/dashboard.png) | ![Detail](screenshots/detail.png) |

---

## 🔮 Future Improvements

- [ ] PDF export for SRS document
- [ ] Version history for requirements
- [ ] Team collaboration / shared projects
- [ ] Figma plugin integration
- [ ] GitHub Issues auto-creation from requirements
- [ ] Custom Whisper model fine-tuning
- [ ] Multi-language transcription support
- [ ] AI-powered requirement quality scoring

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📜 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 👤 Author

**ProtoPilot** was built to accelerate the software discovery and specification process using AI.

- GitHub: [@yourusername](https://github.com/yourusername)

---

## 📝 Git Commands

```bash
# Clone
git clone https://github.com/yourusername/protopilot.git

# Create feature branch
git checkout -b feature/my-feature

# Stage and commit
git add .
git commit -m "feat: add my feature"

# Push
git push origin feature/my-feature

# Pull latest
git pull origin main

# Create tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```
