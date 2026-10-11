from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EntitlementRule(BaseModel):
    id: str
    commodity: str = Field(..., description="E.g., Rice, Wheat, Sugar, Kerosene")
    rule_type: str = Field(..., description="'per_member' or 'flat_household'")
    quantity: float = Field(..., gt=0, description="Quantity per member or per card")
    unit: str = Field(default="kg", description="Unit of measurement (kg, liter, packet)")
    period_label: str = Field(default="Monthly", description="Period cycle")
    subsidy_rate: Optional[float] = Field(default=None, description="Price per unit (INR) if applicable")

class BeneficiaryProfile(BaseModel):
    card_number: str
    head_of_family: str
    family_member_count: int = Field(..., ge=1)
    category: str = Field(default="PHH", description="PHH, AAY, General, BPL")
    fps_id: str = Field(default="", description="Fair Price Shop Code")
    fps_name: str = Field(default="", description="Fair Price Shop / Dealer Name")
    period: str = Field(default="October 2026", description="Entitlement billing period")

class DistributionRecord(BaseModel):
    id: str
    date: str
    commodity: str
    quantity_received: float = Field(..., ge=0)
    unit: str = Field(default="kg")
    source_type: str = Field(..., description="'POS_RECEIPT', 'SMS_ALERT', 'DEALER_SLIP', 'MANUAL_NOTE'")
    receipt_reference: str = Field(..., description="Receipt/Txn Number or Identifier")
    raw_evidence: str = Field(..., description="Verbatim text of receipt, slip, or note")
    is_verified_by_user: bool = Field(default=True, description="Human confirmation status")

class LineItemAudit(BaseModel):
    commodity: str
    unit: str
    rule_type: str
    rule_expression: str
    entitled_quantity: float
    total_received: float
    difference: float  # entitled - received (positive = shortfall, negative = surplus)
    status: str        # SHORTFALL, FULFILLED, SURPLUS, UNRECORDED
    deliveries_count: int
    deliveries: List[Dict[str, Any]]
    evidence_references: List[str]
    arithmetic_proof: str
    neutral_observation: str

class AuditCalculationRequest(BaseModel):
    beneficiary: BeneficiaryProfile
    rules: List[EntitlementRule]
    distributions: List[DistributionRecord]

class AuditCalculationResponse(BaseModel):
    beneficiary: BeneficiaryProfile
    rules_applied: List[EntitlementRule]
    line_audits: List[LineItemAudit]
    overall_status: str
    neutral_summary: str
    disclaimer: str

class ReceiptParseRequest(BaseModel):
    raw_text: str

class SuggestedExtraction(BaseModel):
    commodity: Optional[str] = None
    quantity: Optional[float] = None
    unit: str = "kg"
    date: Optional[str] = None
    receipt_reference: Optional[str] = None
    fps_id: Optional[str] = None
    source_type_inferred: str = "POS_RECEIPT"
    confidence: float
    is_suggestion: bool = True
    disclaimer: str = "Extracted values are suggestions. The user must verify and confirm before recording. Arithmetic never depends on AI."
