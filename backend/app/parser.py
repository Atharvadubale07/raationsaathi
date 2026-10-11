import re
from typing import Optional
from datetime import datetime
from app.models import SuggestedExtraction

COMMODITIES_KNOWN = [
    "rice", "wheat", "sugar", "kerosene", "pulses", "dal", "atta", "oil", "salt", "chana"
]

def parse_receipt_text(text: str) -> SuggestedExtraction:
    cleaned = text.strip()
    lower = cleaned.lower()

    # 1. Detect Commodity
    detected_commodity = None
    for comm in COMMODITIES_KNOWN:
        if re.search(r'\b' + re.escape(comm) + r'\b', lower):
            detected_commodity = comm.capitalize()
            break
    if not detected_commodity:
        # fallback regex for "item: <word>"
        item_match = re.search(r'(?:item|commodity|grain|goods)\s*[:=-]?\s*([a-zA-Z]+)', cleaned, re.IGNORECASE)
        if item_match:
            detected_commodity = item_match.group(1).capitalize()

    # 2. Detect Quantity and Unit
    # Check explicit label first (e.g., "Qty: 15.0 KG"), then value with unit (e.g., "15.0 KG")
    qty_val = None
    unit_val = "kg"

    qty_label_match = re.search(r'(?:qty|quantity|wt|weight)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|litres?|ltr|packets?|pkt)?\b', cleaned, re.IGNORECASE)
    qty_unit_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|litres?|ltr|packets?|pkt)\b', cleaned, re.IGNORECASE)

    qty_match = qty_label_match or qty_unit_match
    if qty_match:
        try:
            qty_val = float(qty_match.group(1))
            matched_unit = qty_match.group(2) if len(qty_match.groups()) >= 2 else None
            if matched_unit:
                m_low = matched_unit.lower()
                if "lit" in m_low or "ltr" in m_low:
                    unit_val = "liter"
                elif "pkt" in m_low or "pack" in m_low:
                    unit_val = "packet"
                else:
                    unit_val = "kg"
        except (ValueError, TypeError):
            pass

    # 3. Detect Date
    # Formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, or DD Mon YYYY
    date_val = None
    # ISO: 2026-10-05
    iso_match = re.search(r'\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b', cleaned)
    if iso_match:
        y, m, d = iso_match.groups()
        date_val = f"{y}-{int(m):02d}-{int(d):02d}"
    else:
        # Standard Indian format: DD/MM/YYYY or DD-MM-YYYY
        dmy_match = re.search(r'\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b', cleaned)
        if dmy_match:
            d, m, y = dmy_match.groups()
            if len(y) == 2:
                y = f"20{y}"
            date_val = f"{y}-{int(m):02d}-{int(d):02d}"
        else:
            # e.g. 5 Oct 2026 or 05 October 2026
            mon_match = re.search(r'\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b', cleaned, re.IGNORECASE)
            if mon_match:
                d, mon_str, y = mon_match.groups()
                try:
                    dt = datetime.strptime(f"{d} {mon_str[:3]} {y}", "%d %b %Y")
                    date_val = dt.strftime("%Y-%m-%d")
                except ValueError:
                    date_val = None

    if not date_val:
        # Default to current date string if not found in text
        date_val = datetime.now().strftime("%Y-%m-%d")

    # 4. Detect Receipt / Transaction Reference
    ref_val = None
    ref_match = re.search(r'(?:txn|trans|receipt|rcpt|slip|bill|ref|inv|token)\s*(?:id|no|\#)?\s*[:=-]?\s*([a-zA-Z0-9\-_]+)', cleaned, re.IGNORECASE)
    if ref_match:
        ref_val = ref_match.group(1).upper()
    else:
        # Check any standalone code like TXN-12984 or POS88321
        code_match = re.search(r'\b([A-Z]{2,4}[-_]?[0-9]{4,8})\b', cleaned)
        if code_match:
            ref_val = code_match.group(1)

    if not ref_val:
        ref_val = f"REF-{hash(cleaned) % 100000:05d}"

    # 5. Detect FPS Code
    fps_val = None
    fps_match = re.search(r'(?:fps|shop|dealer)\s*(?:id|no|\#)?\s*[:=-]?\s*([a-zA-Z0-9\-_]+)', cleaned, re.IGNORECASE)
    if fps_match:
        fps_val = fps_match.group(1).upper()

    # 6. Detect Source Type
    source_type = "POS_RECEIPT"
    if "sms" in lower or "dear beneficiary" in lower or "collected" in lower:
        source_type = "SMS_ALERT"
    elif "slip" in lower or "handwritten" in lower or "khata" in lower or "note" in lower:
        source_type = "DEALER_SLIP"

    # Compute suggestion confidence
    score_factors = [
        1.0 if detected_commodity else 0.0,
        1.0 if qty_val is not None else 0.0,
        1.0 if ref_match else 0.5,
        1.0 if iso_match or dmy_match else 0.4
    ]
    confidence = round(sum(score_factors) / len(score_factors), 2)

    return SuggestedExtraction(
        commodity=detected_commodity or "Rice",
        quantity=qty_val if qty_val is not None else 0.0,
        unit=unit_val,
        date=date_val,
        receipt_reference=ref_val,
        fps_id=fps_val,
        source_type_inferred=source_type,
        confidence=confidence,
        is_suggestion=True,
        disclaimer=(
            "AI / Parser Suggestion Notice: Extracted values are purely preliminary suggestions for review. "
            "Beneficiary or caseworker must review and confirm exact numbers before saving to the ledger. "
            "Entitlement arithmetic never relies on AI extraction."
        )
    )
