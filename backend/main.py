import os

from fastapi import FastAPI, HTTPException, Request, Body, requests
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from db import supabase
from ml_models import compute_score
from ml_delay import predict_delay
from models import ClientCreate, CaseCreate
from utils import calculate_detention_days, format_gemma_prompt, generate_audio_file, generate_translated_message, send_notifications, send_whatsapp_voice_note
import traceback

app = FastAPI(title="JusticeGrid API")

# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")

@app.post("/client")
def create_client(client: ClientCreate):
    try:
        response = supabase.table("clients").insert(client.model_dump()).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/client/{client_id}")
def get_client(client_id: str):
    try:
        res = supabase.table("clients").select("*").eq("client_id", client_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Client not found")
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/case")
def create_case(case: CaseCreate):
    try:
        case_dict = case.model_dump(exclude_unset=True)
        
        # 1. Compute detention
        detention_days = calculate_detention_days(case_dict.get("date_of_occurrence"))
        case_dict["detention_days"] = detention_days

        # 2. Setup format logic for LLM
        prompt = format_gemma_prompt(case_dict)
        
        # 3. Call LLM (Gemma/Gemini)
        ml_result = compute_score(case_dict, prompt)
        
        # 4. Integrate LLM Model Results
        case_dict.update(ml_result)
        
        # 4.1. Run Delay Predictor (Joblib ML model)
        delay_result = predict_delay(case_dict)
        case_dict["adjournment_prob"] = int(delay_result["delay_probability"])
        case_dict["delay_decision"] = delay_result["decision"]
        
        # Add mock status that might be updated later
        if "hearing_outcome" not in case_dict:
            case_dict["hearing_outcome"] = "PENDING"
            
        # Eligibility
        case_dict["eligible"] = True if case_dict.get("bailable") == "Bailable" else False
        
        # Reason
        llm_reason = ml_result.get("reasoning")
        case_dict["reason"] = llm_reason if llm_reason else f"Eligible={case_dict['eligible']}, Detention={detention_days}, Delay Prob={case_dict['adjournment_prob']}%"

        # 5. Insert into DB
        response = supabase.table("cases").insert(case_dict).execute()

        return {
            "case": response.data,
            "computed": ml_result
        }
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cases")
def get_cases():
    try:
        res = supabase.table("cases").select("*").order("priority_score", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/case/{id}")
def update_case(id: str, updates: dict = Body(...)):
    try:
        res = supabase.table("cases").update(updates).eq("id", id).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/case/{id}")
def delete_case(id: str):
    try:
        res = supabase.table("cases").delete().eq("id", id).execute()
        return {"deleted": id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-all")
def predict_all_cases():
    """Retroactively updates all existing cases in the database by passing them through the Gemma LLM again."""
    try:
        res = supabase.table("cases").select("*").execute()
        cases = res.data
        
        updated_cases = []
        for case in cases:
            # Re-compute detention just in case
            detention_days = calculate_detention_days(case.get("date_of_occurrence"))
            case["detention_days"] = detention_days
            
            prompt = format_gemma_prompt(case)
            ml_result = compute_score(case, prompt)
            
            updates = ml_result
            updates["detention_days"] = detention_days
            
            # Predict adjournment using local joblib model
            delay_result = predict_delay(case)
            updates["adjournment_prob"] = int(delay_result["delay_probability"])
            updates["delay_decision"] = delay_result["decision"]
            
            if "bailable" in case:
                updates["eligible"] = True if case.get("bailable") == "Bailable" else False
                llm_reason = ml_result.get("reasoning")
                updates["reason"] = llm_reason if llm_reason else f"Eligible={updates['eligible']}, Detention={detention_days}, Delay Prob={updates['adjournment_prob']}%"

            # Push back to DB safely - only updating ML fields
            supabase.table("cases").update(updates).eq("id", case["id"]).execute()
            updated_cases.append(case["id"])
            
        return {
            "message": "Retroactive scoring complete via Local Gemma-4",
            "updated_count": len(updated_cases), 
            "updated_ids": updated_cases
        }
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ENDPOINT 1: OUTBOUND NOTIFICATIONS (FROM DB)
# ==========================================
@app.post("/supabase-webhook")
async def handle_supabase_update(request: Request):
    payload = await request.json()
    if payload.get("type") in ["UPDATE", "INSERT"]:
        case_data = payload.get("record", {})
        phone_number = case_data.get("family_contact_number")
        language = case_data.get("mother_tongue", "Hindi")
        
        if not phone_number: return {"status": "Ignored"}

        print(f"🔄 Processing outbound DB update for Case {case_data.get('report_number')}...")
        translated_text = generate_translated_message(case_data)
        audio_filename = generate_audio_file(translated_text, language)
        
        host = request.headers.get("x-forwarded-host") or request.headers.get("host")
        scheme = request.headers.get("x-forwarded-proto") or "https"
        audio_url = f"{scheme}://{host}/static/{audio_filename}" if audio_filename else None
        
        intro_text = f"📄 {translated_text}\n\n👇 Listen to this update below:"
        send_whatsapp_voice_note(phone_number, intro_text, audio_url)
        
        return {"status": "Success"}
    return {"status": "Ignored"}


# ==========================================
# ENDPOINT 2: INBOUND REPLIES (FROM TWILIO)
# ==========================================
@app.post("/whatsapp-inbound")
async def handle_whatsapp_reply(request: Request):
    form_data = await request.form()
    sender_phone = form_data.get("From") 
    user_text = form_data.get("Body", "").strip()
    num_media = int(form_data.get("NumMedia", 0))

    print(f"📥 Received message from {sender_phone}")

    # --- Step 1: STT for Audio Processing ---
    if num_media > 0:
        media_url = form_data.get("MediaUrl0")
        print("🎵 Voice note detected. Transcribing...")
        audio_response = requests.get(media_url, auth=(TWILIO_SID, TWILIO_AUTH))
        
        if audio_response.status_code == 200:
            try:
                transcription = groq_client.audio.transcriptions.create(
                    file=("voice_note.ogg", audio_response.content),
                    model="whisper-large-v3"
                )
                user_text = transcription.text
                print(f"📝 Transcribed: {user_text}")
            except Exception as e:
                print(f"STT Error: {e}")
                user_text = "I sent a voice note but it could not be transcribed."

    # --- Step 2: Database Retrieval via Supabase ---
    clean_phone = sender_phone.replace("whatsapp:", "")
    if not clean_phone.startswith("+"):
        clean_phone = "+91" + clean_phone

    case_context = "No specific case data found for this phone number."
    target_language = "Hindi" # Fallback
    
    try:
        # Look up the family's case in Supabase using their phone number
        res = supabase.table("cases").select("*").eq("family_contact_number", clean_phone).order("created_at", desc=True).limit(1).execute()
        
        if res.data and len(res.data) > 0:
            case_info = res.data[0]
            target_language = case_info.get("mother_tongue", "Hindi")
            status = "Eligible for Bail" if case_info.get("eligible") else "Awaiting Legal Processing"
            
            # Construct exact context for the AI
            case_context = f"""
            CASE CONTEXT FOR THIS CALLER:
            - Report Number: {case_info.get('report_number')}
            - City / Prison: {case_info.get('city')}, {case_info.get('prison_name', 'Unknown')}
            - Court: {case_info.get('court_name', 'Pending Assignment')}
            - Detention Days: {case_info.get('detention_days')}
            - Current Status: {status}
            - Bail Status: {case_info.get('bail_status', 'Pending')}
            - Hearing Outcome: {case_info.get('hearing_outcome', 'Pending')}
            - Surety Blocked: {case_info.get('surety_blocked')}
            - Surety Amount: Rs. {case_info.get('surety_amount', 0)}
            """
            print(f"🔍 Found DB Context for {clean_phone} in {target_language}")
    except Exception as e:
        print(f"Database lookup failed: {e}")

    # --- Step 3: Guardrailed LLM Generation ---
    system_prompt = f"""
    You are JusticeGrid, an AI assistant helping families of undertrial prisoners in India.
    A family member has just asked you a question. 

    {case_context}
    
    CRITICAL RULES:
    1. NEVER give legal advice.
    2. NEVER predict case outcomes or timelines.
    3. Keep answers under 3 sentences. Use 5th-grade language.
    4. Respond in the same language the user asked the question in (their database preference is {target_language}).
    5. If they ask a complex legal question, say: "I cannot give legal advice. Please contact your DLSA paralegal or the helpline."
    6. If Case Context is provided above, use it to accurately answer their specific question. Do NOT say "according to the database", just answer naturally.
    """

    print("🧠 Generating contextual response...")
    try:
        reply_response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2
        )
        safe_reply = reply_response.choices[0].message.content.strip()
    except Exception as e:
        safe_reply = "I am having trouble understanding right now. Please contact the DLSA helpline."

    # --- Step 4: Outbound Audio & Text Generation ---
    audio_filename = generate_audio_file(safe_reply, target_language)
    
    host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    scheme = request.headers.get("x-forwarded-proto") or "https"
    audio_url = f"{scheme}://{host}/static/{audio_filename}" if audio_filename else None
    
    final_text = f"📄 {safe_reply}\n\n👇 Audio response:"
    send_whatsapp_voice_note(sender_phone, final_text, audio_url)

    return {"status": "Replied"}