from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from app.models import (
    AuditCalculationRequest,
    AuditCalculationResponse,
    ReceiptParseRequest,
    SuggestedExtraction
)
from app.engine import perform_deterministic_audit
from app.parser import parse_receipt_text
from app.classifier import generate_formal_grievance_report, sanitize_neutrality_check
from app.presets import PRESET_SCENARIOS

app = FastAPI(
    title="RationSaathi API — Public Distribution Entitlement & Dispute Assistant",
    description="Deterministic arithmetic engine, evidence linking, and neutral discrepancy reporter for PDS grievances.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RationSaathi Backend",
        "domain": "Domain 6 — Public Systems & Civic Technology",
        "problem_id": "P-01",
        "principles": [
            "Deterministic line-by-line arithmetic",
            "Explicit user-defined rules only (no assumed rules)",
            "Evidence preservation for every record",
            "Human-in-the-loop receipt interpretation (AI suggestion only)",
            "Strict neutral grievance phrasing without fraud accusations"
        ]
    }

@app.get("/api/presets")
def get_presets() -> List[Dict[str, Any]]:
    return PRESET_SCENARIOS

@app.post("/api/rules/calculate", response_model=AuditCalculationResponse)
def calculate_audit(payload: AuditCalculationRequest):
    if not payload.rules:
        raise HTTPException(
            status_code=400,
            detail="At least one explicit entitlement rule must be provided. System applies only explicit rules without assumption."
        )
    return perform_deterministic_audit(
        beneficiary=payload.beneficiary,
        rules=payload.rules,
        distributions=payload.distributions
    )

@app.post("/api/receipts/parse", response_model=SuggestedExtraction)
def parse_receipt(payload: ReceiptParseRequest):
    if not payload.raw_text.strip():
        raise HTTPException(status_code=400, detail="Receipt text cannot be empty.")
    return parse_receipt_text(payload.raw_text)

@app.post("/api/reports/generate")
def generate_report(audit_res: AuditCalculationResponse):
    report_data = generate_formal_grievance_report(audit_res)
    return report_data
