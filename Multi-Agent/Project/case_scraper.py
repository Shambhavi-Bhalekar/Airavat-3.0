"""
JusticeGrid — Agent 2: Related Cases Scraper
=============================================
Consumes Agent 1's FIRBundle and scrapes the respective court for:
  1. All cases registered against the same accused (by name + alias)
  2. Cases sharing the same FIR number across different courts (transfer/split cases)
  3. Co-accused cases filed separately in the same court
  4. Earlier bail applications and their outcomes for this case
  5. Adjournment history and upcoming hearing schedule

Outputs a CaseCorpus model ready for Agent 3 (Cross-Reference & Eligibility).

Dependencies:
    pip install anthropic httpx beautifulsoup4 pydantic playwright
    playwright install chromium   # for JS-rendered court portals
"""

import os
import re
import json
import asyncio
import logging
from datetime import datetime, date
from typing import Optional
from dataclasses import dataclass

import httpx
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field
import anthropic

# Agent 1 output types (import in real system; redefined here for standalone use)
from justicegrid_agent1_fir_extractor import (
    FIRBundle, FIRRecord, ChargeSection, AccusedProfile
)

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s — %(message)s")
logger = logging.getLogger("JusticeGrid.Agent2")

ANTHROPIC_CLIENT = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# eCourts CNR search endpoint (Central Name/Number Registry)
ECOURTS_CNR_SEARCH   = "https://services.ecourts.gov.in/ecourtindia_v6/cases/cnr_case_details"
ECOURTS_NAME_SEARCH  = "https://services.ecourts.gov.in/ecourtindia_v6/cases/case_search_by_name"
ECOURTS_FIR_SEARCH   = "https://services.ecourts.gov.in/ecourtindia_v6/cases/search_by_fir"
NJDG_CASE_SEARCH     = "https://njdg.ecourts.gov.in/njdgnew/index.php"
NALSA_PORTAL         = "https://nalsa.gov.in/lsms/case-search"

# Adjournment reason codes that indicate prosecution-caused delay
PROSECUTION_DELAY_CODES = {
    "CS_NF",      # Charge sheet not filed
    "PW_AB",      # Prosecution witness absent
    "IO_AB",      # Investigating officer absent
    "PP_AB",      # Public prosecutor absent
    "DOC_PND",    # Documents pending from prosecution
    "FSLT_PND",   # Forensic/lab report pending
}

# Court hierarchy codes
COURT_HIERARCHY = {
    "JM": 1,    # Judicial Magistrate
    "CJM": 2,   # Chief Judicial Magistrate
    "MM": 3,    # Metropolitan Magistrate
    "CMM": 4,   # Chief Metropolitan Magistrate
    "ADJ": 5,   # Additional District Judge
    "DJ": 6,    # District Judge
    "SC": 7,    # Sessions Court
    "HC": 8,    # High Court
    "SC_AP": 9, # Supreme Court (appeal)
}


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class HearingRecord(BaseModel):
    date: str                               # YYYY-MM-DD
    purpose: Optional[str] = None           # "Framing of charges", "Evidence", etc.
    outcome: Optional[str] = None           # "Adjourned", "Part heard", "Order reserved"
    next_date: Optional[str] = None
    adjourned: bool = False
    adjournment_reason: Optional[str] = None
    caused_by: Optional[str] = None         # "prosecution" | "defence" | "court" | "unknown"
    judge_name: Optional[str] = None


class BailApplication(BaseModel):
    application_number: str
    filed_date: Optional[str] = None
    applicant: str
    court: str
    stage: str                              # "Regular Bail" | "Anticipatory" | "Default Bail"
    outcome: Optional[str] = None           # "Granted" | "Rejected" | "Pending" | "Withdrawn"
    order_date: Optional[str] = None
    surety_amount: Optional[float] = None
    conditions: list[str] = []
    rejection_reasons: list[str] = []


class RelatedCase(BaseModel):
    case_number: str
    case_type: str                          # "CR", "CRL", "Sessions", etc.
    court_name: str
    court_code: str
    state_code: str
    district: Optional[str] = None
    filing_date: Optional[str] = None
    accused_names: list[str] = []
    charge_sections: list[str] = []        # Raw section strings
    case_status: str                        # "Pending" | "Disposed" | "Transferred"
    disposal_nature: Optional[str] = None  # "Convicted" | "Acquitted" | "Withdrawn" | None
    relation_type: str                      # "same_accused" | "co_accused" | "fir_split" | "appeal" | "transfer"
    relation_confidence: float = Field(ge=0.0, le=1.0)
    source_url: Optional[str] = None


