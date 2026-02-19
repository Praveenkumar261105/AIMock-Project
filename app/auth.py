import os
import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import models, database
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
try:
    firebase_admin.get_app()
except ValueError:
    # Use application default credentials or a dummy for local dev if not configured
    try:
        firebase_admin.initialize_app()
    except Exception:
        print("Firebase Admin could not be initialized. Auth will only work with guest-token.")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Development Bypass for Guest Mode
    if token == "guest-token":
        email = "guest@example.com"
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            user = models.User(name="Guest Candidate", email=email, password_hash="GUEST_MODE")
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(token)
        email = decoded_token.get("email")
        uid = decoded_token.get("uid")
        name = decoded_token.get("name", email.split('@')[0] if email else "User")
        
        if not email:
            raise credentials_exception
            
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            user = models.User(name=name, email=email, password_hash="FIREBASE_AUTH")
            db.add(user)
            db.commit()
            db.refresh(user)
            
        return user
    except Exception as e:
        print(f"Token verification failed: {e}")
        raise credentials_exception
