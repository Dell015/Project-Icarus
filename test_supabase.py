import os
from dotenv import load_dotenv
from supabase import create_client

# Clear any cached environment variables
load_dotenv(override=True)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

def create_first_row():
    print("Writing in database...")

    new_row = {
        "persona_name": "Technical Auditor",
        "persona_instruction": "You are a senior cybersecurity expert. Be blunt, technical, and look for vulnerabilities in everything."
    }

    try:
        response = supabase.table("user_settings").insert(new_row).execute()

        print("Success: Row Added!")
        print(f"Data saved: {response.data}")
    except Exception as e:
        print(f"Write Failed: {e}")
if __name__ == "__main__":
    create_first_row()