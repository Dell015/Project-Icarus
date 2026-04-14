import yaml
import docx
import PyPDF2
import io
from pathlib import Path

class UniversalParser:
    def __init__(self):
        self.extension_map = {
            ".py": "code", ".js": "code", ".ts": "code", ".cpp": "code", ".rs": "code",
            ".pdf": "academic", ".docx": "academic", ".md": "academic", ".txt": "academic",
            ".xlsx": "business", ".csv": "business", ".pptx": "business"
        }

    def get_blueprint_type(self, filename: str) -> str:
        ext = Path(filename).suffix.lower()
        return self.extension_map.get(ext, "general")
    
    def load_blueprint(self, domain: str) -> str:
        """Loads the YAML blueprint for the specific domain."""
        file_path = Path("blueprints") / f"{domain}.yaml"
        
        if not file_path.exists():
            # If the file doesn't exist, we return a default message 
            # so the AI still knows what to do.
            return "No specific blueprint found. Use general Socratic mentoring."
        
        try:
            with open(file_path, "r") as f:
                data = yaml.safe_load(f)
                # We return it as a string so it's easy to inject into the AI prompt
                return str(data)
        except Exception as e:
            print(f"Error loading blueprint: {e}")
            return "Error loading specific rules. Fallback to Socratic method."

    def parse_file_content(self, file_bytes: bytes, filename: str) -> str:
        ext = Path(filename).suffix.lower()
        
        # 1. Handle Plain Text (Code, Markdown, TXT)
        if ext in [".txt", ".py", ".md", ".js", ".ts", ".rs", ".cpp"]:
            return file_bytes.decode("utf-8", errors="ignore")
        
        # 2. Handle Microsoft Word (.docx)
        elif ext == ".docx":
            doc_file = io.BytesIO(file_bytes)
            doc = docx.Document(doc_file)
            return "\n".join([para.text for para in doc.paragraphs])
        
        # 3. Handle PDF Files
        elif ext == ".pdf":
            pdf_file = io.BytesIO(file_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            content = ""
            for page in pdf_reader.pages:
                content += page.extract_text() or ""
            return content

        # 4. Fallback for everything else
        return file_bytes.decode("utf-8", errors="ignore")