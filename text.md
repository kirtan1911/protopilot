Design ProtoPilot - an AI-powered meeting-to-prototype generation web application. **original_problem_statement**: Build a web application called "ProtoPilot" that automates the software requirement-gathering process. Users upload/record meeting audio (mp3/wav), the system transcribes via Whisper, extracts structured requirements via Gemini LLM, and generates: (1) SRS document (PDF/DOCX export), (2) low-fidelity HTML wireframe, (3) DB schema suggestion, (4) REST API spec suggestion. Includes user auth, project dashboard, transcript editor, requirements editor, version history. Target users: dev teams, freelancers, student project teams. **user_choices**: "dark theme UI, glassmorphism style, Outfit font, #0d1117 background, indigo accent, clean SaaS-style dashboard" **key_functionalities**: - Login/Signup page (JWT email/password) - Projects Dashboard (grid/list of projects) - New Project flow (upload audio file with drag-drop) - Transcript editor (editable text view of transcribed audio) - Requirements extraction view (structured cards: functional reqs, non-functional reqs, user roles, core features, constraints — all editable) - SRS document preview & export (PDF/DOCX) - Wireframe preview panel (rendered HTML) - Database schema viewer (tables with columns/relationships) - API spec viewer (REST endpoint list) - Project detail page with tabs for transcript/requirements/SRS/wireframe/schema/api - Loading states for AI processing - Version history sidebar **app_type**: hybrid_fullstack (SaaS dashboard app)

Memory Fetched

Memory Fetched

MONGO_URL="mongodb://localhost:27017" DB_NAME="test_database" CORS_ORIGINS="*"EMERGENT_LLM_KEY=sk-emergent-7A442F20fA41578C3B JWT_SECRET=protopilot-secret-change-in-prod JWT_ALGORITHM=HS256 Downloading lxml-6.1.1-cp311-cp311-manylinux_2_26_aarch64.manylinux_2_28_aarch64.whl (5.0 MB) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 5.0/5.0 MB 22.9 MB/s 0:00:00 Installing collected packages: reportlab, lxml, python-docx

Successfully installed lxml-6.1.1 python-docx-1.2.0 reportlab-5.0.0 Exit code: 0

jq>=1.6.0 typer>=0.9.0 emergentintegrations==0.2.0 python-docx==1.2.0 reportlab==5.0.0 Exit code: 0

http://localhost:8000/docs

I want to implement two major improvements to my ProtoPilot project.
Implement both fully, in order, and confirm each part works before
moving to the next. Do not skip any step.

==================================================
PART 1 — FORGOT PASSWORD WITH OTP VERIFICATION
==================================================

Flow: Email entry → OTP sent to email → OTP verification → Set new
password. NOT a reset-link flow — must be OTP-based.

STEP 1 — ForgotPasswordPage.jsx
   - User enters their registered email
   - Calls POST /api/auth/forgot-password
   - Backend checks if email exists in `users` collection in MongoDB:
       - If NOT found → still return generic success message (security:
         "If this email exists, an OTP has been sent")
       - If found → generate a 6-digit numeric OTP, store it in a new
         MongoDB collection `password_otps` with fields: id, user_id,
         email, otp, expires_at (5 minutes from now), verified (bool,
         default false), created_at
       - Send the OTP via email using Python smtplib + email.mime,
         Gmail SMTP with App Password (read SMTP_EMAIL and
         SMTP_APP_PASSWORD from .env; add placeholders in .env if
         missing and tell me to fill them in)
       - Email template: clean HTML, "Your ProtoPilot password reset
         OTP is: {otp}. This code expires in 5 minutes."
       - Rate limit: max 1 OTP request per email per 60 seconds, return
         clear error if requested too soon
   - On success, redirect to /verify-otp?email=xxx