class AdjournmentProfile(BaseModel):
    total_hearings: int
    total_adjournments: int
    adjournment_rate: float
    prosecution_caused: int
    defence_caused: int
    court_caused: int
    unknown_caused: int
    consecutive_adjournments: int           # Current streak without substantive progress
    last_substantive_hearing: Optional[str] = None
    next_hearing_date: Optional[str] = None
    next_hearing_purpose: Optional[str] = None
    days_since_last_action: Optional[int] = None
    days_to_next_hearing: Optional[int] = None


class CaseCorpus(BaseModel):
    """Output of Agent 2 — full related-case graph for one accused."""
    case_id: str
    court_name: str
    court_code: str
    state_code: str
    district: Optional[str] = None
    accused_primary: str
    scraped_at: str

    # Core case metadata
    case_status: str
    filing_date: Optional[str] = None
    charge_sections: list[str] = []
    judge_name: Optional[str] = None
    next_hearing_date: Optional[str] = None

    # Related cases
    related_cases: list[RelatedCase] = []
    total_related_found: int = 0

    # Bail history
    bail_applications: list[BailApplication] = []
    bail_granted: bool = False
    default_bail_eligible: bool = False     # 60/90 day Sec 167 CrPC / Sec 187 BNSS

    # Hearing / adjournment profile
    hearings: list[HearingRecord] = []
    adjournment_profile: Optional[AdjournmentProfile] = None

    # UTRC signals
    utrc_flagged: bool = False              # Flag for Under-Trial Review Committee
    utrc_flag_reasons: list[str] = []

    # Agent metadata
    agent_confidence: float
    data_sources_used: list[str] = []
    errors: list[str] = []
    scrape_warnings: list[str] = []


# ---------------------------------------------------------------------------
# Step 1: Fetch Main Case Page
# ---------------------------------------------------------------------------

async def fetch_case_by_cnr(cnr_number: str) -> dict:
    """
    eCourts CNR (Case Number Record) is the canonical unique case identifier.
    Format: STATEDISTRCT-CASETYPE-NUMBER-YEAR  e.g. DLDT010012345672024
    """
    async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
        try:
            resp = await client.post(
                ECOURTS_CNR_SEARCH,
                data={"cnr_number": cnr_number},
                headers={"X-Requested-With": "XMLHttpRequest"}
            )
            resp.raise_for_status()
            return {"data": resp.json(), "source": "ecourts_cnr"}
        except Exception as e:
            logger.warning(f"CNR search failed: {e}")
            return {"error": str(e)}


async def fetch_case_html(state_code: str, court_code: str,
                          case_type: str, number: str, year: int) -> dict:
    """
    Direct case page fetch from district court portal.
    Falls back to NJDG if state portal is unavailable.
    """
    url = (
        f"https://districts.ecourts.gov.in/{state_code.lower()}"
        f"/?p=casestatus/index&dist_code={court_code}"
        f"&case_no={number}&case_type={case_type}&year={year}"
    )
    async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            return {"html": resp.text, "url": str(resp.url), "source": "ecourts_district"}
        except Exception as e:
            logger.warning(f"District portal fetch failed ({e}), trying NJDG")
            return await fetch_njdg_case_detail(state_code, court_code, case_type, number, year)


