"# ProtoPilot Test Credentials

## Pre-seeded Test User
- Email: `test@protopilot.dev`
- Password: `test1234`
- Name: Test User

Auth endpoints:
- POST /api/auth/signup { name, email, password }
- POST /api/auth/login { email, password } -> { token, user }
- GET /api/auth/me (Bearer token)
"