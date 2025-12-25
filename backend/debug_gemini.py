
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"DEBUG: Loaded API Key: {api_key[:10]}... (Length: {len(api_key) if api_key else 0})")

if not api_key:
    print("ERROR: API Key is missing in .env")
    exit()

try:
    genai.configure(api_key=api_key)
    print("DEBUG: Listing available models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
            
    # Try gemini-1.5-flash-latest
    print("\nDEBUG: Trying specific model 'gemini-1.5-flash'...")
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Hello?")
    print("SUCCESS: " + response.text)

except Exception as e:
    print(f"\nERROR: {e}")
