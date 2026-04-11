from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ClientCreate(BaseModel):
    client_id: str
    mother_tongue: str
    family_contact_number: str

class CaseCreate(BaseModel):
    # Core Case Information
    report_number: Optional[int] = None
    client_id: str
    city: str
    crime_description: str
    assigned_ipc: str
    assigned_bns: Optional[str] = None
    
    # Dates
    date_reported: Optional[datetime] = None
    date_of_occurrence: Optional[datetime] = None
    
    # Victim Information
    victim_age: Optional[int] = None
    victim_gender: Optional[str] = None
    
    # Legal Information
    bailable: str
    cognizable: str
    max_sentence: int
    
    # Contact Information
    family_contact_number: Optional[str] = None
    mother_tongue: Optional[str] = None
    
    # Case Status
    case_closed: Optional[bool] = False
    
    # AI-Computed Fields (Optional)
    detention_days: Optional[int] = None
    eligible: Optional[bool] = None
    priority_score: Optional[int] = None
    priority_level: Optional[str] = None
    adjournment_prob: Optional[int] = None
    conflict_flag: Optional[str] = None
    reason: Optional[str] = None
    confidence: Optional[float] = None
    delay_decision: Optional[str] = None
    
    # Hearing Information (Optional)
    hearing_outcome: Optional[str] = None
    next_hearing_date: Optional[datetime] = None
    last_hearing_date: Optional[datetime] = None
    
    # Bail Information (Optional)
    bail_status: Optional[str] = None
    bail_decision_date: Optional[datetime] = None
    bail_delay_days: Optional[int] = None
    
    # Court & Facility Information (Optional)
    court_name: Optional[str] = None
    surety_amount: Optional[int] = None
    surety_blocked: Optional[bool] = None
    prison_name: Optional[str] = None
    
    # Special Flags (Optional)
    eligible_but_detained: Optional[bool] = None
    section_440_flag: Optional[bool] = False
    section_440_brief: Optional[str] = None
