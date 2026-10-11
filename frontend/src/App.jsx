import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BeneficiaryProfile from './components/BeneficiaryProfile';
import RuleConfig from './components/RuleConfig';
import LedgerTable from './components/LedgerTable';
import ReceiptModal from './components/ReceiptModal';
import AuditMath from './components/AuditMath';
import ReportView from './components/ReportView';
import { Sliders, BookOpen, Calculator, FileCheck2, ArrowRight } from 'lucide-react';

const FALLBACK_PRESETS = [
  {
    id: 'nfsa_partial_stockout',
    title: 'NFSA Priority Household — Partial Delivery (Stockout Variance)',
    description: '4 members entitled to 20kg Rice and 20kg Wheat. 15kg Rice received in 2 visits, 5kg shortfall documented.',
    beneficiary: {
      card_number: 'NFSA-07-2849102',
      head_of_family: 'Sunita Devi',
      family_member_count: 4,
      category: 'PHH (Priority Household)',
      fps_id: 'FPS-DL-1104',
      fps_name: 'Sharma Fair Price Store, Shakarpur',
      period: 'October 2026'
    },
    rules: [
      { id: 'r1', commodity: 'Rice', rule_type: 'per_member', quantity: 5.0, unit: 'kg', period_label: 'Monthly', subsidy_rate: 0 },
      { id: 'r2', commodity: 'Wheat', rule_type: 'per_member', quantity: 5.0, unit: 'kg', period_label: 'Monthly', subsidy_rate: 0 }
    ],
    distributions: [
      {
        id: 'd1',
        date: '2026-10-04',
        commodity: 'Wheat',
        quantity_received: 20.0,
        unit: 'kg',
        source_type: 'POS_RECEIPT',
        receipt_reference: 'POS-TXN-88192',
        raw_evidence: 'e-PoS Trans ID: POS-TXN-88192 | Date: 04/10/2026 | Item: WHEAT | Qty: 20.00 KG',
        is_verified_by_user: true
      },
      {
        id: 'd2',
        date: '2026-10-04',
        commodity: 'Rice',
        quantity_received: 10.0,
        unit: 'kg',
        source_type: 'POS_RECEIPT',
        receipt_reference: 'POS-TXN-88193',
        raw_evidence: 'e-PoS Trans ID: POS-TXN-88193 | Date: 04/10/2026 | Item: RICE | Qty: 10.00 KG | Note: Dealer indicated temporary stock shortage for balance.',
        is_verified_by_user: true
      },
      {
        id: 'd3',
        date: '2026-10-16',
        commodity: 'Rice',
        quantity_received: 5.0,
        unit: 'kg',
        source_type: 'DEALER_SLIP',
        receipt_reference: 'SLIP-OCT-42',
        raw_evidence: 'Handwritten Chit #42: Issued 5kg Rice from fresh lot to card NFSA-07-2849102.',
        is_verified_by_user: true
      }
    ]
  },
  {
    id: 'aay_flat_multivisit',
    title: 'AAY Card — Flat Quota Multi-Visit & Unrecorded Sugar',
    description: 'Antyodaya Anna Yojana flat card quota (35kg Wheat + 1kg Sugar). Wheat lifted across 3 visits totaling 31kg (4kg shortfall); Sugar unrecorded.',
    beneficiary: {
      card_number: 'AAY-UP-9938120',
      head_of_family: 'Ram Kishore',
      family_member_count: 5,
      category: 'AAY (Antyodaya Anna Yojana)',
      fps_id: 'FPS-UP-4402',
      fps_name: 'Gram Vikas Sahakari Bhandar, Ayodhya',
      period: 'October 2026'
    },
    rules: [
      { id: 'r_w', commodity: 'Wheat', rule_type: 'flat_household', quantity: 35.0, unit: 'kg', period_label: 'Monthly', subsidy_rate: 0 },
      { id: 'r_s', commodity: 'Sugar', rule_type: 'flat_household', quantity: 1.0, unit: 'kg', period_label: 'Monthly', subsidy_rate: 13.5 }
    ],
    distributions: [
      {
        id: 'ad1',
        date: '2026-10-03',
        commodity: 'Wheat',
        quantity_received: 15.0,
        unit: 'kg',
        source_type: 'POS_RECEIPT',
        receipt_reference: 'POS-9931',
        raw_evidence: 'e-PoS Terminal #12: Distributed 15.0 KG Wheat to card AAY-UP-9938120 on 03/10/2026.',
        is_verified_by_user: true
      },
      {
        id: 'ad2',
        date: '2026-10-12',
        commodity: 'Wheat',
        quantity_received: 10.0,
        unit: 'kg',
        source_type: 'SMS_ALERT',
        receipt_reference: 'SMS-AUTH-77',
        raw_evidence: 'SMS: Food Dept: 10.00 KG WHEAT lifted on 12-10-2026 at FPS 4402. Auth Code: SMS-AUTH-77',
        is_verified_by_user: true
      },
      {
        id: 'ad3',
        date: '2026-10-22',
        commodity: 'Wheat',
        quantity_received: 6.0,
        unit: 'kg',
        source_type: 'MANUAL_NOTE',
        receipt_reference: 'NOTE-VISIT-3',
        raw_evidence: 'Beneficiary Diary: Collected 6 kg Wheat on third visit. Dealer stated remaining 4 kg not yet delivered to shop.',
        is_verified_by_user: true
      }
    ]
  },
  {
    id: 'perfect_reconciliation',
    title: 'Complete Multi-Commodity Fulfilment (Zero Variance)',
    description: 'Entitlement rules exactly match recorded POS receipts across Rice and Wheat.',
    beneficiary: {
      card_number: 'PHH-MH-552190',
      head_of_family: 'Laxmi Bai',
      family_member_count: 3,
      category: 'PHH (Priority Household)',
      fps_id: 'FPS-MH-8812',
      fps_name: 'Nagpur Central Public Distribution Center',
      period: 'October 2026'
    },
    rules: [
      { id: 'm1', commodity: 'Rice', rule_type: 'per_member', quantity: 3.0, unit: 'kg', period_label: 'Monthly', subsidy_rate: 0 },
      { id: 'm2', commodity: 'Wheat', rule_type: 'per_member', quantity: 2.0, unit: 'kg', period_label: 'Monthly', subsidy_rate: 0 }
    ],
    distributions: [
      {
        id: 'pd1',
        date: '2026-10-06',
        commodity: 'Rice',
        quantity_received: 9.0,
        unit: 'kg',
        source_type: 'POS_RECEIPT',
        receipt_reference: 'MH-POS-3310',
        raw_evidence: 'e-PoS Receipt MH-POS-3310: 9.0 KG Rice delivered on 06-10-2026.',
        is_verified_by_user: true
      },
      {
        id: 'pd2',
        date: '2026-10-06',
        commodity: 'Wheat',
        quantity_received: 6.0,
        unit: 'kg',
        source_type: 'POS_RECEIPT',
        receipt_reference: 'MH-POS-3311',
        raw_evidence: 'e-PoS Receipt MH-POS-3311: 6.0 KG Wheat delivered on 06-10-2026.',
        is_verified_by_user: true
      }
    ]
  }
];

