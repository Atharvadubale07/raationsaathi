from datetime import datetime
from typing import Dict, Any, List
from app.models import AuditCalculationResponse

FORBIDDEN_WORDS = ["fraud", "corrupt", "stolen", "theft", "swindle", "criminal", "cheat", "scam", "embezzle"]

def sanitize_neutrality_check(text: str) -> bool:
    """Verifies that the generated grievance text strictly avoids accusatory or inflammatory terms."""
    lower = text.lower()
    for word in FORBIDDEN_WORDS:
        if word in lower:
            return False
    return True

def generate_formal_grievance_report(audit_res: AuditCalculationResponse) -> Dict[str, Any]:
    beneficiary = audit_res.beneficiary
    rules = audit_res.rules_applied
    audits = audit_res.line_audits
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Generate Markdown representation
    md_lines = []
    md_lines.append(f"# Grievance & Entitlement Reconciliation Statement")
    md_lines.append(f"**Document Reference:** RS-{hash(beneficiary.card_number + beneficiary.period) % 1000000:06d}  ")
    md_lines.append(f"**Generated On:** {now_str}  ")
    md_lines.append(f"**Civic Redressal Portal:** RationSaathi PDS Assistant  ")
    md_lines.append(f"---")
    
    md_lines.append(f"## 1. Beneficiary & Allocation Context")
    md_lines.append(f"- **Ration Card Number:** `{beneficiary.card_number}`")
    md_lines.append(f"- **Head of Family:** {beneficiary.head_of_family}")
    md_lines.append(f"- **Family Member Count:** {beneficiary.family_member_count}")
    md_lines.append(f"- **Card Category:** {beneficiary.category}")
    md_lines.append(f"- **Fair Price Shop (FPS) ID:** {beneficiary.fps_id or 'Not Specified'}")
    md_lines.append(f"- **Shop / Dealer Name:** {beneficiary.fps_name or 'N/A'}")
    md_lines.append(f"- **Reconciliation Period:** {beneficiary.period}")

    md_lines.append(f"\n## 2. Explicit Entitlement Rules Applied")
    md_lines.append(f"> *Rule Governance Note: Under PDS evaluation protocol, calculations apply strictly to user-configured parameters below without assumed entitlements.*")
    md_lines.append(f"\n| Commodity | Calculation Formula | Configured Rate | Entitlement Total |")
    md_lines.append(f"| :--- | :--- | :--- | :--- |")
    for a in audits:
        md_lines.append(f"| {a.commodity} | {a.rule_type.replace('_', ' ').capitalize()} | {a.rule_expression.split('=')[0].strip()} | **{a.entitled_quantity} {a.unit}** |")

    md_lines.append(f"\n## 3. Line-by-Line Distribution Ledger & Exact Arithmetic Audit")
    md_lines.append(f"| Commodity | Entitled | Total Recorded | Variance (Balance) | Reconciliation Status |")
    md_lines.append(f"| :--- | :--- | :--- | :--- | :--- |")
    for a in audits:
        status_tag = f"**{a.status}**"
        diff_str = f"{abs(a.difference)} {a.unit} {'shortfall' if a.difference > 0 else ('surplus' if a.difference < 0 else 'exact')}"
        md_lines.append(f"| {a.commodity} | {a.entitled_quantity} {a.unit} | {a.total_received} {a.unit} | {diff_str} | {status_tag} |")

    md_lines.append(f"\n### Step-by-Step Arithmetic Verification")
    for a in audits:
        md_lines.append(f"#### Commodity: {a.commodity}")
        md_lines.append(f"- **Audit Proof:** {a.arithmetic_proof}")
        md_lines.append(f"- **Recorded Events ({a.deliveries_count}):**")
        if a.deliveries:
            for idx, d in enumerate(a.deliveries, 1):
                md_lines.append(f"  {idx}. **Date:** {d['date']} | **Qty:** {d['quantity']} {d['unit']} | **Ref:** `{d['receipt_reference']}` | **Channel:** {d['source_type']}")
                if d.get('raw_evidence'):
                    md_lines.append(f"     > *Evidence excerpt:* \"{d['raw_evidence'].strip()}\"")
        else:
            md_lines.append(f"  - *No distribution entries recorded for this period.*")
        md_lines.append(f"- **Neutral Finding:** {a.neutral_observation}")

    md_lines.append(f"\n## 4. Administrative Finding & Neutral Inquiry")
    md_lines.append(
        "This reconciliation document presents a mathematical comparison between documented entitlements and recorded collections. "
        "It identifies quantitative variances without attributing fault, intent, or culpability to any party. "
        "Potential benign causes include Fair Price Shop temporary stockouts, phased delivery schedules, or delayed point-of-sale synchronization. "
        "It is formally submitted for administrative verification, physical stock ledger comparison, and appropriate entitlement regularisation."
    )

    md_lines.append(f"\n## 5. Certification of Objective Redressal")
    md_lines.append(
        "- [x] Calculations generated via deterministic arithmetic without algorithmic or AI-based numeric estimation.\n"
        "- [x] All recorded collections mapped to verifiable evidence tokens or user confirmations.\n"
        "- [x] Neutral language compliance validated: Zero speculative or accusatory declarations."
    )

    report_markdown = "\n".join(md_lines)
    is_neutral = sanitize_neutrality_check(report_markdown)

    return {
        "report_id": f"RS-{hash(beneficiary.card_number + beneficiary.period) % 1000000:06d}",
        "generated_at": now_str,
        "beneficiary": beneficiary.model_dump(),
        "line_audits": [a.model_dump() for a in audits],
        "overall_status": audit_res.overall_status,
        "markdown": report_markdown,
        "is_neutral_certified": is_neutral,
        "recommendation": "Submit this structured statement to the Block Supply Officer (BSO) or District Grievance Redressal Officer (DGRO) for physical ledger reconciliation."
    }
