import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Body, requests
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from db import supabase
from ml_models import compute_score
from ml_delay import predict_delay
from financial_intelligence import evaluate_surety
from models import UserSignup, UserLogin, ClientCreate, CaseCreate
from utils import calculate_detention_days, format_gemma_prompt, generate_audio_file, generate_translated_message, send_whatsapp_voice_note
from systemic_insights import (
    get_charge_section_delays,
    get_court_bail_intervals,
    get_prison_eligible_density,
    get_surety_blocking_analysis,
    get_pattern_high_adjournments_by_quarter
)
import traceback
import sys

# Dynamically link Multi-Agent folder
multi_agent_path = os.path.join(os.path.dirname(__file__), "..", "Multi-Agent", "Project")
if multi_agent_path not in sys.path:
    sys.path.append(multi_agent_path)

from debate import run_debate_round
from moderate import run_agent13

backend_env_path = os.path.join(os.path.dirname(__file__), ".env")
root_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(backend_env_path)
load_dotenv(root_env_path)

app = FastAPI(title="JusticeGrid API")

# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_api_key = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")

@app.post("/auth/signup")
def signup(user: UserSignup):
    try:
        # For the prototype, we assume success to unblock the Next.js UI 
        # Attempt to log to DB if the table is structured
        try:
            db_data = user.model_dump()
            db_data["password"] = "HIDDEN"  # Do not store raw passwords in plain text tables
            supabase.table("users").insert(db_data).execute()
        except Exception:
            pass # Graceful fallback if table is missing 
        return {"status": "request_submitted", "user": user.email}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login")
def login(user: UserLogin):
    return {"status": "success", "token": "mock-jwt-token-123"}

@app.post("/client")
def create_client(client: ClientCreate):
    try:
        response = supabase.table("clients").insert(client.model_dump(mode='json')).execute()
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
        case_dict = case.model_dump(mode='json', exclude_unset=True)
        
        # 1. Compute detention
        detention_days = calculate_detention_days(case_dict.get("date_of_occurrence"))
        case_dict["detention_days"] = detention_days

        # 2. Setup format logic for LLM
        prompt = format_gemma_prompt(case_dict)
        
        # 3. Call LLM (Gemma/Gemini)
        ml_result = compute_score(case_dict, prompt)
        
        # 4. Integrate LLM Model Results securely
        if "priority_score" in ml_result: case_dict["priority_score"] = ml_result["priority_score"]
        if "priority_level" in ml_result: case_dict["priority_level"] = ml_result["priority_level"]
        if "confidence" in ml_result: case_dict["confidence"] = ml_result["confidence"]
        if "conflict_flag" in ml_result: case_dict["conflict_flag"] = ml_result["conflict_flag"]
        # 4.1. Run Delay Predictor (Joblib ML model)
        delay_result = predict_delay(case_dict)
        case_dict["adjournment_prob"] = int(delay_result["delay_probability"])
        case_dict["delay_decision"] = delay_result["decision"]
        
        # 4.2. Run Financial/Surety Evaluation
        finance_result = evaluate_surety(case_dict)
        case_dict.update(finance_result)
        
        # Add mock status that might be updated later
        if "hearing_outcome" not in case_dict:
            case_dict["hearing_outcome"] = "PENDING"
            
        # Eligibility
        case_dict["eligible"] = True if case_dict.get("bailable") == "Bailable" else False
        
        # Reason
        llm_reason = ml_result.get("reasoning")
        case_dict["reason"] = llm_reason if llm_reason else f"Eligible={case_dict['eligible']}, Detention={detention_days}, Delay Prob={case_dict['adjournment_prob']}%"

        # 5. Insert into DB (safely ignore derived UI fields not in schema)
        case_dict.pop("delay_decision", None)
        case_dict.pop("reasoning", None)
        case_dict.pop("section_440_brief", None)
        case_dict.pop("section_440_flag", None)
        case_dict.pop("bail_delay_days", None)
        case_dict.pop("surety_blocked", None)
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