export default function App() {
  const [presets, setPresets] = useState(FALLBACK_PRESETS);
  const [activePresetId, setActivePresetId] = useState(FALLBACK_PRESETS[0].id);

  const [beneficiary, setBeneficiary] = useState(FALLBACK_PRESETS[0].beneficiary);
  const [rules, setRules] = useState(FALLBACK_PRESETS[0].rules);
  const [distributions, setDistributions] = useState(FALLBACK_PRESETS[0].distributions);

  const [activeTab, setActiveTab] = useState('audit'); // default to audit so results are immediately visible
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Load presets from backend if available
  useEffect(() => {
    fetch('/api/presets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPresets(data);
        }
      })
      .catch((err) => console.log('Using local presets fallback:', err));
  }, []);

  const handleSelectPreset = (id) => {
    const found = presets.find((p) => p.id === id);
    if (found) {
      setActivePresetId(id);
      setBeneficiary(found.beneficiary);
      setRules(found.rules);
      setDistributions(found.distributions);
    }
  };

  const handleReset = () => {
    setActivePresetId(null);
    setBeneficiary({
      card_number: 'NEW-CARD-001',
      head_of_family: '',
      family_member_count: 4,
      category: 'PHH (Priority Household)',
      fps_id: '',
      fps_name: '',
      period: 'October 2026'
    });
    setRules([]);
    setDistributions([]);
    setActiveTab('rules');
  };

  // Deterministic Line Audits Calculation
  // Pure arithmetic calculation performed in client and verified with backend principles
  const lineAudits = rules.map((rule) => {
    const entitled = rule.rule_type === 'per_member'
      ? parseFloat((rule.quantity * beneficiary.family_member_count).toFixed(2))
      : parseFloat(rule.quantity.toFixed(2));

    const ruleExpr = rule.rule_type === 'per_member'
      ? `${rule.quantity} ${rule.unit}/member × ${beneficiary.family_member_count} members = ${entitled} ${rule.unit}`
      : `Fixed household quota = ${entitled} ${rule.unit}`;

    // Filter matching distributions by commodity (case-insensitive)
    const matching = distributions.filter(
      (d) => d.commodity.trim().toLowerCase() === rule.commodity.trim().toLowerCase()
    );

    const sumReceived = matching.reduce((acc, curr) => acc + curr.quantity_received, 0);
    const totalReceived = parseFloat(sumReceived.toFixed(2));
    const difference = parseFloat((entitled - totalReceived).toFixed(2));

    let status = 'FULFILLED';
    if (matching.length === 0) {
      status = 'UNRECORDED';
    } else if (difference > 0.001) {
      status = 'SHORTFALL';
    } else if (difference < -0.001) {
      status = 'SURPLUS';
    }

    const proofDeliveries = matching.length > 0
      ? matching.map((m) => `${m.quantity_received} ${m.unit} on ${m.date} (Ref: ${m.receipt_reference})`).join(' + ')
      : '0 delivery records logged';

    const arithmeticProof = `Entitlement Calculation: ${ruleExpr}\nDeliveries Breakdown: ${proofDeliveries} = Total Received ${totalReceived} ${rule.unit}\nExact Arithmetic: Entitled (${entitled} ${rule.unit}) - Received (${totalReceived} ${rule.unit}) = ${difference > 0 ? `${difference} ${rule.unit} Shortfall` : difference < 0 ? `${Math.abs(difference)} ${rule.unit} Surplus` : '0.00 Balanced'}.`;

    let neutralObs = '';
    if (status === 'SHORTFALL') {
      neutralObs = `Records indicate a net variance of ${difference} ${rule.unit} for ${rule.commodity} between the declared entitlement (${entitled} ${rule.unit}) and acknowledged receipts (${totalReceived} ${rule.unit}). This variance may be related to shop inventory constraints, split collection batches, or pending ledger synchronisation.`;
    } else if (status === 'UNRECORDED') {
      neutralObs = `Zero collections are currently documented for ${rule.commodity} for the billing period ${beneficiary.period}. Entitlement remains at ${entitled} ${rule.unit}, pending receipt submission or deferred collection.`;
    } else if (status === 'SURPLUS') {
      neutralObs = `Recorded collections (${totalReceived} ${rule.unit}) exceed the configured entitlement (${entitled} ${rule.unit}) by ${Math.abs(difference)} ${rule.unit}. May represent carryover replenishment from an earlier cycle.`;
    } else {
      neutralObs = `Recorded receipts precisely reconcile with the configured entitlement (${entitled} ${rule.unit}) across ${matching.length} delivery transaction(s).`;
    }

    return {
      commodity: rule.commodity,
      unit: rule.unit,
      rule_type: rule.rule_type,
      rule_expression: ruleExpr,
      entitled_quantity: entitled,
      total_received: totalReceived,
      difference,
      status,
      deliveries_count: matching.length,
      deliveries: matching,
      evidence_references: matching.map((m) => m.receipt_reference),
      arithmetic_proof: arithmeticProof,
      neutral_observation: neutralObs
    };
  });

  const hasShortfall = lineAudits.some((a) => a.status === 'SHORTFALL' || a.status === 'UNRECORDED');
  const overallStatus = hasShortfall ? 'SHORTFALL_IDENTIFIED' : 'FULLY_RECONCILED';

  return (
    <div>
      <Header
        presets={presets}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
      />

      <main className="container">
        {/* Step navigation tabs */}
        <div className="nav-tabs no-print">
          <button
            onClick={() => setActiveTab('rules')}
            className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
          >
            <Sliders size={16} /> 1. Household & Explicit Rules
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
          >
            <BookOpen size={16} /> 2. Distribution Ledger & Evidence ({distributions.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          >
            <Calculator size={16} /> 3. Line-by-Line Arithmetic Audit
            {hasShortfall && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }}></span>}
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          >
            <FileCheck2 size={16} /> 4. Neutral Grievance Report (Official)
          </button>
        </div>

        {/* Tab 1: Household & Explicit Rules */}
        {activeTab === 'rules' && (
          <div>
            <BeneficiaryProfile
              beneficiary={beneficiary}
              onChange={setBeneficiary}
            />
            <RuleConfig
              rules={rules}
              memberCount={beneficiary.family_member_count}
              onRulesChange={setRules}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setActiveTab('ledger')} className="btn btn-primary">
                Proceed to Distribution Ledger <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Distribution Ledger & Evidence */}
        {activeTab === 'ledger' && (
          <div>
            <LedgerTable
              distributions={distributions}
              onAddDistribution={(newRec) => setDistributions([...distributions, newRec])}
              onRemoveDistribution={(id) => setDistributions(distributions.filter((d) => d.id !== id))}
              onOpenReceiptModal={() => setIsReceiptModalOpen(true)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button onClick={() => setActiveTab('rules')} className="btn btn-outline">
                ← Back to Rules
              </button>
              <button onClick={() => setActiveTab('audit')} className="btn btn-primary">
                View Line-by-Line Arithmetic Audit <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Line-by-Line Arithmetic Audit */}
        {activeTab === 'audit' && (
          <div>
            <AuditMath
              lineAudits={lineAudits}
              overallStatus={overallStatus}
              disclaimer="Calculations derived via deterministic arithmetic based strictly on user-entered rules. AI is not used for arithmetic."
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
              <button onClick={() => setActiveTab('ledger')} className="btn btn-outline">
                ← Back to Ledger
              </button>
              <button onClick={() => setActiveTab('report')} className="btn btn-accent" style={{ background: '#1e3a8a' }}>
                Generate Official Grievance Statement <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Neutral Grievance Report */}
        {activeTab === 'report' && (
          <div>
            <ReportView
              beneficiary={beneficiary}
              rules={rules}
              distributions={distributions}
              lineAudits={lineAudits}
              overallStatus={overallStatus}
            />
          </div>
        )}

        {/* Receipt Parser & Human in the loop confirmation modal */}
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          onAddRecord={(newRec) => setDistributions([...distributions, newRec])}
        />
      </main>
    </div>
  );
}
