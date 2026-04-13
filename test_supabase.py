import os
from dotenv import load_dotenv
from supabase import create_client

# Clear any cached environment variables
load_dotenv(override=True)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

def test_final():
    print(f"Testing URL: {url}")
    # Verify we are using the legacy key format
    if not key.startswith("ey"):
        print("❌ STOP: You are still using the 'sb_secret' key. Please use the 'ey...' legacy key.")
        return

    try:
        # Standard initialization (Legacy keys don't need special headers)
        supabase = create_client(url, key)
        
        # Simple health check on your table
        response = supabase.table("user_settings").select("*").limit(1).execute()
        
        print("✅ CONNECTION SUCCESSFUL!")
        print("The 'ey...' key worked perfectly.")
        
    except Exception as e:
        print(f"❌ FAILED: {e}")

if __name__ == "__main__":
    test_final()