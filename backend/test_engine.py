import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models import BeneficiaryProfile, EntitlementRule, DistributionRecord
from app.engine import perform_deterministic_audit
from app.parser import parse_receipt_text
from app.classifier import generate_formal_grievance_report, sanitize_neutrality_check

def test_arithmetic_and_rules():
    print("[1/4] Testing deterministic arithmetic & explicit rule engine...")
    beneficiary = BeneficiaryProfile(
        card_number="TEST-PHH-101",
        head_of_family="Asha Devi",
        family_member_count=4,
        category="PHH",
        period="October 2026"
    )
    rules = [
        EntitlementRule(
            id="r1",
            commodity="Rice",
            rule_type="per_member",
            quantity=5.0,
            unit="kg"
        ),
        EntitlementRule(
            id="r2",
            commodity="Sugar",
            rule_type="flat_household",
            quantity=1.0,
            unit="kg"
        )
    ]
    distributions = [
        # Partial collection 1 for Rice
        DistributionRecord(
            id="d1",
            date="2026-10-04",
            commodity="Rice",
            quantity_received=12.5,
            unit="kg",
            source_type="POS_RECEIPT",
            receipt_reference="POS-991",
            raw_evidence="e-PoS 991: 12.5 kg Rice given"
        ),
        # Partial collection 2 for Rice
        DistributionRecord(
            id="d2",
            date="2026-10-14",
            commodity="Rice",
            quantity_received=5.0,
            unit="kg",
            source_type="DEALER_SLIP",
            receipt_reference="SLIP-10",
            raw_evidence="Chit 10: 5 kg Rice collected"
        )
    ]

    res = perform_deterministic_audit(beneficiary, rules, distributions)

    # Verification:
    # Rice entitled = 4 * 5.0 = 20.0 kg.
    # Total received = 12.5 + 5.0 = 17.5 kg.
    # Shortfall = 20.0 - 17.5 = 2.5 kg.
    rice_audit = next(a for a in res.line_audits if a.commodity == "Rice")
    assert rice_audit.entitled_quantity == 20.0, f"Expected 20.0, got {rice_audit.entitled_quantity}"
    assert rice_audit.total_received == 17.5, f"Expected 17.5, got {rice_audit.total_received}"
    assert rice_audit.difference == 2.5, f"Expected 2.5, got {rice_audit.difference}"
    assert rice_audit.status == "SHORTFALL", f"Expected SHORTFALL, got {rice_audit.status}"
    assert "POS-991" in rice_audit.evidence_references[0]

    # Sugar:
    sugar_audit = next(a for a in res.line_audits if a.commodity == "Sugar")
    assert sugar_audit.entitled_quantity == 1.0
    assert sugar_audit.total_received == 0.0
    assert sugar_audit.difference == 1.0
    assert sugar_audit.status == "UNRECORDED"

    print("  [OK] Exact arithmetic and explicit rules test PASSED!")
    return res

def test_parser():
    print("[2/4] Testing receipt text interpretation...")
    sample_text = "e-PoS Trans ID: 88219 Date: 04/10/2026 Item: RICE Qty: 15.0 KG Rate: 0.00 FPS: 2490"
    ext = parse_receipt_text(sample_text)
    assert ext.commodity == "Rice", f"Expected Rice, got {ext.commodity}"
    assert ext.quantity == 15.0, f"Expected 15.0, got {ext.quantity}"
    assert ext.unit == "kg"
    assert ext.is_suggestion is True
    assert "88219" in ext.receipt_reference
    print("  [OK] Receipt text parsing with AI suggestion notice PASSED!")

def test_neutrality(audit_res):
    print("[3/4] Testing neutral language and grievance statement generation...")
    report = generate_formal_grievance_report(audit_res)
    assert report["is_neutral_certified"] is True, "Report failed neutrality check!"
    markdown = report["markdown"]
    assert sanitize_neutrality_check(markdown) is True
    # Ensure no fraud accusations
    for word in ["fraud", "theft", "stolen", "swindle", "cheat"]:
        assert word not in markdown.lower(), f"Forbidden word '{word}' found in report!"
    print("  [OK] Neutral language compliance PASSED!")

if __name__ == "__main__":
    audit_res = test_arithmetic_and_rules()
    test_parser()
    test_neutrality(audit_res)
    print("\n[4/4] ALL BACKEND UNIT TESTS PASSED SUCCESSFULLY! [PASS]\n")
