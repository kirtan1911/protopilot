# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes    |

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities via public GitHub Issues.**

If you discover a security vulnerability in ProtoPilot, please report it by emailing:

📧 **security@protopilot.dev** _(or open a private GitHub Security Advisory)_

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive a response within **72 hours**. We take all reports seriously.

---

## Security Measures Implemented

### Authentication
- Passwords are hashed using **bcrypt** (cost factor 12)
- JWTs are signed with a 64-character hex secret
- Tokens expire after **7 days** (auth) or **10 minutes** (password reset)
- Password reset tokens include a `purpose: password_reset` claim to prevent misuse

### OTP / Forgot Password
- 6-digit numeric OTPs expire after **5 minutes**
- Rate-limited: max **1 OTP request per email per 60 seconds**
- Generic success message returned even if email doesn't exist (prevents email enumeration)
- OTP records are deleted after successful password reset

### API Security
- All project routes require Bearer JWT authentication
- Users can only access their own projects (`user_id` filter on all DB queries)
- File upload: restricted to allowed audio MIME types only
- File upload: max 25MB size limit enforced server-side
- Export endpoints use token-in-query-param (not cookies) to support browser `<a>` link downloads

### Secrets
- **No secrets are committed to the repository**
- All secrets are in `.env` files which are listed in `.gitignore`
- `.env.example` contains only placeholder values

### CORS
- CORS origins are explicitly configured via `CORS_ORIGINS` environment variable
- Defaults to `http://localhost:3000` in development

### Input Validation
- All request bodies validated with **Pydantic v2** models
- Email addresses validated with `pydantic[email]` / `email-validator`
- Passwords validated for minimum 6 character length

---

## Known Limitations

- The application does not implement per-user rate limiting on general API endpoints (only on OTP sending)
- Audio files are stored on the server filesystem; for production, use cloud storage (S3, GCS) with proper access controls
- The Gemini API key is stored in the backend `.env` file — ensure the server is not publicly readable
