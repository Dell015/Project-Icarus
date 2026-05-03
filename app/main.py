import os
import json
import uuid
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.parser import UniversalParser
from app.auditor import start_audit_iteration, get_token_usage
from app.auth import signup_user, login_user, get_current_user, UserAuth

load_dotenv()

app = FastAPI(title="Project Icarus API", version="1.0.0")
parser = UniversalParser()

# ─────────────────────────────────────────────
#  CORS  — allows your Netlify frontend to talk to this backend
#  In production replace "*" with your actual Netlify URL
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (good enough for MVP)
# { session_id: { user_id, filename, domain, history, wax, feathers, status } }
audit_sessions: dict = {}


# ─────────────────────────────────────────────
#  AUTH
# ─────────────────────────────────────────────
@app.post("/signup")
async def signup(auth: UserAuth):
    return signup_user(auth)

@app.post("/login")
async def login(auth: UserAuth):
    return login_user(auth)


# ─────────────────────────────────────────────
#  HEALTH CHECK
# ─────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "Icarus is airborne 🪶", "version": "1.0.0"}


# ─────────────────────────────────────────────
#  START AUDIT  —  upload file, get first question
# ─────────────────────────────────────────────
@app.post("/audit/start")
async def audit_start(
    file: UploadFile = File(...),
    user_session=Depends(get_current_user),
):
    user = getattr(user_session, "user", user_session)
    user_id = user.id

    filename = file.filename
    domain = parser.get_blueprint_type(filename)
    raw_data = await file.read()
    content = parser.parse_file_content(raw_data, filename)

    if not content or content.strip() == "":
        raise HTTPException(status_code=400, detail="Icarus cannot read empty wings.")

    # Create a session
    session_id = str(uuid.uuid4())
    audit_sessions[session_id] = {
        "user_id":  user_id,
        "filename": filename,
        "domain":   domain,
        "content":  content,
        "history":  [],
        "wax":      0,
        "feathers": 0,
        "golden_feathers": 0,
        "status":   "in_progress",  # in_progress | gate_locked | complete | meltdown
        "flight":   1,
    }

    verdict = start_audit_iteration(content, [], domain, session_id)

    if "error" in verdict and verdict["error"]:
        raise HTTPException(status_code=503, detail=verdict["error"])

    audit_sessions[session_id]["pending_question"] = verdict.get("question")
    audit_sessions[session_id]["pending_hotspot"]  = verdict.get("hotspot")
    audit_sessions[session_id]["pending_is_trap"]  = verdict.get("is_trap", False)

    return {
        "session_id":    session_id,
        "filename":      filename,
        "domain":        domain,
        "flight":        1,
        "question":      verdict.get("question"),
        "hotspot":       verdict.get("hotspot"),
        "logic_critique": verdict.get("logic_critique"),
        "wax":           audit_sessions[session_id]["wax"],
        "feathers":      audit_sessions[session_id]["feathers"],
        "status":        "in_progress",
        "provider":      verdict.get("provider"),
        "tokens_used":   verdict.get("tokens_used"),
    }


