from pydantic import BaseModel, Field
from typing import Optional

class ClientCreate(BaseModel):
    client_id: str
    mother_tongue: str
    family_contact_number: str

class CaseCreate(BaseModel):
    client_id: str
    report_details: str
    city: str
    ipc_section: str
    bailable: str
    cognizable: str
    max_sentence: int
    date_of_occurrence: Optional[str] = None
    priority_score: Optional[int] = None
    priority_level: Optional[str] = None
    detention_days: Optional[int] = None
    adjournment_prob: Optional[int] = None
    hearing_outcome: Optional[str] = None
    conflict_flag: Optional[str] = None
    confidence: Optional[float] = None
    reason: Optional[str] = None
