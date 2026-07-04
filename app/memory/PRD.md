"# ProtoPilot — Product Requirements Document

## Original problem
Build \"ProtoPilot\": an AI-powered tool that turns a meeting audio recording into:
1. A structured SRS document (DOCX export)
2. A low-fidelity HTML wireframe
3. A suggested relational DB schema
4. A REST API specification

Target users: dev teams, freelancers, student project teams. Originally specified
as an Electron + SQL Server desktop app; adapted to a **web app** (React + FastAPI + MongoDB)
that follows all functional requirements in the PRD.

## Architecture
- **Frontend**: React 19 + React Router + TailwindCSS + shadcn/ui + sonner toasts
- **Backend**: FastAPI on 8001, /api prefix
- **DB**: MongoDB (collections: users, projects)
- **AI**: Emergent Universal LLM key
  - Gemini 3 Flash (`gemini-3-flash-preview`) for extraction, schema, API, wireframe
  - Whisper (`whisper-1`) for audio transcription
- **Auth**: JWT (PyJWT) + bcrypt
- **Exports**: python-docx for SRS, plain HTML for wireframe

## User personas
1. **Freelancer / Dev lead** — receives client meeting audio, needs polished spec fast.
2. **Student project team** — needs to produce SRS/ER/API docs for academic submission.

## Implemented (initial release — 2026-02)
- Landing page with hero + 6 feature grid
- Signup / Login (JWT, bcrypt)
- Dashboard: list/create/delete projects, status badges
- Project detail page with 5 tabs:
  - **Transcript**: drag-drop audio upload → Whisper transcription, editable textarea, save
  - **Requirements**: Gemini extraction (FRs, NFRs, roles, features, constraints, assumptions), export as DOCX
  - **Wireframe**: Gemini-generated Tailwind HTML in sandboxed iframe, export as HTML
  - **Schema**: Gemini-suggested relational tables with columns/relationships
  - **API Spec**: Gemini-suggested REST endpoints with method badges
- Token-secured download endpoints for SRS DOCX and wireframe HTML

## Backlog / Next
- P1: Auth-protect SRS/wireframe downloads with httpOnly cookies or short-lived signed URLs (currently uses ?token= query)
- P1: Version history per project (track edits over time)
- P2: AI chat (\"Refine requirement X\")
- P2: Wireframe regeneration per-feature
- P2: ER-diagram visualization (mermaid) for schema
- P2: Multi-user collaboration

## Test credentials
See `/app/memory/test_credentials.md`
"