async def fetch_njdg_case_detail(state_code: str, court_code: str,
                                  case_type: str, number: str, year: int) -> dict:
    params = {
        "p": "cnr_search",
        "state_cd": state_code,
        "dist_cd": court_code,
        "case_type": case_type,
        "case_no": number,
        "case_year": year,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            resp = await client.get(NJDG_CASE_SEARCH, params=params)
            resp.raise_for_status()
            return {"html": resp.text, "url": str(resp.url), "source": "njdg"}
        except Exception as e:
            return {"html": "", "error": str(e), "source": "njdg_failed"}


# ---------------------------------------------------------------------------
# Step 2: Search Related Cases by Accused Name
# ---------------------------------------------------------------------------

async def search_cases_by_name(accused_name: str, state_code: str,
                                court_code: str) -> list[dict]:
    """
    Search eCourts for all cases filed against the same accused name
    within the same court district.

    Uses conservative matching — returns candidates for Claude to validate.
    Never auto-merges uncertain name variants.
    """
    results = []

    # Primary: eCourts name search
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            resp = await client.post(
                ECOURTS_NAME_SEARCH,
                data={
                    "accused_name": accused_name,
                    "state_cd": state_code,
                    "dist_cd": court_code,
                    "search_type": "accused",
                },
                headers={"X-Requested-With": "XMLHttpRequest"}
            )
            data = resp.json()
            if isinstance(data, list):
                results.extend(data)
            elif isinstance(data, dict) and "cases" in data:
                results.extend(data["cases"])
        except Exception as e:
            logger.warning(f"Name search failed for '{accused_name}': {e}")

    return results


async def search_cases_by_fir(fir_number: str, police_station: str,
                               state_code: str) -> list[dict]:
    """
    Search for all cases across courts that reference the same FIR number.
    Catches split trials, transfer cases, and companion matters.
    """
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            resp = await client.post(
                ECOURTS_FIR_SEARCH,
                data={
                    "fir_no": fir_number,
                    "police_station": police_station,
                    "state_cd": state_code,
                },
                headers={"X-Requested-With": "XMLHttpRequest"}
            )
            data = resp.json()
            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and "cases" in data:
                return data["cases"]
        except Exception as e:
            logger.warning(f"FIR-based case search failed: {e}")
    return []


async def search_bail_applications(case_number: str, court_code: str,
                                    state_code: str) -> list[dict]:
    """
    Search for all bail applications filed in the case — regular, anticipatory,
    and default bail under Sec 167 CrPC / Sec 187 BNSS.
    """
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            resp = await client.post(
                f"https://districts.ecourts.gov.in/{state_code.lower()}/bail_applications",
                data={
                    "case_number": case_number,
                    "court_code": court_code,
                    "state_cd": state_code,
                },
                headers={"X-Requested-With": "XMLHttpRequest"}
            )
            return resp.json() if resp.status_code == 200 else []
        except Exception as e:
            logger.warning(f"Bail application search failed: {e}")
    return []


# ---------------------------------------------------------------------------
# Step 3: Scrape & Parse Hearing History
# ---------------------------------------------------------------------------

def parse_hearing_table(html: str) -> list[HearingRecord]:
    """
    Parse the cause list / order sheet table from eCourts HTML.
    Extracts date, purpose, outcome, next date, and adjournment cause.
    """
    soup = BeautifulSoup(html, "html.parser")
    hearings: list[HearingRecord] = []

    # eCourts uses a consistent table class for order sheets
    table = soup.find("table", {"id": re.compile(r"(order|hearing|causelist)", re.I)})
    if not table:
        # Fallback: find any table with date-like first column
        for t in soup.find_all("table"):
            headers = [th.get_text(strip=True).lower() for th in t.find_all("th")]
            if any("date" in h for h in headers):
                table = t
                break

    if not table:
        return hearings

    rows = table.find_all("tr")[1:]  # Skip header row
    for row in rows:
        cells = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
        if len(cells) < 2:
            continue

        # Try to extract a date from first cell
        date_match = re.search(r"(\d{2})[/\-\.](\d{2})[/\-\.](\d{4})", cells[0])
        if not date_match:
            continue

        d, m, y = date_match.groups()
        hearing_date = f"{y}-{m}-{d}"

        purpose   = cells[1] if len(cells) > 1 else None
        outcome   = cells[2] if len(cells) > 2 else None
        next_date_raw = cells[3] if len(cells) > 3 else None
        reason    = cells[4] if len(cells) > 4 else None

        adjourned = bool(outcome and re.search(r"adjourn|next date|nd\b|पेश", outcome, re.I))

        # Classify who caused the adjournment
        caused_by = _classify_adjournment_cause(reason or outcome or "")

        # Parse next date
        next_date = None
        if next_date_raw:
            nd_match = re.search(r"(\d{2})[/\-\.](\d{2})[/\-\.](\d{4})", next_date_raw)
            if nd_match:
                nd, nm, ny = nd_match.groups()
                next_date = f"{ny}-{nm}-{nd}"

        hearings.append(HearingRecord(
            date=hearing_date,
            purpose=purpose,
            outcome=outcome,
            next_date=next_date,
            adjourned=adjourned,
            adjournment_reason=reason,
            caused_by=caused_by,
        ))

    return sorted(hearings, key=lambda h: h.date)


def _classify_adjournment_cause(text: str) -> str:
    """
    Classify who caused the adjournment from the reason text.
    Conservative — returns 'unknown' if ambiguous.
    """
    text_lower = text.lower()

    prosecution_keywords = [
        "police", "io absent", "investigating officer", "charge sheet not filed",
        "chargesheet", "prosecution witness", "public prosecutor", "pp absent",
        "fslt", "forensic", "lab report", "documents not filed", "सीएस", "अन्वेषण"
    ]
    defence_keywords = [
        "counsel absent", "advocate absent", "accused absent", "bail not executed",
        "surety", "defence witness", "अभियुक्त अनुपस्थित"
    ]
    court_keywords = [
        "judge on leave", "court holiday", "no sitting", "transfer", "election",
        "court", "bench", "रजिस्ट्री", "अवकाश"
    ]

    if any(k in text_lower for k in prosecution_keywords):
        return "prosecution"
    if any(k in text_lower for k in defence_keywords):
        return "defence"
    if any(k in text_lower for k in court_keywords):
        return "court"
    return "unknown"


def build_adjournment_profile(hearings: list[HearingRecord]) -> AdjournmentProfile:
    """
    Compute adjournment statistics and flag systemic patterns.
    """
    total = len(hearings)
    adjourned_list = [h for h in hearings if h.adjourned]
    total_adj = len(adjourned_list)

    prosecution_ct = sum(1 for h in adjourned_list if h.caused_by == "prosecution")
    defence_ct     = sum(1 for h in adjourned_list if h.caused_by == "defence")
    court_ct       = sum(1 for h in adjourned_list if h.caused_by == "court")
    unknown_ct     = sum(1 for h in adjourned_list if h.caused_by == "unknown")

    # Consecutive adjournment streak (from most recent backwards)
    consecutive = 0
    for h in reversed(hearings):
        if h.adjourned:
            consecutive += 1
        else:
            break

    # Last substantive hearing (not adjourned)
    substantive = [h for h in hearings if not h.adjourned]
    last_substantive = substantive[-1].date if substantive else None

    # Next hearing
    future = [h for h in hearings if h.next_date and h.next_date > date.today().isoformat()]
    next_hearing = future[-1].next_date if future else None
    next_purpose = future[-1].purpose if future else None

    days_since = None
    if last_substantive:
        try:
            delta = date.today() - date.fromisoformat(last_substantive)
            days_since = delta.days
        except ValueError:
            pass

    days_to_next = None
    if next_hearing:
        try:
            delta = date.fromisoformat(next_hearing) - date.today()
            days_to_next = max(0, delta.days)
        except ValueError:
            pass

    return AdjournmentProfile(
        total_hearings=total,
        total_adjournments=total_adj,
        adjournment_rate=round(total_adj / total, 2) if total else 0.0,
        prosecution_caused=prosecution_ct,
        defence_caused=defence_ct,
        court_caused=court_ct,
        unknown_caused=unknown_ct,
        consecutive_adjournments=consecutive,
        last_substantive_hearing=last_substantive,
        next_hearing_date=next_hearing,
        next_hearing_purpose=next_purpose,
        days_since_last_action=days_since,
        days_to_next_hearing=days_to_next,
    )


# ---------------------------------------------------------------------------
# Step 4: Claude-Powered Related Case Validation & Classification
# ---------------------------------------------------------------------------

RELATED_CASE_SYSTEM = """
You are a legal intelligence engine for India's criminal justice system.

You will receive:
1. A primary case's details (accused name, FIR number, charge sections, court)
2. A list of candidate related cases scraped from eCourts

Your job is to classify each candidate case and return a JSON array.
For each candidate, determine:
- relation_type: "same_accused" | "co_accused" | "fir_split" | "appeal" | "transfer" | "unrelated"
- relation_confidence: 0.0 to 1.0
- include: true/false (whether to include in the related cases corpus)

Rules:
- A case with the EXACT same FIR number = fir_split or transfer (high confidence)
- A case with the same accused name AND overlapping charge sections = same_accused (medium-high)
- A case with a co-accused name from the primary FIR = co_accused
- Never auto-merge if only name similarity — flag uncertain ones with confidence < 0.6
- "unrelated" cases must still be returned with include: false
- Return ONLY a valid JSON array. No preamble, no markdown.

Schema per item:
{
  "case_number": "string",
  "relation_type": "same_accused|co_accused|fir_split|appeal|transfer|unrelated",
  "relation_confidence": 0.0-1.0,
  "include": true|false,
  "reasoning": "one sentence"
}
"""


async def classify_related_cases(primary: dict, candidates: list[dict]) -> list[dict]:
    """
    Use Claude to validate and classify candidate related cases.
    Primary and candidates are plain dicts with case metadata.
    """
    if not candidates:
        return []

    prompt = f"""
PRIMARY CASE:
{json.dumps(primary, indent=2)}

CANDIDATE RELATED CASES ({len(candidates)} found):
{json.dumps(candidates[:30], indent=2)}
"""

    try:
        response = ANTHROPIC_CLIENT.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=3000,
            system=RELATED_CASE_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except Exception as e:
        logger.error(f"Claude classification failed: {e}")
        return []


# ---------------------------------------------------------------------------
# Step 5: Parse Bail Applications from HTML
# ---------------------------------------------------------------------------

BAIL_PARSE_SYSTEM = """
You are a legal document parser specialising in Indian bail applications.

Extract all bail application records from the provided HTML/text and return a JSON array.
Each item:
{
  "application_number": "string",
  "filed_date": "YYYY-MM-DD or null",
  "applicant": "string",
  "court": "string",
  "stage": "Regular Bail|Anticipatory Bail|Default Bail|Interim Bail",
  "outcome": "Granted|Rejected|Pending|Withdrawn|null",
  "order_date": "YYYY-MM-DD or null",
  "surety_amount": number or null,
  "conditions": ["list of conditions imposed if granted"],
  "rejection_reasons": ["list of reasons if rejected"]
}

Default Bail = bail under Sec 167(2) CrPC / Sec 187(2) BNSS for non-filing of charge sheet within 60/90 days.
Return ONLY the JSON array. No markdown, no preamble.
"""


async def parse_bail_applications(html_or_text: str) -> list[BailApplication]:
    """
    Parse bail application history from case page HTML using Claude.
    """
    try:
        response = ANTHROPIC_CLIENT.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            system=BAIL_PARSE_SYSTEM,
            messages=[{"role": "user", "content": html_or_text[:6000]}],
        )
        raw = response.content[0].text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        items = json.loads(raw)
        return [BailApplication(**item) for item in items if isinstance(item, dict)]
    except Exception as e:
        logger.warning(f"Bail application parse failed: {e}")
        return []


