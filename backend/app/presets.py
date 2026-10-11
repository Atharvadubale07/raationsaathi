from typing import List, Dict, Any

PRESET_SCENARIOS: List[Dict[str, Any]] = [
    {
        "id": "nfsa_partial_stockout",
        "title": "NFSA Priority Household — Partial Delivery (Stockout Variance)",
        "description": "4-member household entitled to 20kg Rice and 20kg Wheat. Rice received in two separate visits (10kg + 5kg = 15kg), resulting in a 5kg shortfall documented across POS and slip evidence.",
        "beneficiary": {
            "card_number": "NFSA-07-2849102",
            "head_of_family": "Sunita Devi",
            "family_member_count": 4,
            "category": "PHH (Priority Household)",
            "fps_id": "FPS-DL-1104",
            "fps_name": "Sharma Fair Price Store, Shakarpur",
            "period": "October 2026"
        },
        "rules": [
            {
                "id": "rule_rice",
                "commodity": "Rice",
                "rule_type": "per_member",
                "quantity": 5.0,
                "unit": "kg",
                "period_label": "Monthly",
                "subsidy_rate": 0.0
            },
            {
                "id": "rule_wheat",
                "commodity": "Wheat",
                "rule_type": "per_member",
                "quantity": 5.0,
                "unit": "kg",
                "period_label": "Monthly",
                "subsidy_rate": 0.0
            }
        ],
        "distributions": [
            {
                "id": "dist_1",
                "date": "2026-10-04",
                "commodity": "Wheat",
                "quantity_received": 20.0,
                "unit": "kg",
                "source_type": "POS_RECEIPT",
                "receipt_reference": "POS-TXN-88192",
                "raw_evidence": "e-PoS Trans ID: POS-TXN-88192 | Date: 04/10/2026 | Item: WHEAT | Qty: 20.00 KG | FPS: FPS-DL-1104 | Biometric Auth: Success",
                "is_verified_by_user": True
            },
            {
                "id": "dist_2",
                "date": "2026-10-04",
                "commodity": "Rice",
                "quantity_received": 10.0,
                "unit": "kg",
                "source_type": "POS_RECEIPT",
                "receipt_reference": "POS-TXN-88193",
                "raw_evidence": "e-PoS Trans ID: POS-TXN-88193 | Date: 04/10/2026 | Item: RICE | Qty: 10.00 KG | Note: Dealer indicated temporary stock shortage for balance 10kg.",
                "is_verified_by_user": True
            },
            {
                "id": "dist_3",
                "date": "2026-10-16",
                "commodity": "Rice",
                "quantity_received": 5.0,
                "unit": "kg",
                "source_type": "DEALER_SLIP",
                "receipt_reference": "SLIP-OCT-42",
                "raw_evidence": "Handwritten Dealer Chit #42: Issued 5kg Rice from interim replenishment lot to card NFSA-07-2849102. Date 16-10-2026.",
                "is_verified_by_user": True
            }
        ]
    },
    {
        "id": "aay_flat_multivisit",
        "title": "AAY Card — Flat Quota Multi-Visit & Unrecorded Sugar",
        "description": "Antyodaya Anna Yojana flat card quota (35kg Wheat + 1kg Sugar). Wheat lifted across 3 separate visits totaling 31kg (4kg shortfall); Sugar unrecorded (1kg uncollected).",
        "beneficiary": {
            "card_number": "AAY-UP-9938120",
            "head_of_family": "Ram Kishore",
            "family_member_count": 5,
            "category": "AAY (Antyodaya Anna Yojana)",
            "fps_id": "FPS-UP-4402",
            "fps_name": "Gram Vikas Sahakari Bhandar, Ayodhya",
            "period": "October 2026"
        },
        "rules": [
            {
                "id": "rule_aay_wheat",
                "commodity": "Wheat",
                "rule_type": "flat_household",
                "quantity": 35.0,
                "unit": "kg",
                "period_label": "Monthly",
                "subsidy_rate": 0.0
            },
            {
                "id": "rule_aay_sugar",
                "commodity": "Sugar",
                "rule_type": "flat_household",
                "quantity": 1.0,
                "unit": "kg",
                "period_label": "Monthly",
                "subsidy_rate": 13.50
            }
        ],
        "distributions": [
            {
                "id": "aay_dist_1",
                "date": "2026-10-03",
                "commodity": "Wheat",
                "quantity_received": 15.0,
                "unit": "kg",
                "source_type": "POS_RECEIPT",
                "receipt_reference": "POS-9931",
                "raw_evidence": "e-PoS Terminal #12: Distributed 15.0 KG Wheat to card AAY-UP-9938120 on 03/10/2026. Ref: POS-9931",
                "is_verified_by_user": True
            },
            {
                "id": "aay_dist_2",
                "date": "2026-10-12",
                "commodity": "Wheat",
                "quantity_received": 10.0,
                "unit": "kg",
                "source_type": "SMS_ALERT",
                "receipt_reference": "SMS-AUTH-77",
                "raw_evidence": "SMS: Food Dept: 10.00 KG WHEAT lifted on 12-10-2026 at 11:20 AM from FPS 4402. Auth Code: SMS-AUTH-77",
                "is_verified_by_user": True
            },
            {
                "id": "aay_dist_3",
                "date": "2026-10-22",
                "commodity": "Wheat",
                "quantity_received": 6.0,
                "unit": "kg",
                "source_type": "MANUAL_NOTE",
                "receipt_reference": "NOTE-VISIT-3",
                "raw_evidence": "Beneficiary Diary: Collected 6 kg Wheat on third visit. Dealer stated remaining 4 kg not received in block quota.",
                "is_verified_by_user": True
            }
        ]
    },
    {
        "id": "perfect_reconciliation",
        "title": "Complete Multi-Commodity Fulfilment (Zero Variance)",
        "description": "Baseline verification case where entitlement rules exactly match all recorded POS receipts across Rice, Wheat, and Pulses.",
        "beneficiary": {
            "card_number": "PHH-MH-552190",
            "head_of_family": "Laxmi Bai",
            "family_member_count": 3,
            "category": "PHH (Priority Household)",
            "fps_id": "FPS-MH-8812",
            "fps_name": "Nagpur Central Public Distribution Center",
            "period": "October 2026"
        },
        "rules": [
            {
                "id": "rule_mh_rice",
                "commodity": "Rice",
                "rule_type": "per_member",
                "quantity": 3.0,
                "unit": "kg",
                "period_label": "Monthly",
                "subsidy_rate": 0.0
            },
            {
                "id": "rule_mh_wheat",
                "commodity": "Wheat",
                "rule_type": "per_member",
                "quantity": 2.0,
                "unit": "kg",
                "period_label": "Monthly",
                "subsidy_rate": 0.0
            }
        ],
        "distributions": [
            {
                "id": "perf_dist_1",
                "date": "2026-10-06",
                "commodity": "Rice",
                "quantity_received": 9.0,
                "unit": "kg",
                "source_type": "POS_RECEIPT",
                "receipt_reference": "MH-POS-3310",
                "raw_evidence": "e-PoS Receipt MH-POS-3310: 9.0 KG Rice delivered on 06-10-2026 to Card PHH-MH-552190.",
                "is_verified_by_user": True
            },
            {
                "id": "perf_dist_2",
                "date": "2026-10-06",
                "commodity": "Wheat",
                "quantity_received": 6.0,
                "unit": "kg",
                "source_type": "POS_RECEIPT",
                "receipt_reference": "MH-POS-3311",
                "raw_evidence": "e-PoS Receipt MH-POS-3311: 6.0 KG Wheat delivered on 06-10-2026 to Card PHH-MH-552190.",
                "is_verified_by_user": True
            }
        ]
    }
]
