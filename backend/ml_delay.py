import os
import pandas as pd
import joblib

# Load the trained model once globally when this module is imported.
MODEL_PATH = os.path.join(os.path.dirname(__file__), "delay_prediction_model.pkl")

try:
    delay_model = joblib.load(MODEL_PATH)
    print(f"✅ Successfully loaded delay prediction model from {MODEL_PATH}")
except Exception as e:
    print(f"⚠️ Failed to load delay prediction model: {e}")
    delay_model = None


def predict_delay(case_data: dict) -> dict:
    """
    Given a CaseCreate dictionary, maps the available fields to the features
    expected by the adjournment/delay prediction model, runs predict_proba, 
    and returns the prediction result.
    """
    if delay_model is None:
        return {
            "delay_probability": 0,
            "decision": "Model Unavailable",
            "confidence_interval": [0, 0]
        }
        
    try:
        # Extract features from case_data with fallbacks
        
        # 1. Day of Week & Month from date_of_occurrence
        import datetime
        dt_str = case_data.get("date_of_occurrence")
        if dt_str:
            if isinstance(dt_str, datetime.datetime):
                dt = dt_str
            else:
                # Handle ISO format string if it was dumped
                dt = datetime.datetime.fromisoformat(str(dt_str).replace('Z', '+00:00'))
            day_of_week = dt.weekday()  # Monday is 0, Sunday is 6
            month = dt.month
        else:
            day_of_week = 2  # default Wednesday
            month = 4        # default April
            
        # 2. Derive City Code
        city = str(case_data.get("city", "Unknown")).strip()
        city_code = abs(hash(city)) % 20 + 1  # 1 to 20
        
        # 3. Derive crime codes from assigned_ipc
        ipc = str(case_data.get("assigned_ipc", "Unknown"))
        crime_code_encoded = abs(hash(ipc)) % 300 + 1
        crime_domain_code = abs(hash(ipc.split(' ')[0])) % 5 + 1
        
        # 4. Weapon code - default to 1 (simulate minor weapon)
        weapon_code = 1
        
        # 5. Victim Age and Gender
        victim_age = case_data.get("victim_age")
        if not victim_age:
            victim_age = 35
            
        gender_str = str(case_data.get("victim_gender", "")).lower()
        gender_code = 0 if gender_str in ['female', 'f', 'woman'] else 1
        
        # 6. Police logistics (mock defaults)
        police_deployed = 10
        police_load = 50
        
        # Assemble feature row
        feature_row = {
            'day_of_week': day_of_week,
            'month': month,
            'city_code': city_code,
            'crime_code_encoded': crime_code_encoded,
            'weapon_code': weapon_code,
            'crime_domain_code': crime_domain_code,
            'victim_age': victim_age,
            'gender_code': gender_code,
            'police_deployed': police_deployed,
            'police_load': police_load
        }
        
        df = pd.DataFrame([feature_row])
        
        # Predict probability
        prob = delay_model.predict_proba(df)[0][1] * 100

        # Confidence interval
        lower = max(0, prob - 10)
        upper = min(100, prob + 10)

        # Decision logic
        if prob > 75:
            decision = "High Risk"
        elif prob > 50:
            decision = "Moderate"
        else:
            decision = "Low"

        return {
            "delay_probability": round(prob, 2), # Using native key name
            "confidence_interval": [round(lower, 2), round(upper, 2)],
            "decision": decision
        }
    except Exception as e:
        print(f"Error predicting delay: {e}")
        return {
            "delay_probability": 0,
            "decision": "Error",
            "confidence_interval": [0, 0]
        }
