# RationSaathi (राशन साथी)
### Public Distribution Entitlement & Dispute Assistant
**Domain 6 — Public Systems & Civic Technology (Problem Statement P-01)**

---

## 🏛️ Executive Summary

Public distribution schemes provide subsidised essential commodities to eligible households at set quantities for designated periods. In practice:
- Collections may be partial or spread over several visits across a month.
- Receipts may be faint, torn, or in varying formats (e-PoS thermal slips, SMS confirmations, or dealer register chits).
- Beneficiaries lack a simple, objective method to compare what they are owed against what was received.
- **Critical Civic Insight:** A shortfall is **not** evidence of wrongdoing. Variances frequently stem from genuine shop stock shortages, phased supply batches, or offline terminal recording delays.

**RationSaathi** solves this by providing an evidence-based, mathematically deterministic reconciliation assistant that generates certified **Neutral Grievance Statements** ready for submission to District Grievance Redressal Officers (DGRO).

---

## ⚖️ Core Principles & Requirements Addressed

| Requirement from Problem Statement | RationSaathi Implementation |
| :--- | :--- |
| **1. Explicit Entitlement Rules Only** | Entitlements are configured strictly by explicit user rules (`per_member` or `flat_household`). The system explicitly applies **only** provided rules and never assumes unstated quotas. |
| **2. Exact Line-by-Line Arithmetic** | Calculations use deterministic decimal arithmetic with full step-by-step mathematical proofs that users and civic officers can inspect line by line. AI is **never** used for arithmetic. |
| **3. Evidence Linking for Every Record** | Every distribution entry links to a source reference (POS transaction ID, SMS alert token, dealer voucher chit) and preserves the raw verbatim excerpt in the final report. |
| **4. Human-in-the-Loop Receipt Extraction** | Receipt text interpreter extracts suggestions (commodity, quantity, date, ref) with confidence scoring. Extracted values are presented in a confirmation modal that the user **must review and confirm** before adding to the ledger. |
| **5. Strictly Neutral Grievance Language** | The system enforces strict neutral language compliance: zero accusatory phrases (`fraud`, `theft`, `corruption`), keeps potential causes open (stockout, split collection), and requests administrative verification. |

---

## 📁 Project Directory Structure

```
rationsaathi/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI endpoints (CORS, calculation, parsing, reports)
│   │   ├── models.py            # Pydantic schemas (Rules, Records, Audit, Grievance)
│   │   ├── engine.py            # Deterministic arithmetic & explicit rule calculation engine
│   │   ├── parser.py            # Receipt/slip interpreter with confidence & disclaimer
│   │   ├── classifier.py        # Discrepancy classifier & neutral statement generator
│   │   └── presets.py           # Preloaded realistic hackathon scenarios
│   ├── requirements.txt         # FastAPI, Uvicorn, Pydantic
│   └── test_engine.py           # Automated unit test suite verifying arithmetic & neutrality
├── frontend/
│   ├── package.json             # React, Lucide Icons, Vite
│   ├── vite.config.js           # Vite dev server with proxy to backend
│   ├── index.html               # Civic portal entry page
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Main dashboard orchestrating 4 evaluation steps
│       ├── styles.css           # Civic Tech design system & print letterhead CSS
│       └── components/
│           ├── Header.jsx       # Civic branding & 1-click hackathon demo presets
│           ├── BeneficiaryProfile.jsx # Ration card & household parameters
│           ├── RuleConfig.jsx   # Step 1: Explicit Entitlement Rules manager
│           ├── LedgerTable.jsx  # Step 2: Distribution ledger with evidence links
│           ├── ReceiptModal.jsx # Step 2b: Receipt parser & human-in-the-loop review
│           ├── AuditMath.jsx    # Step 3: Exact line-by-line arithmetic proofs
│           └── ReportView.jsx   # Step 4: Neutral Discrepancy Grievance Report (printable)
├── run_backend.bat              # 1-click backend launcher (Windows)
├── run_frontend.bat             # 1-click frontend launcher (Windows)
├── run_all.bat                  # 1-click launcher for both servers
└── README.md                    # Documentation & hackathon pitch guide
```

---

## 🚀 Stepwise Setup & Execution Procedure

### Prerequisites
- Python 3.10+ (Installed: Python 3.13)
- Node.js 18+ (Installed: Node v24)

### Method 1: One-Click Quick Start (Windows)
Simply double-click:
```powershell
run_all.bat
```
This opens two terminal windows for the backend and frontend.

### Method 2: Manual Terminal Execution

#### 1. Backend Setup:
```powershell
cd backend
python -m pip install -r requirements.txt
python test_engine.py
python -m uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

#### 2. Frontend Setup:
In a new terminal:
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
- Open your browser at: `http://localhost:5173`

---

## 🎯 Hackathon Demonstration & Judging Walkthrough

To demo the solution to the judges in 2 minutes:

1. **Top Demo Bar (1-Click Presets):**
   - Click **`NFSA Priority Household`**: Loads Sunita Devi's card (4 members, 5kg Rice/member = 20kg entitled). Shows 2 partial collections (10kg + 5kg = 15kg) with POS receipt and handwritten slip references, automatically calculating the **5.0 kg Shortfall**.
   - Click **`AAY Card`**: Demonstrates Antyodaya flat quotas (35kg Wheat + 1kg Sugar) with Wheat collected over 3 separate visits (15kg + 10kg + 6kg = 31kg; 4kg shortfall) and **Unrecorded Sugar**.
   - Click **`Complete Fulfilment`**: Shows zero variance baseline.

2. **Step 1 — Explicit Rules:**
   - Show how the rule table allows changing family members or adding custom commodities (e.g. Pulses, Kerosene). Point out the banner: *"Applies strictly to explicit user-entered rules without assumptions."*

3. **Step 2 — Evidence Linking & Receipt Parser (Human-in-the-Loop):**
   - Click **`Interpret Receipt / Slip (AI Suggestion)`**.
   - Click **`Sample e-PoS Slip`** or **`Sample SMS Alert`**.
   - Click **`Extract Suggestions`**: Show how AI/heuristics suggest quantity and date, but displays the mandatory warning: *"Human-in-the-Loop Review Required. Values are suggestions only. Arithmetic never depends on AI."*
   - Click **`Confirm & Save to Ledger`**.

4. **Step 3 — Line-by-Line Arithmetic Audit:**
   - Walk through the visual equation breakdown (`5.0 kg/member × 4 members = 20.0 kg; Total received = 10.0 kg + 5.0 kg = 15.0 kg; Difference = 5.0 kg Shortfall`).

5. **Step 4 — Certified Neutral Grievance Statement:**
   - Click **`4. Neutral Grievance Report`**.
   - Show the official Department letterhead, complete evidence appendix, and neutral cause declaration.
   - Click **`Print / Save PDF`** or **`Copy Statement Text`**.
