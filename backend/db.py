import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from backend/.env first, then fallback to project root .env.
backend_env_path = os.path.join(os.path.dirname(__file__), ".env")
root_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(backend_env_path)
load_dotenv(root_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: SUPABASE_URL or SUPABASE_KEY is missing in environment variables.")

# Create the Supabase client
supabase: Client = create_client(
    SUPABASE_URL or "https://placeholder.supabase.co", 
    SUPABASE_KEY or "placeholder_key"
)