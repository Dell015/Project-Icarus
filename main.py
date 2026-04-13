import os
import docx
import PyPDF2
import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile
from dotenv import load_dotenv

load_dotenv()
# Temporary check to see what models you have access to
print("--- AVAILABLE MODELS ---")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
print("------------------------")
app = FastAPI()
api_key= os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')



@app.get("/")
def home():
    return{"message": "Icarus Universal Brain is Online!"}

@app.post("/audit")
async def upload_file(file: UploadFile = File(...)):
    content = ""
    filename = file.filename.lower()

    if filename.endswith(".txt") or filename.endswith(".py") or filename.endswith(".md"):
        raw_data = await file.read()
        content = raw_data.decode("utf-8")
    elif filename.endswith(".docx"):
        doc = docx.Document(file.file)
        content = "\n".join([para.text for para in doc.paragraphs])
    elif filename.endswith(".pdf"):
        pdf_reader = PyPDF2.PdfReader(file.file)
        content = "\n".join([page.extract_text() for page in pdf_reader.pages])
    else:
        return {"error": "Unsupported file type!"}
    
    # --- SOCRATIC AI LOGIC ---
    # We tell Gemini exactly how to behave (The "System Prompt")
    prompt = f"""
    You are the Icarus Socratic Auditor. 
    Analyze the following content and find 3 'Complexity Hotspots' where the logic is dense or potentially AI-generated.
    For each hotspot, provide:
    1. A quote of the text.
    2. A difficult Socratic question that tests if the user truly understands that logic.
    
    Content to audit:
    {content}
    """

    response = model.generate_content(prompt)

    return {
        "filename": file.filename,
        "audit_results": response.text
    }