from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any, Tuple
from app.models import (
    BeneficiaryProfile,
    EntitlementRule,
    DistributionRecord,
    LineItemAudit,
    AuditCalculationResponse
)

def round_qty(val: float) -> float:
    d = Decimal(str(val))
    return float(d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

def calculate_entitlement(rule: EntitlementRule, member_count: int) -> Tuple[float, str]:
    if rule.rule_type == "per_member":
        total = round_qty(rule.quantity * member_count)
        expr = f"{rule.quantity} {rule.unit}/member × {member_count} family members = {total} {rule.unit}"
        return total, expr
    elif rule.rule_type == "flat_household":
        total = round_qty(rule.quantity)
        expr = f"Fixed household quota = {total} {rule.unit}"
        return total, expr
    else:
        total = round_qty(rule.quantity)
        expr = f"Specified rule = {total} {rule.unit}"
        return total, expr

def perform_deterministic_audit(
    beneficiary: BeneficiaryProfile,
    rules: List[EntitlementRule],
    distributions: List[DistributionRecord]
) -> AuditCalculationResponse:
    # Notice: Apply ONLY rules provided by the user. Do not assume or add default rules.
    line_audits: List[LineItemAudit] = []
    has_shortfall = False
    has_surplus = False
    all_fulfilled = True

    # Group distributions by commodity (case-insensitive normalized matching)
    dist_by_commodity: Dict[str, List[DistributionRecord]] = {}
    for d in distributions:
        norm_c = d.commodity.strip().lower()
        dist_by_commodity.setdefault(norm_c, []).append(d)

    for rule in rules:
        norm_rule_c = rule.commodity.strip().lower()
        matching_dists = dist_by_commodity.get(norm_rule_c, [])

        entitled_qty, rule_expr = calculate_entitlement(rule, beneficiary.family_member_count)
        
        # Calculate sum of deliveries deterministically
        deliveries_list: List[Dict[str, Any]] = []
        evidence_refs: List[str] = []
        sum_received_decimal = Decimal("0.00")

        for dist in matching_dists:
            qty_dec = Decimal(str(dist.quantity_received))
            sum_received_decimal += qty_dec
            deliveries_list.append({
                "id": dist.id,
                "date": dist.date,
                "quantity": dist.quantity_received,
                "unit": dist.unit,
                "source_type": dist.source_type,
                "receipt_reference": dist.receipt_reference,
                "raw_evidence": dist.raw_evidence,
                "is_verified": dist.is_verified_by_user
            })
            if dist.receipt_reference:
                evidence_refs.append(f"{dist.receipt_reference} ({dist.date})")

        total_received = float(sum_received_decimal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
        diff_decimal = Decimal(str(entitled_qty)) - sum_received_decimal
        difference = float(diff_decimal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

        # Status classification
        if len(matching_dists) == 0:
            status = "UNRECORDED"
            has_shortfall = True
            all_fulfilled = False
        elif difference > 0.0001:
            status = "SHORTFALL"
            has_shortfall = True
            all_fulfilled = False
        elif difference < -0.0001:
            status = "SURPLUS"
            has_surplus = True
            all_fulfilled = False
        else:
            status = "FULFILLED"

        # Explicit step-by-step arithmetic proof string
        if len(matching_dists) == 0:
            math_proof = (
                f"Entitlement: {rule_expr}.\n"
                f"Deliveries: 0 records found for {rule.commodity}.\n"
                f"Arithmetic: Entitled ({entitled_qty} {rule.unit}) - Received (0.00 {rule.unit}) = "
                f"Unallocated balance of {difference} {rule.unit}."
            )
        else:
            deliveries_breakdown = " + ".join([f"{d['quantity']} {d['unit']} on {d['date']}" for d in deliveries_list])
            math_proof = (
                f"Entitlement: {rule_expr}.\n"
                f"Deliveries Breakdown: {deliveries_breakdown} = Total Received {total_received} {rule.unit}.\n"
                f"Arithmetic: Entitled ({entitled_qty} {rule.unit}) - Received ({total_received} {rule.unit}) = "
                f"{'Shortfall of ' + str(difference) if difference > 0 else ('Surplus of ' + str(abs(difference)) if difference < 0 else 'Exact reconciliation (0.00 difference)')} {rule.unit}."
            )

        # Neutral observation phrasing:
        if status == "SHORTFALL":
            obs = (
                f"Records indicate a net difference of {difference} {rule.unit} for {rule.commodity} "
                f"between the declared entitlement ({entitled_qty} {rule.unit}) and acknowledged receipts ({total_received} {rule.unit}). "
                f"Evidence references cited: {', '.join(evidence_refs) if evidence_refs else 'None'}. "
                f"The difference may be attributable to stock availability limitations, split delivery cycles, or pending distribution logs."
            )
        elif status == "UNRECORDED":
            obs = (
                f"No distribution transactions are currently logged for {rule.commodity} for the billing period {beneficiary.period}. "
                f"The calculated entitlement stands at {entitled_qty} {rule.unit}. "
                f"This may indicate a deferred collection date or pending receipt submission."
            )
        elif status == "SURPLUS":
            obs = (
                f"Recorded receipts ({total_received} {rule.unit}) exceed the configured entitlement ({entitled_qty} {rule.unit}) "
                f"by {abs(difference)} {rule.unit}. "
                f"This may reflect arrears disbursement from a preceding period or special supplementary allocation."
            )
        else:
            obs = (
                f"Recorded receipts ({total_received} {rule.unit}) precisely match the configured entitlement ({entitled_qty} {rule.unit}). "
                f"Reconciliation complete across {len(matching_dists)} recorded delivery event(s)."
            )

        line_audits.append(LineItemAudit(
            commodity=rule.commodity,
            unit=rule.unit,
            rule_type=rule.rule_type,
            rule_expression=rule_expr,
            entitled_quantity=entitled_qty,
            total_received=total_received,
            difference=difference,
            status=status,
            deliveries_count=len(matching_dists),
            deliveries=deliveries_list,
            evidence_references=evidence_refs,
            arithmetic_proof=math_proof,
            neutral_observation=obs
        ))

    # Overall summary status
    if has_shortfall:
        overall_status = "SHORTFALL_IDENTIFIED"
    elif has_surplus:
        overall_status = "SURPLUS_RECORDED"
    elif all_fulfilled and len(rules) > 0:
        overall_status = "FULLY_RECONCILED"
    else:
        overall_status = "NO_RULES_SPECIFIED"

    # Overall neutral summary
    neutral_summary = (
        f"Reconciliation assessment for beneficiary card {beneficiary.card_number} ({beneficiary.head_of_family}) "
        f"for the period {beneficiary.period} under Fair Price Shop '{beneficiary.fps_id or 'Not Specified'}'. "
        f"Calculations are strictly derived from the {len(rules)} explicit user-entered entitlement rule(s). "
        f"Status: {overall_status}. "
        f"Any identified numerical variance is documented with source references to support administrative verification. "
        f"No attribution of motive or fault is made or implied."
    )

    disclaimer = (
        "CIVIC NOTICE: All calculations in this audit are performed via deterministic arithmetic based exclusively "
        "on the user-defined rules and recorded evidence entries. AI is not utilized for mathematical calculations. "
        "A numerical shortfall is an administrative difference and does not constitute evidence of wrongdoing."
    )

    return AuditCalculationResponse(
        beneficiary=beneficiary,
        rules_applied=rules,
        line_audits=line_audits,
        overall_status=overall_status,
        neutral_summary=neutral_summary,
        disclaimer=disclaimer
    )
