from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    transcript: Optional[str] = None
    requirements: Optional[Dict[str, Any]] = None
    schema_spec: Optional[Dict[str, Any]] = None
    api_spec: Optional[Dict[str, Any]] = None
    wireframe_html: Optional[str] = None

class TranscriptUpdate(BaseModel):
    transcript: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str
