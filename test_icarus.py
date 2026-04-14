import requests

BASE_URL = "http://127.0.0.1:8000"
EMAIL = "testuser@example.com"
PASSWORD = "password123"

def run_test():
    print("🚀 Starting Icarus Flight Test...")

    # --- STEP 1: LOGIN ---
    print("\n🔑 Logging in...")
    login_data = {"email": EMAIL, "password": PASSWORD}
    login_res = requests.post(f"{BASE_URL}/login", json=login_data)
    
    if login_res.status_code != 200:
        print(f"❌ Login Failed: {login_res.text}")
        return

    token = login_res.json().get("session", {}).get("access_token")
    print("✅ Login Successful. Token acquired.")

    # --- STEP 2: AUDIT README (Internal Scan) ---
    print("\n📖 Requesting Root README Audit...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Notice: No 'files' dictionary here, just a POST request
    audit_res = requests.post(f"{BASE_URL}/audit-readme", headers=headers)

    if audit_res.status_code == 200:
        print("☀️  ICARUS README VERDICT:")
        # Pretty-print the result
        import json
        print(json.dumps(audit_res.json(), indent=2))
    else:
        print(f"❌ Audit Failed: {audit_res.status_code}")
        print(audit_res.text)

if __name__ == "__main__":
    run_test()