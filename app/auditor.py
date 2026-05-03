import os
from dotenv import load_dotenv
from app.parser import UniversalParser

load_dotenv()
parser = UniversalParser()

# ─────────────────────────────────────────────
#  TOKEN TRACKING
# ─────────────────────────────────────────────
session_token_log = {}  # { session_id: { input, output, total, provider } }

def log_tokens(session_id: str, input_tokens: int, output_tokens: int, provider: str):
    prev = session_token_log.get(session_id, {"input": 0, "output": 0, "total": 0})
    session_token_log[session_id] = {
        "input":    prev["input"]  + input_tokens,
        "output":   prev["output"] + output_tokens,
        "total":    prev["total"]  + input_tokens + output_tokens,
        "provider": provider,
    }

def get_token_usage(session_id: str) -> dict:
    return session_token_log.get(session_id, {"input": 0, "output": 0, "total": 0, "provider": "none"})


# ─────────────────────────────────────────────
#  PROMPT BUILDER
# ─────────────────────────────────────────────
def build_prompt(content: str, history: list, domain: str) -> str:
    blueprint = parser.load_blueprint(domain)
    history_text = ""
    if history:
        history_text = "\n\nPREVIOUS AUDIT HISTORY (for context):\n"
        for i, item in enumerate(history, 1):
            history_text += f"Q{i}: {item.get('question', '')}\nA{i}: {item.get('answer', '')}\n"

    return f"""You are Icarus — a sharp but clear integrity auditor. Your job is to test whether the person truly understands what they built or wrote.

DOMAIN: {domain}
BLUEPRINT RULES:
{blueprint}
{history_text}

SUBMITTED CONTENT:
{content[:8000]}

INSTRUCTIONS:
Generate ONE question that:
- Is written in plain, direct English — like a mentor talking to a student, not a professor writing a paper
- Targets a specific part of the work (a function, a claim, a decision, a section)
- Asks WHY or WHAT WOULD HAPPEN IF — not just what something does
- Is hard enough to expose shallow understanding, but clear enough that anyone can understand what's being asked
- Avoids jargon, nested clauses, and academic phrasing
- Should feel like: "Hey, explain this to me like I'm going to use it"

BAD example: "Given the inherent subjectivity of integrity metrics, what foundational algorithmic approaches prevent subjective evaluation?"
GOOD example: "Your validateUser() runs before you check the cart. What breaks if you flip that order?"

Occasionally (1 in 5) plant a subtle trap — a question with a wrong assumption baked in. A user who catches it earns a Golden Feather.

Respond ONLY with valid JSON:
{{
  "question": "Your plain-English Socratic question here",
  "hotspot": "The specific part being targeted",
  "wax_adjustment": 2,
  "logic_critique": "Brief internal note on the work quality",
  "is_trap": false,
  "tokens_used": {{"note": "filled by system"}}
}}"""


# ─────────────────────────────────────────────
#  ANTHROPIC (PRIMARY)
# ─────────────────────────────────────────────
def try_anthropic(content: str, history: list, domain: str, session_id: str) -> dict | None:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return None

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        prompt = build_prompt(content, history, domain)

        message = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )

        input_tokens  = message.usage.input_tokens
        output_tokens = message.usage.output_tokens
        log_tokens(session_id, input_tokens, output_tokens, "anthropic")

        import json
        raw = message.content[0].text.strip()
        result = json.loads(raw)
        result["provider"] = "anthropic"
        result["tokens_used"] = get_token_usage(session_id)
        return result

    except Exception as e:
        print(f"[Anthropic error] {e}")
        return None


# ─────────────────────────────────────────────
#  GEMINI (FALLBACK)
# ─────────────────────────────────────────────
def try_gemini(content: str, history: list, domain: str, session_id: str) -> dict | None:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None

    try:
        from google import genai
        import json

        client = genai.Client(api_key=api_key)

        # Find latest flash model
        try:
            models = client.models.list()
            flash_models = [
                m.name for m in models
                if "flash" in m.name.lower() and "experimental" not in m.name.lower()
            ]
            model_name = flash_models[0] if flash_models else "gemini-1.5-flash"
        except Exception:
            model_name = "gemini-1.5-flash"

        print(f"[Gemini fallback] using model: {model_name}")
        prompt = build_prompt(content, history, domain)

        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )

        # Gemini doesn't expose token counts the same way — estimate from chars
        estimated_input  = len(prompt) // 4
        estimated_output = len(response.text) // 4
        log_tokens(session_id, estimated_input, estimated_output, "gemini")

        result = json.loads(response.text)
        result["provider"] = "gemini (fallback)"
        result["tokens_used"] = get_token_usage(session_id)
        return result

    except Exception as e:
        print(f"[Gemini error] {e}")
        return None


# ─────────────────────────────────────────────
#  MAIN ENTRY POINT
# ─────────────────────────────────────────────
def start_audit_iteration(content: str, history: list, domain: str, session_id: str = "default") -> dict:
    """
    Try Anthropic first. If it fails (quota/rate limit/missing key), fall back to Gemini.
    Returns a dict (never a raw string).
    """
    result = try_anthropic(content, history, domain, session_id)
    if result:
        return result

    print("[auditor] Anthropic unavailable — switching to Gemini fallback")
    result = try_gemini(content, history, domain, session_id)
    if result:
        return result

    return {
        "error": "Both Anthropic and Gemini are unavailable. Check your API keys in .env.",
        "question": None,
        "provider": "none",
        "tokens_used": get_token_usage(session_id),
    }