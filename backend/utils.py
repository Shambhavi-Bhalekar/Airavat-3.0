from datetime import datetime
from typing import Optional

def calculate_detention_days(date_str: Optional[str]) -> int:
    """Calculates days elapsed since the date string provided."""
    if not date_str:
        return 0
    try:
        dt = datetime.fromisoformat(date_str)
        return (datetime.now() - dt).days
    except ValueError:
        return 0

def format_gemma_prompt(case_data: dict) -> str:
    """Formats the prompt to send to the Gemma model."""
    prompt = f"""
    You are an intelligent legal prioritization AI in the system 'JusticeGrid'.
    Analyze the following undertrial case details and return a strictly formatted JSON object.
    
    Case Details:
    - IPC Section: {case_data.get('ipc_section')}
    - Bailable Status: {case_data.get('bailable')}
    - Max Sentence (Years): {case_data.get('max_sentence')}
    - Detention Days: {case_data.get('detention_days')}
    - City: {case_data.get('city')}
    - Report Details: {case_data.get('report_details')}
    
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
