import bcrypt
import jwt
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import logging
from config import JWT_SECRET, JWT_ALG, SMTP_EMAIL, SMTP_APP_PASSWORD

logger = logging.getLogger(__name__)

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_token(user_id: str, extra: Optional[Dict] = None, expires_delta: timedelta = timedelta(days=7)) -> str:
    payload: Dict[str, Any] = {"sub": user_id, "exp": datetime.now(timezone.utc) + expires_delta}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def send_otp_email(to_email: str, otp: str) -> None:
    if not SMTP_EMAIL or not SMTP_APP_PASSWORD:
        raise RuntimeError("SMTP credentials not configured. Set SMTP_EMAIL and SMTP_APP_PASSWORD in .env")

    html_body = f"""
    <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#0d1117;color:#e5e7eb;padding:32px;border-radius:12px;border:1px solid #21262d;">
      <h2 style="color:#818cf8;margin-top:0;">ProtoPilot — Password Reset</h2>
      <p>Your one-time password (OTP) for resetting your ProtoPilot account password is:</p>
      <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#fff;background:#161b22;padding:20px;border-radius:8px;text-align:center;border:1px solid #30363d;">{otp}</div>
      <p style="color:#9ca3af;margin-top:24px;font-size:14px;">This code expires in <strong style="color:#e5e7eb;">5 minutes</strong>. Do not share it with anyone.</p>
    </div>
    """
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "ProtoPilot — Your Password Reset OTP"
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(SMTP_EMAIL, SMTP_APP_PASSWORD)
        smtp.sendmail(SMTP_EMAIL, to_email, msg.as_string())
