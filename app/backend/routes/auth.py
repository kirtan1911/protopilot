from fastapi import APIRouter, HTTPException, Depends
from database import db
from schemas import UserSignup, UserLogin, ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest
from utils import hash_password, verify_password, create_token, send_otp_email, now_iso
from deps import get_current_user
import uuid
from config import JWT_SECRET, JWT_ALG
import jwt

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
async def signup(data: UserSignup):
    user = await db.users.find_one({"email": data.email})
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "created_at": now_iso()
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_doc["id"])
    return {"token": token, "user": {"id": user_doc["id"], "name": user_doc["name"], "email": user_doc["email"]}}

@router.post("/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await db.users.find_one({"email": data.email})
    if not user:
        return {"message": "If email exists, OTP sent"}
    import random
    otp = str(random.randint(100000, 999999))
    await db.users.update_one({"email": data.email}, {"$set": {"reset_otp": otp}})
    try:
        send_otp_email(data.email, otp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "If email exists, OTP sent"}

@router.post("/verify-otp")
async def verify_otp(data: VerifyOtpRequest):
    user = await db.users.find_one({"email": data.email, "reset_otp": data.otp})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    reset_token = create_token(user["id"], extra={"action": "reset"})
    return {"reset_token": reset_token}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    try:
        payload = jwt.decode(data.reset_token, JWT_SECRET, algorithms=[JWT_ALG])
        user_id = payload.get("sub")
        action = payload.get("action")
        if action != "reset":
            raise HTTPException(status_code=400, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    await db.users.update_one({"id": user_id}, {"$set": {"password_hash": hash_password(data.new_password), "reset_otp": None}})
    return {"message": "Password reset successful"}

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"id": user.get("id"), "name": user.get("name"), "email": user.get("email")}