# ---------------------------------------------------------------------------
# Step 6: UTRC Flag Detection
# ---------------------------------------------------------------------------

def compute_utrc_flags(
    corpus: "CaseCorpus",
    detention_months: int,
    half_sentence_months: Optional[int],
) -> tuple[bool, list[str]]:
    """
    Determine if this case should be escalated to the Under-Trial Review Committee.
    Sec 479 BNSS / UTRC guidelines trigger conditions.
    """
    flags: list[str] = []
    profile = corpus.adjournment_profile

    # Approaching or past half-sentence threshold
    if half_sentence_months and detention_months >= half_sentence_months:
        flags.append(
            f"Detained {detention_months} months — at or past half-sentence threshold "
            f"({half_sentence_months} months). Sec 479 BNSS review mandatory."
        )

    if half_sentence_months and detention_months >= half_sentence_months * 0.85:
        flags.append(
            f"Within 15% of half-sentence threshold — window opening soon."
        )

    # Systemic adjournment — Sec 479(2) escalation trigger
    if profile and profile.adjournment_rate >= 0.75:
        flags.append(
            f"High adjournment rate ({profile.adjournment_rate:.0%}) — "
            f"systemic court delay detected."
        )

    if profile and profile.consecutive_adjournments >= 5:
        flags.append(
            f"{profile.consecutive_adjournments} consecutive adjournments without substantive progress."
        )

    # Prosecution-driven delay majority
    if profile and profile.total_adjournments > 0:
        p_rate = profile.prosecution_caused / profile.total_adjournments
        if p_rate > 0.5:
            flags.append(
                f"Prosecution caused {p_rate:.0%} of adjournments — "
                f"grounds for default bail / expedited hearing request."
            )

    # Bail granted but not executed (surety blocked)
    for ba in corpus.bail_applications:
        if ba.outcome == "Granted" and ba.surety_amount and ba.surety_amount > 0:
            flags.append(
                f"Bail granted (₹{ba.surety_amount:,.0f} surety) but accused still detained — "
                f"surety execution blocked. Sec 440 review required."
            )

    # No bail application filed despite eligibility
    if not corpus.bail_applications and detention_months >= 3:
        flags.append(
            "No bail application on record despite extended detention — "
            "NALSA representation may be required."
        )

    return (len(flags) > 0, flags)