# ─────────────────────────────────────────────
#  SUBMIT ANSWER  —  evaluate, update wax/feathers
# ─────────────────────────────────────────────
@app.post("/audit/{session_id}/answer")
async def submit_answer(
    session_id: str,
    request: Request,
    user_session=Depends(get_current_user),
):
    session = audit_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    if session["status"] == "gate_locked":
        raise HTTPException(status_code=403, detail="Gate is locked. Re-upload your revised file first.")

    body = await request.json()
    answer = body.get("answer", "").strip()
    if not answer:
        raise HTTPException(status_code=400, detail="Answer cannot be empty.")

    question  = session.get("pending_question", "")
    is_trap   = session.get("pending_is_trap", False)
    content   = session["content"]
    domain    = session["domain"]

    # Build evaluation prompt
    eval_prompt = f"""You are evaluating a user's answer in an Icarus audit.

QUESTION ASKED: {question}
IS THIS A TRAP QUESTION (flawed premise): {is_trap}
USER'S ANSWER: {answer}
ORIGINAL WORK CONTEXT: {content[:3000]}

Evaluate strictly. Return JSON only:
{{
  "result": "pass" | "fail" | "golden_feather",
  "reasoning": "Why this answer passes or fails",
  "follow_up": "Optional follow-up question if the answer was partially correct, else null",
  "wax_delta": -1 to 3
}}

Rules:
- "pass": answer demonstrates genuine understanding
- "fail": answer is vague, wrong, or bluffing  
- "golden_feather": user correctly identified the trap question's flawed premise
- If is_trap is true and user didn't catch it, treat as normal pass/fail
- wax_delta: positive means add wax (bad answer), negative means reduce wax (great answer)"""

    # Use the same provider chain for evaluation
    import anthropic as ant_module
    import os

    eval_result = {}
    try:
        ant_client = ant_module.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        msg = ant_client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=512,
            messages=[{"role": "user", "content": eval_prompt}],
        )
        eval_result = json.loads(msg.content[0].text.strip())
    except Exception:
        # Gemini fallback for evaluation
        try:
            from google import genai
            gclient = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
            resp = gclient.models.generate_content(
                model="gemini-2.5-flash",
                contents=eval_prompt,
                config={"response_mime_type": "application/json"},
            )
            eval_result = json.loads(resp.text)
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Evaluation failed: {e}")

    result     = eval_result.get("result", "fail")
    wax_delta  = int(eval_result.get("wax_delta", 2))
    reasoning  = eval_result.get("reasoning", "")
    follow_up  = eval_result.get("follow_up")

    # Update session
    session["history"].append({
        "question": question,
        "answer":   answer,
        "result":   result,
        "reasoning": reasoning,
    })

    if result == "golden_feather":
        session["feathers"]        += 2
        session["golden_feathers"] += 1
        session["wax"]              = max(0, session["wax"] - 2)
    elif result == "pass":
        session["feathers"] += 1
        session["wax"]       = max(0, session["wax"] + min(wax_delta, 0))
    else:  # fail
        session["wax"] += max(wax_delta, 1)

    # Meltdown check
    if session["wax"] >= 10:
        session["status"] = "meltdown"
        return {
            "result":    result,
            "reasoning": reasoning,
            "status":    "meltdown",
            "wax":       session["wax"],
            "feathers":  session["feathers"],
            "message":   "Project Meltdown. Your wings could not sustain the flight. Review the audit history and try again.",
            "tokens_used": get_token_usage(session_id),
        }

    # Gate lock after 2 fails in a row
    recent = session["history"][-2:] if len(session["history"]) >= 2 else []
    consecutive_fails = all(h["result"] == "fail" for h in recent) and len(recent) == 2

    if consecutive_fails:
        session["status"] = "gate_locked"
        return {
            "result":    result,
            "reasoning": reasoning,
            "follow_up": follow_up,
            "status":    "gate_locked",
            "wax":       session["wax"],
            "feathers":  session["feathers"],
            "message":   "Gate locked. You must revise your work and re-upload before continuing.",
            "tokens_used": get_token_usage(session_id),
        }

    # Generate next question
    next_verdict = start_audit_iteration(content, session["history"], domain, session_id)
    session["pending_question"] = next_verdict.get("question")
    session["pending_hotspot"]  = next_verdict.get("hotspot")
    session["pending_is_trap"]  = next_verdict.get("is_trap", False)
    session["flight"] += 1

    # Complete after 9 questions (3 flights of 3)
    if len(session["history"]) >= 9:
        session["status"] = "complete"

    return {
        "result":      result,
        "reasoning":   reasoning,
        "follow_up":   follow_up,
        "status":      session["status"],
        "wax":         session["wax"],
        "feathers":    session["feathers"],
        "flight":      session["flight"],
        "next_question": next_verdict.get("question") if session["status"] == "in_progress" else None,
        "next_hotspot":  next_verdict.get("hotspot")  if session["status"] == "in_progress" else None,
        "provider":    next_verdict.get("provider"),
        "tokens_used": next_verdict.get("tokens_used"),
    }


# ─────────────────────────────────────────────
#  RE-UPLOAD  —  unlock the gate
# ─────────────────────────────────────────────
@app.post("/audit/{session_id}/reupload")
async def reupload_file(
    session_id: str,
    file: UploadFile = File(...),
    user_session=Depends(get_current_user),
):
    session = audit_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    raw_data    = await file.read()
    new_content = parser.parse_file_content(raw_data, file.filename)

    if new_content.strip() == session["content"].strip():
        raise HTTPException(
            status_code=400,
            detail="Icarus detects no meaningful changes. Revise your work before re-uploading."
        )

    # Update content and unlock gate
    session["content"] = new_content
    session["status"]  = "in_progress"

    next_verdict = start_audit_iteration(new_content, session["history"], session["domain"], session_id)
    session["pending_question"] = next_verdict.get("question")
    session["pending_hotspot"]  = next_verdict.get("hotspot")
    session["pending_is_trap"]  = next_verdict.get("is_trap", False)

    return {
        "status":        "gate_unlocked",
        "message":       "Gate unlocked. Your revision has been accepted. The audit continues.",
        "next_question": next_verdict.get("question"),
        "next_hotspot":  next_verdict.get("hotspot"),
        "wax":           session["wax"],
        "feathers":      session["feathers"],
        "tokens_used":   next_verdict.get("tokens_used"),
    }


# ─────────────────────────────────────────────
#  TRANSCRIPT  —  full audit summary
# ─────────────────────────────────────────────
@app.get("/audit/{session_id}/transcript")
async def get_transcript(session_id: str, user_session=Depends(get_current_user)):
    session = audit_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    total_questions = len(session["history"])
    score = 0
    if total_questions > 0:
        score = round((session["feathers"] / (session["feathers"] + max(session["wax"], 1))) * 100)

    verdict = "CERTIFIED" if score >= 70 else "NEEDS REVISION" if score >= 40 else "MELTDOWN"

    return {
        "session_id":      session_id,
        "filename":        session["filename"],
        "domain":          session["domain"],
        "verdict":         verdict,
        "score":           score,
        "wax":             session["wax"],
        "feathers":        session["feathers"],
        "golden_feathers": session["golden_feathers"],
        "total_questions": total_questions,
        "history":         session["history"],
        "tokens_used":     get_token_usage(session_id),
        "status":          session["status"],
    }


# ─────────────────────────────────────────────
#  TOKEN USAGE  —  for the UI meter
# ─────────────────────────────────────────────
@app.get("/audit/{session_id}/tokens")
async def token_usage(session_id: str, user_session=Depends(get_current_user)):
    return get_token_usage(session_id)