import os
import json
from openai import OpenAI
import traceback

# Initialize the OpenAI client pointing to the local llama-server
client = OpenAI(
    base_url="http://localhost:8001/v1",
    api_key="not-needed" # API key is required but its value doesn't matter for local endpoints
)

def compute_score(case_data: dict, prompt: str) -> dict:
    """Calls the local Gemma model through the local llama-server OpenAI-compatible API."""
    try:
        response = client.chat.completions.create(
            model="Gemma-4", # Model name is ignored if only one is loaded, but required by SDK
            messages=[
                {"role": "system", "content": "<|think|> You are an intelligent legal prioritization AI."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            # We don't strictly use response_format={"type": "json_object"} as llama.cpp handles it via grammar usually,
            # but setting it helps if the model natively supports JSON mode.
            response_format={"type": "json_object"}
        )
        
        raw_text = response.choices[0].message.content
        print("Raw LLM text (might include thoughts):", raw_text)
        
        # It might contain thought blocks, we only want the JSON output parsing.
        # Ensure we only load the JSON part if there is extra text
        # usually llama.cpp with JSON mode enabled guarantees valid JSON.
        result = json.loads(raw_text)
        return result
    except Exception as e:
        print(f"Error calling local LLM: {traceback.format_exc()}")
        return get_mock_score(case_data)

def get_mock_score(case_data: dict) -> dict:
    """Fallback if API is failing."""
    score = 0
    if case_data.get("bailable") == "Bailable":
        score += 100
    score += min(case_data.get("detention_days", 0), 100)
    conflict_flag = "SERIOUS_OFFENCE" if case_data.get("max_sentence", 0) >= 20 else None
    
    level = "LOW"
    if score > 180:
        level = "HIGH"
    elif score > 120:
        level = "MEDIUM"
        
    return {
        "priority_score": score,
        "priority_level": level,
        "adjournment_prob": 70,
        "conflict_flag": conflict_flag,
        "confidence": 0.85
    }