# ---------------------------------------------------------------------------
# Step 7: Extract Case Metadata from HTML
# ---------------------------------------------------------------------------

def extract_case_metadata(html: str) -> dict:
    """
    Parse key case metadata from eCourts case detail page HTML.
    """
    soup = BeautifulSoup(html, "html.parser")
    meta = {}

    def find_value(label_pattern: str) -> Optional[str]:
        """Find value adjacent to a label in a table."""
        for tag in soup.find_all(string=re.compile(label_pattern, re.I)):
            parent = tag.find_parent(["td", "th", "dt", "label"])
            if parent:
                sibling = parent.find_next_sibling(["td", "dd"])
                if sibling:
                    return sibling.get_text(strip=True)
        return None

    meta["case_status"]   = find_value(r"case\s*status")
    meta["filing_date"]   = find_value(r"filing\s*date|date\s*of\s*filing")
    meta["court_name"]    = find_value(r"court\s*name|court")
    meta["judge_name"]    = find_value(r"judge|presiding\s*officer")
    meta["next_hearing"]  = find_value(r"next\s*(date|hearing)")

    # Normalise dates from DD/MM/YYYY → YYYY-MM-DD
    for key in ["filing_date", "next_hearing"]:
        if meta.get(key):
            m = re.search(r"(\d{2})[/\-\.](\d{2})[/\-\.](\d{4})", meta[key])
            if m:
                d, mo, y = m.groups()
                meta[key] = f"{y}-{mo}-{d}"

    return meta


