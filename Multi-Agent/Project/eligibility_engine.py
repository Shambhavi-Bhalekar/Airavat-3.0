"""
JusticeGrid — Agent 3: Eligibility Engine (Gemini Version)
"""

import os
import re
import json
import logging
import asyncio
from enum import Enum
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

import google.generativeai as genai

# ✅ SAFE CONFIG (prevents import crash)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

# Lazy model initialization (safer)
def get_model():
    return genai.GenerativeModel("gemini-1.5-pro")


from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Agent3")

# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def clean_json(text: str):
    text = re.sub(r"^```(?:json)?", "", text)
    text = re.sub(r"```$", "", text)
    return text.strip()


# ---------------------------------------------------------------------------
# ENUMS
# ---------------------------------------------------------------------------

class EligibilityStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    NOT_YET = "NOT_YET"
    APPROACHING = "APPROACHING"


class OffenderClass(str, Enum):
    FIRST_TIME = "FIRST_TIME"
    REGULAR = "REGULAR"
    UNKNOWN = "UNKNOWN"


# ---------------------------------------------------------------------------
# MODELS
# ---------------------------------------------------------------------------

class Verdict(BaseModel):
    case_id: str
    offender_class: str
    eligibility: str
    reasoning: str


# ---------------------------------------------------------------------------
# GEMINI CALLS
# ---------------------------------------------------------------------------

async def classify_offender(data):

    prompt = f"""
Determine offender class.

DATA:
{json.dumps(data)}

Return JSON:
{{
 "offender_class": "FIRST_TIME|REGULAR|UNKNOWN",
 "confidence": 0.0-1.0,
 "reasoning": "text"
}}
"""

    try:
        model = get_model()

        res = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        )

        raw = clean_json(res.text)
        parsed = json.loads(raw)

        return parsed.get("offender_class", "UNKNOWN"), parsed.get("reasoning", "")

    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return "UNKNOWN", str(e)


async def generate_reasoning(case_id, days):

    try:
        model = get_model()

        prompt = f"""
Case {case_id} has {days} days in custody.
Explain eligibility simply.
"""

        res = model.generate_content(prompt)
        return res.text

    except Exception as e:
        return f"Reasoning error: {e}"


# ---------------------------------------------------------------------------
# CORE LOGIC
# ---------------------------------------------------------------------------

async def run_agent3(case_id: str):
    logger.info(f"Agent 3 running for case: {case_id}")

    # TODO: Replace with real pipeline data
    days_in_custody = 200

    offender_class, reasoning1 = await classify_offender({
        "case_id": case_id
    })

    if days_in_custody > 180:
        status = EligibilityStatus.ELIGIBLE
    else:
        status = EligibilityStatus.NOT_YET

    reasoning2 = await generate_reasoning(case_id, days_in_custody)

    return Verdict(
        case_id=case_id,
        offender_class=offender_class,
        eligibility=status.value,
        reasoning=reasoning1 + "\n" + reasoning2
    )


# ---------------------------------------------------------------------------
# SYNC WRAPPER (🔥 IMPORTANT FOR YOUR PIPELINE)
# ---------------------------------------------------------------------------

def run_agent3_sync(case_id: str):
    return asyncio.run(run_agent3(case_id))


# ---------------------------------------------------------------------------
# RUN (LOCAL TEST)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    result = asyncio.run(run_agent3("MH/CR/2024/00847"))
    print(result.model_dump_json(indent=2))