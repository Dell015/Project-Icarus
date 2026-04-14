from fastapi import Header, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os

# Initialize Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

class UserAuth(BaseModel):
    email: str
    password: str

def signup_user(auth: UserAuth):
    return supabase.auth.sign_up({"email": auth.email, "password": auth.password})

def login_user(auth: UserAuth):
    return supabase.auth.sign_in_with_password({"email": auth.email, "password": auth.password})

# Change this line in app/auth.py
def get_current_user(authorization: str = Header(None)):
    """Verifies the JWT token and returns the user object."""
    # Note: FastAPI automatically maps 'authorization' to the 'Authorization' header
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    try:
        # Update the variable name here too
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session")