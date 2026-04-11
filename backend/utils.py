from datetime import datetime
from typing import Optional
import os
import uuid
from groq import Groq
from twilio.rest import Client
from gtts import gTTS

# Twilio Setup (Get these from your Twilio Console)
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM") # Default Twilio Sandbox Number
TWILIO_SMS_FROM = os.getenv("TWILIO_SMS_FROM") # Your Twilio Phone Number

twilio_client = Client(TWILIO_SID, TWILIO_AUTH)

# Groq Setup
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

audio_lang_codes = {
    "hindi": "hi", "marathi": "mr", "tamil": "ta",
    "bengali": "bn", "telugu": "te", "english": "en-in"
}

def calculate_detention_days(date_str: Optional[str]) -> int:
    """Calculates days elapsed since the date string or datetime object provided."""
    if not date_str:
        return 0
    try:
        # Handle both string (ISO format) and datetime objects
        if isinstance(date_str, str):
            dt = datetime.fromisoformat(date_str)
        else:
            # Assume it's already a datetime object
            dt = date_str
        
        return (datetime.now() - dt).days
    except (ValueError, TypeError, AttributeError):
        return 0

def format_gemma_prompt(case_data: dict) -> str:
    """Formats the prompt to send to the Gemma model."""
    prompt = f"""
    You are an intelligent legal prioritization AI in the system 'JusticeGrid'.
    Analyze the following undertrial case details and return a strictly formatted JSON object.
    
    Case Details:
    - IPC Section: {case_data.get('assigned_ipc')}
    - BNS Section: {case_data.get('assigned_bns')}
    - Bailable Status: {case_data.get('bailable')}
    - Max Sentence (Years): {case_data.get('max_sentence')}
    - Detention Days: {case_data.get('detention_days')}
    - City: {case_data.get('city')}
    - Crime Description: {case_data.get('crime_description')}
    - Victim Age: {case_data.get('victim_age')}
    - Victim Gender: {case_data.get('victim_gender')}
    
    Calculate the following and return ONLY a JSON response:
    1. "priority_score": an integer from 0 to 200 representing urgency. Higher is more urgent.
    2. "priority_level": "HIGH", "MEDIUM", or "LOW". (HIGH if score > 180, MEDIUM if > 120, else LOW)
    3. "adjournment_prob": an estimated percentage (0-100) of this case being adjourned, based on generic behavior for similar cases.
    4. "confidence": a float between 0.0 and 1.0 representing your confidence in this analysis.
    5. "conflict_flag": "SERIOUS_OFFENCE" if max_sentence >= 20, else null.
    6. "reasoning": a concise, one-sentence explanation of why the priority score was assigned.
    
    Respond strictly with valid JSON.
    Example: {{"priority_score": 150, "priority_level": "MEDIUM", "adjournment_prob": 60, "confidence": 0.85, "conflict_flag": null, "reasoning": "High detention days and serious IPC section warrant medium-high priority."}}
    """
    return prompt.strip()

# --- Helper 1: Enhanced Translation Engine ---
def generate_translated_message(case_data: dict) -> str:
    """Builds a rich summary using all available Supabase columns."""
    
    # Base status logic
    status = "Eligible for Bail. Action Required." if case_data.get("eligible") else "Awaiting Legal Processing."
    if case_data.get("surety_blocked"):
         status = f"Bail Granted, but Surety of Rs. {case_data.get('surety_amount', 0)} is pending."

    # Build a comprehensive English baseline utilizing the new columns
    english_baseline = f"Case Update for ID: {case_data.get('report_number')}."
    english_baseline += f"\nLocation: {case_data.get('prison_name', 'Local Jail')}, {case_data.get('city', 'Unknown City')}."
    if case_data.get("court_name"):
        english_baseline += f"\nCourt: {case_data.get('court_name')}."
    english_baseline += f"\nCurrent Status: {status}"
    if case_data.get("hearing_outcome"):
        english_baseline += f"\nRecent Outcome: {case_data.get('hearing_outcome')}"
    
    target_language = case_data.get("mother_tongue", "English")
    if target_language.lower() == "english": 
        return english_baseline

    system_prompt = f"""
    Translate the following legal update into {target_language}.
    RULES: Use a 5th-grade reading level. Be empathetic. NO predictions. NO legal advice.
    Return ONLY the translated text.
    """
    try:
        response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": english_baseline}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Translation failed: {e}")
        return english_baseline

# --- Helper 2: Audio Generator ---
def generate_audio_file(translated_text: str, language: str) -> str:
    lang_code = audio_lang_codes.get(language.lower(), "hi") # defaults to Hindi
    filename = f"audio_{uuid.uuid4().hex[:8]}.mp3"
    filepath = os.path.join("static", filename)
    try:
        tts = gTTS(text=translated_text, lang=lang_code, slow=False)
        tts.save(filepath)
        return filename
    except Exception as e:
        print(f"Audio generation failed: {e}")
        return None

# --- Helper 3: Twilio Sender ---
def send_whatsapp_voice_note(phone_number: str, text_message: str, audio_url: str = None):
    # Ensure proper WhatsApp formatting
    if phone_number.startswith("whatsapp:"):
        phone_number = phone_number.replace("whatsapp:", "")
    if not phone_number.startswith("+"):
        phone_number = "+91" + phone_number 

    # MESSAGE 1: Send the Text Transcript
    try:
        twilio_client.messages.create(
            from_=TWILIO_WHATSAPP_FROM,
            body=text_message,
            to=f"whatsapp:{phone_number}"
        )
        print(f"✅ WhatsApp Text sent to {phone_number}")
    except Exception as e:
        print(f"❌ WhatsApp Text Error: {e}")

    # MESSAGE 2: Send the Audio File (Voice Note) separately
    if audio_url:
        try:
            twilio_client.messages.create(
                from_=TWILIO_WHATSAPP_FROM,
                media_url=[audio_url],
                to=f"whatsapp:{phone_number}"
            )
            print(f"✅ WhatsApp Audio sent to {phone_number}")
        except Exception as e:
            print(f"❌ WhatsApp Audio Error: {e}")