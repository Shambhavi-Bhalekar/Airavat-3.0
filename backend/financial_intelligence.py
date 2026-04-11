# financial_intelligence.py
import datetime

# Mock dictionary mapping generic Indian cities to estimated median daily wages (INR).
# In a full production system, this would query a live MGNREGA / census API.
MEDIAN_WAGE_MAP = {
    "Mumbai": 450,
    "Delhi": 400,
    "Bangalore": 420,
    "Chennai": 380,
    "Kolkata": 350,
    "Pune": 400,
    "Hyderabad": 390,
    "Ahmedabad": 360,
    "Surat": 360,
    "Jaipur": 320,
    "Lucknow": 310,
    "Kanpur": 300,
    "Nagpur": 330,
    "Indore": 340,
    "Bhopal": 320,
    "Patna": 280,
    "Agra": 300,
    "Varanasi": 290
}

DEFAULT_MEDIAN_WAGE = 300  # Fallback for unrecognized cities/districts.

def generate_section_440_brief(case_data: dict, median_wage: int, ninety_day_income: int, delay_days: int) -> str:
    """Generates a Markdown brief for the Section 440 BNSS Surety Reduction Application."""
    client_id = case_data.get("client_id", "Unknown Client")
    city = case_data.get("city", "Unknown City")
    court = case_data.get("court_name", "Honourable Court")
    assigned_ipc = case_data.get("assigned_ipc", "Unknown Offense")
    surety_amount = case_data.get("surety_amount", 0)
    
    brief = f"""# APPLICATION UNDER SECTION 440 BNSS FOR REDUCTION OF SURETY

**IN THE COURT OF {court.upper()}, {city.upper()}**
**IN THE MATTER OF:** State vs. {client_id}
**FIR / CRIME DESC:** {assigned_ipc}

**MOST RESPECTFULLY SHOWETH:**

1. That the Applicant / Accused was granted bail by this Honourable Court on {case_data.get('bail_decision_date', 'a previous date')}, subject to furnishing a surety of **Rs. {surety_amount:,.2f}**.
2. That the Applicant belongs to a socio-economically marginalized background. The median estimated daily wage in {city} is approximately Rs. {median_wage}, yielding an estimated 90-day income of Rs. {ninety_day_income:,.2f}.
3. That the required surety of Rs. {surety_amount:,.2f} strictly exceeds the Applicant's 90-day estimated earning capacity, rendering it systematically unaffordable and essentially operating as a denial of bail.
4. That consequently, the Applicant has suffered an extended detention of **{delay_days} days** *solely* due to the inability to execute the financial conditions of the bail bond.
5. That under Section 440 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), the amount of every bond shall be fixed with due regard to the circumstances of the case and shall not be excessive.

**PRAYER:**
In view of the above, it is respectfully prayed that this Honourable Court may be pleased to graciously:
(a) Reduce the surety amount to a reasonable sum proportionate to the Applicant's demonstrable poverty.
(b) Or, in the alternative, permit the Applicant to be released on a Personal Bond without sureties.

**DRAWN BY:** JusticeGrid Automated Legal Aid Intelligence.
**DATE:** {datetime.datetime.now().strftime('%d-%m-%Y')}
    """
    return brief.strip()

def evaluate_surety(case_data: dict) -> dict:
    """
    Evaluates Pillar 07: Financial Intelligence.
    Returns a dictionary of updates to be merged into the case data.
    """
    updates = {
        "section_440_flag": False,
        "section_440_brief": None
    }
    
    bail_status = str(case_data.get("bail_status", "")).upper()
    surety_amount = case_data.get("surety_amount")
    
    # We only intervene if bail has been GRANTED
    if bail_status != "GRANTED" or not surety_amount:
        return updates
        
    # Calculate how many days have passed since bail was granted
    bail_decision_dt = case_data.get("bail_decision_date")
    delay_days = 0
    
    if bail_decision_dt:
        if isinstance(bail_decision_dt, str):
            try:
                dt = datetime.datetime.fromisoformat(bail_decision_dt.replace('Z', '+00:00'))
                # Handle naive vs aware datetime subtraction
                if dt.tzinfo is not None:
                    now = datetime.datetime.now(dt.tzinfo)
                else:
                    now = datetime.datetime.now()
                delay_days = (now - dt).days
            except ValueError:
                pass
        else:
            now = datetime.datetime.now(bail_decision_dt.tzinfo) if bail_decision_dt.tzinfo else datetime.datetime.now()
            delay_days = (now - bail_decision_dt).days
            
    # Update delay days in the case
    updates["bail_delay_days"] = delay_days
    
    # Financial Evaluation
    city = str(case_data.get("city", "Unknown")).strip()
    median_wage = MEDIAN_WAGE_MAP.get(city, DEFAULT_MEDIAN_WAGE)
    
    ninety_day_income = median_wage * 90
    
    surety_blocked = False
    # If more than 14 days have passed and surety still isn't met, or the system manually set surety_blocked flag
    if delay_days > 14 or case_data.get("surety_blocked"):
        surety_blocked = True
        
    updates["surety_blocked"] = surety_blocked
    
    # The Core Trigger: Does the surety amount exceed 90 days of local median income while blocked?
    if surety_blocked and surety_amount > ninety_day_income:
        updates["section_440_flag"] = True
        updates["section_440_brief"] = generate_section_440_brief(case_data, median_wage, ninety_day_income, delay_days)
        
    return updates
