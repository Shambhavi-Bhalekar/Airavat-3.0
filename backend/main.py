from fastapi import FastAPI, HTTPException
from db import supabase
from ml_models import compute_score
from models import ClientCreate, CaseCreate
from utils import calculate_detention_days, format_gemma_prompt
import traceback

app = FastAPI(title="JusticeGrid API")

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
        
        # 4. Integrate Model Results
        case_dict.update(ml_result)
        
        # Add mock status that might be updated later
        if "hearing_outcome" not in case_dict:
            case_dict["hearing_outcome"] = "PENDING"
            
        # Eligibility
        case_dict["eligible"] = True if case_dict.get("bailable") == "Bailable" else False
        
        # Reason
        case_dict["reason"] = f"Eligible={case_dict['eligible']}, Detention={detention_days}, LLM Conf={case_dict.get('confidence', 0)}"

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
def update_case(id: str, updates: dict):
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
            
            if "bailable" in case:
                updates["eligible"] = True if case.get("bailable") == "Bailable" else False
                updates["reason"] = f"Eligible={updates['eligible']}, Detention={detention_days}, LLM Conf={updates.get('confidence', 0)}"

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