STEP 2 — VerifyOtpPage.jsx
   - 6-digit OTP input (6 separate boxes, auto-focus next box on input)
   - Countdown timer showing OTP expiry (5:00 counting down)
   - "Verify OTP" button calls POST /api/auth/verify-otp with
     { email, otp }
   - Backend validates: OTP matches, not expired, not already verified
   - If valid: mark password_otps record verified=true, return a
     short-lived reset_token (JWT, 10-min expiry, claim
     {"purpose": "password_reset", "sub": user_id})
   - If invalid/expired: show error "Invalid or expired OTP"
   - "Resend OTP" button — disabled for first 60 seconds, then active,
     re-triggers forgot-password logic

STEP 3 — ResetPasswordPage.jsx
   - Accessed only with a valid reset_token (passed via state/query)
   - Form: New password + Confirm password
   - Calls POST /api/auth/reset-password with { reset_token, new_password }
   - Backend verifies reset_token validity/expiry, hashes new password
     with bcrypt, updates `users` collection, deletes/invalidates the
     used OTP record
   - On success: show success message, redirect to /login

BACKEND CHANGES (server.py):
   - New collection: password_otps (fields listed above)
   - New endpoints: POST /api/auth/forgot-password,
     POST /api/auth/verify-otp, POST /api/auth/reset-password
   - New Pydantic models: ForgotPasswordRequest (email),
     VerifyOtpRequest (email, otp), ResetPasswordRequest
     (reset_token, new_password)
   - Email-sending helper function using smtplib + Gmail SMTP

FRONTEND CHANGES:
   - LoginPage.jsx — add "Forgot password?" link below the password
     field, styled consistently with existing dark theme
   - New pages: ForgotPasswordPage.jsx, VerifyOtpPage.jsx,
     ResetPasswordPage.jsx — same dark theme (bg-gray-900, indigo
     accent #6366f1, Outfit font) as LoginPage/SignupPage
   - Add routes in App.js: /forgot-password, /verify-otp,
     /reset-password

==================================================
PART 2 — REPLACE FILE-UPLOAD-ONLY TRANSCRIPT INPUT
==================================================

Currently the Transcript tab on ProjectDetailPage.jsx only supports
audio file upload. Replace/extend it with TWO input methods, shown as
a tab switcher at the top of the Transcript section:

[ Type Text ]  [ Voice Assistant ]

OPTION A — "Type Text"
   - Large textarea for the user to directly type or paste the meeting
     discussion as text
   - "Save Transcript" button calls existing
     POST /api/projects/{project_id}/transcript endpoint

OPTION B — "Voice Assistant" (live mic recording, Alexa-style)
   - Circular microphone button with pulsing animation while listening
     (Alexa/Google Assistant style)
   - Use browser's MediaRecorder API to record live audio from the
     mic, no file upload needed
   - Show "Listening..." indicator with waveform/pulse animation while
     recording
   - Single toggle button: tap to start, tap to stop
   - On stop, automatically send the recorded audio blob to the
     existing POST /api/projects/{project_id}/transcribe endpoint
     (same Whisper backend logic — no backend changes needed, just
     send the blob as the file)
   - After transcription completes, show the result in an editable
     textarea below (reuse existing transcript display/edit logic)
   - Below the Voice Assistant tab, keep a small fallback link:
     "or upload an audio file instead" — linking to the existing file
     upload, not removed, just de-prioritized

UI Requirements:
   - Keep dark theme, indigo accent (#6366f1), rounded cards, Outfit
     font, consistent with rest of the app
   - Implement in frontend/src/pages/ProjectDetailPage.jsx
   - Create a new reusable component VoiceRecorder.jsx in
     components/ folder for the mic recording logic + UI
   - No backend changes required for Part 2

==================================================
FINAL CHECKS
==================================================

After implementing both parts:
1. Confirm existing login/signup/project functionality still works
   unaffected
2. List every new/modified file with a one-line summary of the change
3. List every new .env variable I need to fill in manually
   (e.g., SMTP_EMAIL, SMTP_APP_PASSWORD) with instructions on how to
   get a Gmail App Password
4. Tell me exactly which pip packages (if any) need to be installed
   for the email-sending part