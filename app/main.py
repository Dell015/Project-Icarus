import os
import json # Added for clean parsing
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from dotenv import load_dotenv

# Import our custom modules
from app.parser import UniversalParser
from app.auditor import start_audit_iteration
from app.auth import signup_user, login_user, get_current_user, UserAuth
from pathlib import Path

load_dotenv()
app = FastAPI()
parser = UniversalParser()

# --- AUTH ROUTES ---

@app.post("/signup")
async def signup(auth: UserAuth):
    return signup_user(auth)

@app.post("/login")
async def login(auth: UserAuth):
    return login_user(auth)

# --- THE AUDIT ROUTE ---

@app.post("/audit")
async def audit_file(
    file: UploadFile = File(...), 
    user_session = Depends(get_current_user)
):
    filename = file.filename
    
    # 1. BUG FIX: Adjusted User ID access
    # Depending on your Supabase version, it might be user_session.id 
    # or user_session.user.id. Using getattr makes it safer.
    user = getattr(user_session, 'user', user_session)
    user_id = user.id 
    
    # 2. Get Domain (via parser.py)
    domain = parser.get_blueprint_type(filename)
    
    # 3. Extract Content
    raw_data = await file.read()
    content = parser.parse_file_content(raw_data, filename)
    
    if not content or content.strip() == "":
        raise HTTPException(status_code=400, detail="Icarus cannot read empty wings.")

    # 4. Trigger Auditor
    verdict_raw = start_audit_iteration(content, [], domain)

    # 5. BUG FIX: Clean the AI response
    # Gemini returns a string. We turn it into a real Python dict 
    # so the frontend doesn't see those ugly \n and \" characters.
    try:
        verdict = json.loads(verdict_raw)
    except Exception:
        verdict = verdict_raw

    return {
        "status": "success",
        "user_id": user_id,
        "filename": filename,
        "domain": domain,
        "verdict": verdict
    }

# Add this to your app/main.py
@app.post("/audit-readme")
async def audit_readme(user_session = Depends(get_current_user)):
    # This finds the directory where main.py lives, then goes up one level to the project root
    base_dir = Path(__file__).resolve().parent.parent
    readme_path = base_dir / "README.md"

    if not readme_path.exists():
        # This will help us debug in the terminal
        print(f"DEBUG: I looked for README here: {readme_path}")
        raise HTTPException(status_code=404, detail=f"README.md not found at {readme_path}")

    content = readme_path.read_text(encoding="utf-8")
    
    # We use "general" domain because it's a markdown/text file
    verdict_raw = start_audit_iteration(content, [], "general")

    try:
        verdict = json.loads(verdict_raw)
    except Exception:
        verdict = verdict_raw

    return {
        "status": "success",
        "filename": "README.md",
        "verdict": verdict
    }