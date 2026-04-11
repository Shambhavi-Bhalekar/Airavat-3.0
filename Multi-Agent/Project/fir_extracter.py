````python
"""
JusticeGrid — Agent 1: FIR Extraction Agent (Gemini Version)
"""

import os
import re
import json
import base64
import asyncio
import logging
from datetime import datetime
from typing import Optional

import httpx
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field
from langdetect import detect

# ✅ Gemini
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
GEMINI_MODEL = genai.GenerativeModel("gemini-1.5-pro")

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s — %(message)s")
logger = logging.getLogger("JusticeGrid.Agent1")

# ---------------------------------------------------------------------------
# CONFIG (same as before)
# ---------------------------------------------------------------------------

IPC_TO_BNSS = {"302": "103", "376": "64", "379": "303", "420": "318"}
MAX_SENTENCE_MONTHS = {"302": 999, "376": 999, "379": 36, "420": 84}

STATE_ECOURT_ENDPOINTS = {
    "MH": "https://districts.ecourts.gov.in/maharashtra"
}

NJDG_BASE = "https://njdg.ecourts.gov.in/njdgnew/index.php"

# ---------------------------------------------------------------------------
# MODELS
# ---------------------------------------------------------------------------

class ChargeSection(BaseModel):
    raw_section: str
    ipc_section: Optional[str] = None
    bnss_section: Optional[str] = None
    offence_description: str
    max_sentence_months: Optional[int] = None
    half_sentence_months: Optional[int] = None
    is_life_or_death: bool = False
    confidence: float = Field(ge=0.0, le=1.0)


class AccusedProfile(BaseModel):
    name: str
    aliases: list[str] = []
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    prior_cases: list[str] = []


class FIRRecord(BaseModel):
    fir_number: str
    fir_date: Optional[str] = None
    police_station: Optional[str] = None
    district: Optional[str] = None
    state_code: str
    raw_text: str
    detected_language: str
    charge_sections: list[ChargeSection]
    accused: list[AccusedProfile]
    source_url: Optional[str] = None
    ocr_quality: Optional[str] = None
    parse_warnings: list[str] = []


class FIRBundle(BaseModel):
    case_id: str
    extracted_at: str
    total_firs_found: int
    firs: list[FIRRecord]
    agent_confidence: float
    errors: list[str] = []


# ---------------------------------------------------------------------------
# GEMINI FIR PARSER
# ---------------------------------------------------------------------------

FIR_EXTRACTION_SYSTEM = """
Extract FIR data and return ONLY JSON.

Schema:
{
  "fir_number": "string",
  "fir_date": "YYYY-MM-DD",
  "police_station": "string",
  "district": "string",
  "accused": [],
  "charge_sections": [],
  "ocr_quality": "clean|noisy|mixed_script",
  "parse_warnings": []
}
"""


async def parse_fir_with_gemini(raw_text: str, source_url: str) -> dict:
    try:
        lang = detect(raw_text[:500]) if raw_text else "unknown"
    except:
        lang = "unknown"

    prompt = f"""
{FIR_EXTRACTION_SYSTEM}

Source: {source_url}
Language: {lang}

TEXT:
{raw_text[:8000]}
"""

    try:
        response = GEMINI_MODEL.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        )

        output = response.text.strip()

        # Clean markdown
        output = re.sub(r"^```(?:json)?", "", output)
        output = re.sub(r"```$", "", output)

        return json.loads(output)

    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return {"charge_sections": [], "parse_warnings": [str(e)]}


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def normalise_section(raw: str) -> Optional[str]:
    m = re.search(r"(\d+)", raw)
    return m.group(1) if m else None


def enrich_charge_section(raw_data: dict) -> ChargeSection:
    raw = raw_data.get("raw_section", "")
    ipc = normalise_section(raw)
    return ChargeSection(
        raw_section=raw,
        ipc_section=ipc,
        bnss_section=IPC_TO_BNSS.get(ipc),
        offence_description=raw_data.get("offence_description", ""),
        max_sentence_months=MAX_SENTENCE_MONTHS.get(ipc),
        half_sentence_months=None,
        confidence=float(raw_data.get("confidence", 0.7)),
    )


# ---------------------------------------------------------------------------
# FETCHING (simplified)
# ---------------------------------------------------------------------------

async def fetch_case_html():
    async with httpx.AsyncClient() as client:
        r = await client.get(NJDG_BASE)
        return r.text


# ---------------------------------------------------------------------------
# MAIN AGENT
# ---------------------------------------------------------------------------

async def run_agent1(case_id: str) -> FIRBundle:

    html = await fetch_case_html()

    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text()

    parsed = await parse_fir_with_gemini(text, "njdg")

    charges = [enrich_charge_section(c) for c in parsed.get("charge_sections", [])]

    fir = FIRRecord(
        fir_number=parsed.get("fir_number", "FIR-1"),
        state_code="MH",
        raw_text=text[:1000],
        detected_language="unknown",
        charge_sections=charges,
        accused=[],
    )

    return FIRBundle(
        case_id=case_id,
        extracted_at=datetime.utcnow().isoformat(),
        total_firs_found=1,
        firs=[fir],
        agent_confidence=0.8,
    )


# ---------------------------------------------------------------------------
# RUN
# ---------------------------------------------------------------------------

async def main():
    result = await run_agent1("MH/CR/2024/00847")
    print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    asyncio.run(main())
````
