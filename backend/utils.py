from datetime import datetime
from typing import Optional
import os
from groq import Groq
from twilio.rest import Client

# Twilio Setup (Get these from your Twilio Console)
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM") # Default Twilio Sandbox Number
TWILIO_SMS_FROM = os.getenv("TWILIO_SMS_FROM") # Your Twilio Phone Number

twilio_client = Client(TWILIO_SID, TWILIO_AUTH)

# Groq Setup
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", "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"))


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

def generate_translated_message(case_data: dict) -> str:
    # 1. Build the SAFE English baseline (No ML scores, no legal jargon)
    status = "Eligible for Legal Review/Bail" if case_data.get("eligible") else "Awaiting Legal Processing"
    if case_data.get("conflict_flag"):
         status = "Requires Specialized Legal Review"

    action = "Proceeding with legal application" if case_data.get("eligible") else "Monitoring case for next steps"
    if case_data.get("priority_level") == "HIGH" and case_data.get("eligible"):
        action = "High priority: Paralegal assigned for immediate action"

    english_baseline = f"""
    Case Update for ID: {case_data.get('report_number')} ({case_data.get('city')})
    Current Status: {status}
    Days in Detention: {case_data.get('detention_days')}
    Current Action: {action}
    """

    # 2. Use Groq to safely translate it
    target_language = case_data.get("mother_tongue", "English")
    
    # If it's already English, just return the baseline with the disclaimer
    if target_language.lower() == "english":
         return english_baseline + "\n\n*This is an automated update. Please contact your DLSA paralegal for questions. This is not legal advice.*"

    system_prompt = f"""
    Translate the following court update into {target_language}.
    RULES:
    1. Maintain a 5th-grade reading level. Keep it empathetic and simple.
    2. Do NOT add any predictions or legal advice.
    3. You MUST append this exact disclaimer at the end in {target_language}: "This is an automated update. Please contact your DLSA paralegal for questions. This is not legal advice."
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
        return english_baseline # Fallback to English if LLM fails

# --- Helper 2: Twilio Sender ---
def send_notifications(phone_number: str, message_body: str):
    # Ensure phone number has country code (e.g., +91 for India)
    if not phone_number.startswith("+"):
        phone_number = "+91" + phone_number 

    # 1. Send WhatsApp
    try:
        twilio_client.messages.create(
            from_=TWILIO_WHATSAPP_FROM,
            body=message_body,
            to=f"whatsapp:{phone_number}"
        )
        print(f"WhatsApp sent to {phone_number}")
    except Exception as e:
        print(f"WhatsApp Error: {e}")

    # 2. Send SMS
    # try:
    #     twilio_client.messages.create(
    #         from_=TWILIO_SMS_FROM,
    #         body=message_body,
    #         to=phone_number
    #     )
    #     print(f"SMS sent to {phone_number}")
    # except Exception as e:
    #     print(f"SMS Error: {e}")