@app.post("/case/{id}/orchestrate")
async def run_multi_agent_orchestrator(id: str):
    """Executes the Debate Panel and Moderator Agents contextually dynamically"""
    try:
        # Fetch case
        case_res = supabase.table("cases").select("*").eq("id", id).execute()
        if not case_res.data:
            raise HTTPException(status_code=404, detail="Case not found")
        case_dict = case_res.data[0]

        # Structure context for Agents
        context = {
            "fir_bundle": case_dict.get("fir_number", ""),
            "eligibility": {
                "bailable": case_dict.get("bailable"),
                "adjournment_prob": case_dict.get("adjournment_prob", 50),
                "prison": case_dict.get("prison", "Unknown")
            }
        }

        # Run Debate
        debate_result = await run_debate_round(context)
        context["debate_transcript"] = debate_result

        # Run Moderator
        moderator_result = await run_agent13(context)
        
        # Save Verdict + full transcript to `reason` with a special prefix so the
        # frontend reasoning-chain.tsx can detect and render it as a debate chat.
        # Format: MULTIAGENT::<verdict>|<reasoning>|<confidence>|<full transcript>
        transcript_clean = debate_result["transcript"].replace("\n", "\\n")
        reason_string = (
            f"MULTIAGENT::"
            f"{moderator_result['consensus']['verdict']}|"
            f"{moderator_result['consensus']['reasoning']}|"
            f"{moderator_result['consensus']['confidence']}|"
            f"{transcript_clean}"
        )
        supabase.table("cases").update({
            "reason": reason_string,
            "confidence": moderator_result['consensus']['confidence'] / 100.0
        }).eq("id", id).execute()

        return {
            "transcript": debate_result["transcript"],
            "verdict": moderator_result["consensus"]
        }
    except Exception as e:
        print(traceback.format_exc())
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
        failed_cases = []
        for case in cases:
            try:
                # Re-compute detention just in case
                detention_days = calculate_detention_days(case.get("date_of_occurrence"))
                case["detention_days"] = detention_days
                
                prompt = format_gemma_prompt(case)
                ml_result = compute_score(case, prompt)
                
                # Make a clean copy so we don't mutate the original dict
                updates = dict(ml_result)
                updates["detention_days"] = detention_days
                
                # Predict adjournment using local joblib model
                delay_result = predict_delay(case)
                updates["adjournment_prob"] = int(delay_result["delay_probability"])
                
                # Predict Surety/Financial Access logic
                finance_result = evaluate_surety(case)
                updates.update(finance_result)
                
                if "bailable" in case:
                    updates["eligible"] = True if case.get("bailable") == "Bailable" else False
                    llm_reason = ml_result.get("reasoning")
                    updates["reason"] = llm_reason if llm_reason else f"Eligible={updates['eligible']}, Detention={detention_days}, Delay Prob={updates['adjournment_prob']}%"

                # ── Strip ALL derived / non-schema / constrained keys before pushing ──
                for key in ["delay_decision", "reasoning", "section_440_brief",
                            "section_440_flag", "bail_delay_days", "surety_blocked",
                            "conflict_flag"]:   # conflict_flag has a DB CHECK constraint — never overwrite on re-score
                    updates.pop(key, None)

                supabase.table("cases").update(updates).eq("id", case["id"]).execute()
                updated_cases.append(case["id"])
                
            except Exception as case_err:
                # One bad case should never abort the entire batch
                print(f"⚠️ Skipped case {case.get('id')}: {case_err}")
                failed_cases.append({"id": case.get("id"), "error": str(case_err)})
                continue
            
        return {
            "message": "Retroactive scoring complete via Local Gemma-4",
            "updated_count": len(updated_cases),
            "failed_count": len(failed_cases),
            "updated_ids": updated_cases,
            "failed_cases": failed_cases,
        }
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# SYSTEMIC PATTERN INTELLIGENCE ENDPOINTS
# (Pillar 04 & 08)
# ==========================================

@app.get("/systemic-insights/charge-sections")
def get_insights_charge_sections():
    """
    Returns: Which charge sections drive the longest undertrial detention.
    Part of Pillar 04 - Systemic Pattern Intelligence.
    """
    return get_charge_section_delays()


@app.get("/systemic-insights/courts")
def get_insights_courts():
    """
    Returns: Which courts have the worst bail-decision intervals.
    Part of Pillar 04 - Systemic Pattern Intelligence.
    """
    return get_court_bail_intervals()


@app.get("/systemic-insights/prisons")
def get_insights_prisons():
    """
    Returns: Which prisons have the highest density of eligible-but-unserved undertrials.
    Part of Pillar 04 - Systemic Pattern Intelligence.
    """
    return get_prison_eligible_density()


@app.get("/systemic-insights/surety-analysis")
def get_insights_surety():
    """
    Returns: Which surety amounts are blocking bail execution, correlated with local poverty indicators.
    Part of Pillar 04 - Systemic Pattern Intelligence.
    """
    return get_surety_blocking_analysis()


@app.get("/alerts/pattern-adjournments")
def get_alerts_pattern_adjournments():
    """
    Returns: Courts where eligible cases have been adjourned 20+ times in a quarter.
    Surfaces pattern alerts to UTRC when thresholds are breached.
    Part of Pillar 08 - UTRC Pattern Alerts & Uncertainty Display.
    """
    return get_pattern_high_adjournments_by_quarter()

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