# ---------------------------------------------------------------------------
# Main Agent Entry Point
# ---------------------------------------------------------------------------

async def run_agent2(fir_bundle: FIRBundle) -> CaseCorpus:
    """
    Agent 2 — Full related-case scraping pipeline.

    Inputs:  fir_bundle (FIRBundle from Agent 1)
    Outputs: CaseCorpus (Pydantic model, JSON-serialisable)
    """
    logger.info(f"Agent 2 starting — Case ID: {fir_bundle.case_id}")
    errors: list[str] = []
    warnings: list[str] = []
    data_sources: list[str] = []

    # Parse case ID for court coordinates
    from justicegrid_agent1_fir_extractor import parse_case_id
    parsed = parse_case_id(fir_bundle.case_id)
    state_code = parsed["state_code"]
    case_type  = parsed["case_type"]
    year       = parsed["year"]
    number     = parsed["number"]
    court_code = "01"  # Default; real system resolves from CNR or user input

    # Primary accused
    primary_accused = "Unknown"
    if fir_bundle.firs:
        for fir in fir_bundle.firs:
            if fir.accused:
                primary_accused = fir.accused[0].name
                break

    logger.info(f"Primary accused: {primary_accused}, State: {state_code}")

    # -----------------------------------------------------------------------
    # 1. Fetch main case page
    # -----------------------------------------------------------------------
    logger.info("Fetching main case page...")
    case_page = await fetch_case_html(state_code, court_code, case_type, number, year)

    if "error" in case_page:
        errors.append(f"Main case page fetch failed: {case_page['error']}")
    else:
        data_sources.append(case_page.get("source", "unknown"))

    html = case_page.get("html", "")
    meta = extract_case_metadata(html) if html else {}
    logger.info(f"Case status: {meta.get('case_status', 'unknown')}, "
                f"Court: {meta.get('court_name', 'unknown')}")

    # -----------------------------------------------------------------------
    # 2. Parse hearing history
    # -----------------------------------------------------------------------
    logger.info("Parsing hearing history...")
    hearings = parse_hearing_table(html)
    adj_profile = build_adjournment_profile(hearings) if hearings else None
    logger.info(f"Found {len(hearings)} hearings, "
                f"adjournment rate: {adj_profile.adjournment_rate:.0%}" if adj_profile else
                f"Found {len(hearings)} hearings")

    # -----------------------------------------------------------------------
    # 3. Search related cases by accused name + aliases
    # -----------------------------------------------------------------------
    logger.info("Searching related cases by accused name...")
    all_accused_names = set()
    all_fir_numbers   = set()

    for fir in fir_bundle.firs:
        all_fir_numbers.add(fir.fir_number)
        for acc in fir.accused:
            all_accused_names.add(acc.name)
            all_accused_names.update(acc.aliases)

    candidate_cases: list[dict] = []

    # Name-based search for each accused + alias
    for name in list(all_accused_names)[:5]:  # Cap at 5 to avoid rate limiting
        results = await search_cases_by_name(name, state_code, court_code)
        candidate_cases.extend(results)
        if results:
            data_sources.append("ecourts_name_search")
            logger.info(f"  '{name}' → {len(results)} candidate case(s)")

    # FIR-number-based search
    for fir in fir_bundle.firs:
        if fir.fir_number and fir.police_station:
            results = await search_cases_by_fir(fir.fir_number, fir.police_station, state_code)
            candidate_cases.extend(results)
            if results:
                data_sources.append("ecourts_fir_search")
                logger.info(f"  FIR {fir.fir_number} → {len(results)} case(s)")

    # Deduplicate candidates by case number
    seen: set[str] = set()
    unique_candidates = []
    for c in candidate_cases:
        cn = c.get("case_number") or c.get("cnr") or str(c)
        if cn not in seen:
            seen.add(cn)
            unique_candidates.append(c)

    logger.info(f"Total unique candidate cases: {len(unique_candidates)}")

    # -----------------------------------------------------------------------
    # 4. Claude validation of related cases
    # -----------------------------------------------------------------------
    logger.info("Classifying related cases with Claude...")
    primary_dict = {
        "case_id": fir_bundle.case_id,
        "state_code": state_code,
        "accused_names": list(all_accused_names),
        "fir_numbers": list(all_fir_numbers),
        "charge_sections": [
            cs.ipc_section for fir in fir_bundle.firs
            for cs in fir.charge_sections if cs.ipc_section
        ],
    }

    classified = await classify_related_cases(primary_dict, unique_candidates)

    related_cases: list[RelatedCase] = []
    for item in classified:
        if not item.get("include", False):
            continue
        # Find the original candidate to get full metadata
        original = next(
            (c for c in unique_candidates
             if c.get("case_number") == item.get("case_number")), {}
        )
        try:
            rc = RelatedCase(
                case_number=item["case_number"],
                case_type=original.get("case_type", "CR"),
                court_name=original.get("court_name", meta.get("court_name", "Unknown")),
                court_code=original.get("court_code", court_code),
                state_code=original.get("state_code", state_code),
                district=original.get("district"),
                filing_date=original.get("filing_date"),
                accused_names=original.get("accused_names", []),
                charge_sections=original.get("charge_sections", []),
                case_status=original.get("status", "Unknown"),
                disposal_nature=original.get("disposal_nature"),
                relation_type=item["relation_type"],
                relation_confidence=float(item.get("relation_confidence", 0.6)),
                source_url=original.get("url"),
            )
            related_cases.append(rc)
        except Exception as e:
            warnings.append(f"Failed to build RelatedCase for {item.get('case_number')}: {e}")

    logger.info(f"Validated {len(related_cases)} related case(s) included")

    # -----------------------------------------------------------------------
    # 5. Fetch and parse bail applications
    # -----------------------------------------------------------------------
    logger.info("Fetching bail application history...")
    raw_bail_data = await search_bail_applications(fir_bundle.case_id, court_code, state_code)
    bail_text = json.dumps(raw_bail_data) if raw_bail_data else html  # fallback to case page
    bail_apps = await parse_bail_applications(bail_text)
    bail_granted = any(b.outcome == "Granted" for b in bail_apps)
    default_bail = any(b.stage == "Default Bail" for b in bail_apps)
    logger.info(f"Found {len(bail_apps)} bail application(s). Granted: {bail_granted}")

    # -----------------------------------------------------------------------
    # 6. Compute UTRC flags
    # -----------------------------------------------------------------------
    # Estimate detention months from Agent 1 data
    detention_months = 0
    if fir_bundle.firs:
        for fir in fir_bundle.firs:
            if fir.fir_date:
                try:
                    filed = date.fromisoformat(fir.fir_date)
                    detention_months = max(detention_months,
                                          (date.today() - filed).days // 30)
                except ValueError:
                    pass

    # Build partial corpus to pass to flag function
    partial_corpus = CaseCorpus(
        case_id=fir_bundle.case_id,
        court_name=meta.get("court_name", "Unknown"),
        court_code=court_code,
        state_code=state_code,
        district=meta.get("district"),
        accused_primary=primary_accused,
        scraped_at=datetime.utcnow().isoformat(),
        case_status=meta.get("case_status", "Unknown"),
        filing_date=meta.get("filing_date"),
        charge_sections=[
            cs.ipc_section for fir in fir_bundle.firs
            for cs in fir.charge_sections if cs.ipc_section
        ],
        judge_name=meta.get("judge_name"),
        next_hearing_date=meta.get("next_hearing"),
        related_cases=related_cases,
        total_related_found=len(related_cases),
        bail_applications=bail_apps,
        bail_granted=bail_granted,
        default_bail_eligible=default_bail,
        hearings=hearings,
        adjournment_profile=adj_profile,
        utrc_flagged=False,
        utrc_flag_reasons=[],
        agent_confidence=0.0,
        data_sources_used=list(set(data_sources)),
        errors=errors,
        scrape_warnings=warnings,
    )

    utrc_flagged, utrc_reasons = compute_utrc_flags(
        partial_corpus, detention_months, fir_bundle.half_sentence_months
    )
    logger.info(f"UTRC flagged: {utrc_flagged} ({len(utrc_reasons)} reason(s))")

    # -----------------------------------------------------------------------
    # 7. Compute agent confidence
    # -----------------------------------------------------------------------
    confidence_factors = []

    if html:
        confidence_factors.append(0.9)   # Main page fetched
    else:
        confidence_factors.append(0.2)

    if hearings:
        confidence_factors.append(0.85)
    else:
        confidence_factors.append(0.3)
        warnings.append("No hearing history extracted — case page may be JS-rendered")

    if bail_apps:
        confidence_factors.append(0.8)
    else:
        confidence_factors.append(0.5)
        warnings.append("No bail applications found — may not have been filed yet")

    related_conf = sum(rc.relation_confidence for rc in related_cases) / max(1, len(related_cases))
    confidence_factors.append(related_conf if related_cases else 0.5)

    if errors:
        confidence_factors = [f * 0.85 for f in confidence_factors]

    agent_confidence = round(sum(confidence_factors) / len(confidence_factors), 2)

    # -----------------------------------------------------------------------
    # 8. Assemble final corpus
    # -----------------------------------------------------------------------
    corpus = CaseCorpus(
        case_id=fir_bundle.case_id,
        court_name=meta.get("court_name", "Unknown"),
        court_code=court_code,
        state_code=state_code,
        district=meta.get("district"),
        accused_primary=primary_accused,
        scraped_at=datetime.utcnow().isoformat(),
        case_status=meta.get("case_status", "Unknown"),
        filing_date=meta.get("filing_date"),
        charge_sections=[
            cs.ipc_section for fir in fir_bundle.firs
            for cs in fir.charge_sections if cs.ipc_section
        ],
        judge_name=meta.get("judge_name"),
        next_hearing_date=meta.get("next_hearing"),
        related_cases=related_cases,
        total_related_found=len(related_cases),
        bail_applications=bail_apps,
        bail_granted=bail_granted,
        default_bail_eligible=default_bail,
        hearings=hearings,
        adjournment_profile=adj_profile,
        utrc_flagged=utrc_flagged,
        utrc_flag_reasons=utrc_reasons,
        agent_confidence=agent_confidence,
        data_sources_used=list(set(data_sources)),
        errors=errors,
        scrape_warnings=warnings,
    )

    logger.info(
        f"Agent 2 complete — {len(related_cases)} related case(s), "
        f"{len(hearings)} hearing(s), {len(bail_apps)} bail application(s), "
        f"UTRC={utrc_flagged}, confidence={agent_confidence:.0%}"
    )
    return corpus


# ---------------------------------------------------------------------------
# CLI runner
# ---------------------------------------------------------------------------

async def main():
    import sys

    # Load Agent 1 output (from file or run inline)
    if len(sys.argv) > 2 and sys.argv[2].endswith(".json"):
        with open(sys.argv[2]) as f:
            bundle_data = json.load(f)
        fir_bundle = FIRBundle(**bundle_data)
    else:
        # Run Agent 1 inline
        from justicegrid_agent1_fir_extractor import run_agent1
        case_id = sys.argv[1] if len(sys.argv) > 1 else "MH/CR/2024/00847"
        logger.info("Running Agent 1 first to get FIR bundle...")
        fir_bundle = await run_agent1(case_id)

    corpus = await run_agent2(fir_bundle)

    print("\n" + "=" * 60)
    print("AGENT 2 OUTPUT — CASE CORPUS")
    print("=" * 60)
    print(corpus.model_dump_json(indent=2))

    # Handoff summary for Agent 3
    print("\n" + "=" * 60)
    print("HANDOFF PAYLOAD → Agent 3 (Cross-Reference & Eligibility)")
    print("=" * 60)
    adj = corpus.adjournment_profile
    handoff = {
        "case_id": corpus.case_id,
        "accused_primary": corpus.accused_primary,
        "court": corpus.court_name,
        "case_status": corpus.case_status,
        "next_hearing_date": corpus.next_hearing_date,
        "related_cases_count": corpus.total_related_found,
        "related_case_types": list({rc.relation_type for rc in corpus.related_cases}),
        "bail_granted": corpus.bail_granted,
        "bail_application_count": len(corpus.bail_applications),
        "adjournment_rate": adj.adjournment_rate if adj else None,
        "consecutive_adjournments": adj.consecutive_adjournments if adj else None,
        "prosecution_caused_pct": (
            round(adj.prosecution_caused / adj.total_adjournments, 2)
            if adj and adj.total_adjournments else None
        ),
        "days_to_next_hearing": adj.days_to_next_hearing if adj else None,
        "utrc_flagged": corpus.utrc_flagged,
        "utrc_flag_reasons": corpus.utrc_flag_reasons,
        "agent_confidence": corpus.agent_confidence,
        "errors": corpus.errors,
    }
    print(json.dumps(handoff, indent=2))


if __name__ == "__main__":
    asyncio.run(main())