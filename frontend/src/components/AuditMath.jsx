import React from 'react';
import { Calculator, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuditMath({ lineAudits, overallStatus, disclaimer }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'SHORTFALL':
        return <span className="badge badge-shortfall">⚠️ Shortfall Identified</span>;
      case 'FULFILLED':
        return <span className="badge badge-fulfilled">✓ Exact Fulfilment</span>;
      case 'SURPLUS':
        return <span className="badge badge-surplus">ℹ️ Supplementary Surplus</span>;
      case 'UNRECORDED':
        return <span className="badge badge-unrecorded">⏱️ Unrecorded (0 Deliveries)</span>;
      default:
        return <span className="badge badge-surplus">{status}</span>;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Calculator size={18} color="#1e3a8a" /> Step 3: Exact Line-by-Line Arithmetic Verification
        </h2>
        <div>
          {overallStatus === 'SHORTFALL_IDENTIFIED' && (
            <span className="badge badge-shortfall">Discrepancy Found</span>
          )}
          {overallStatus === 'FULLY_RECONCILED' && (
            <span className="badge badge-fulfilled">Fully Reconciled</span>
          )}
        </div>
      </div>

      <div className="banner-neutral" style={{ marginBottom: '1.25rem' }}>
        <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Deterministic Arithmetic Guarantee:</strong> {disclaimer || 'Calculations are pure arithmetic. AI is never used for numbers.'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {lineAudits.map((item, idx) => (
          <div
            key={item.commodity + idx}
            style={{
              border: item.status === 'SHORTFALL' ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
              borderRadius: '0.625rem',
              background: item.status === 'SHORTFALL' ? '#fffaf9' : '#ffffff',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.commodity}
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>
                    ({item.rule_expression.split('=')[0].trim()})
                  </span>
                </h3>
              </div>
              <div>{getStatusBadge(item.status)}</div>
            </div>

            {/* 3 Metric Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                  Calculated Entitlement
                </span>
                <strong className="mono" style={{ fontSize: '1.2rem', color: '#1e3a8a' }}>
                  {item.entitled_quantity.toFixed(2)} {item.unit}
                </strong>
              </div>

              <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                  Total Recorded Collections
                </span>
                <strong className="mono" style={{ fontSize: '1.2rem', color: '#0f172a' }}>
                  {item.total_received.toFixed(2)} {item.unit}
                </strong>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
                  across {item.deliveries_count} visit(s)
                </span>
              </div>

              <div style={{
                background: item.difference > 0 ? '#fee2e2' : item.difference < 0 ? '#dbeafe' : '#d1fae5',
                padding: '0.75rem',
                borderRadius: '0.5rem'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', color: item.difference > 0 ? '#991b1b' : item.difference < 0 ? '#1e40af' : '#065f46' }}>
                  Net Variance (Balance)
                </span>
                <strong className="mono" style={{ fontSize: '1.2rem', color: item.difference > 0 ? '#b91c1c' : item.difference < 0 ? '#1d4ed8' : '#047857' }}>
                  {Math.abs(item.difference).toFixed(2)} {item.unit}
                </strong>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, display: 'block', color: item.difference > 0 ? '#991b1b' : item.difference < 0 ? '#1e40af' : '#065f46' }}>
                  {item.difference > 0 ? 'Shortfall / Uncollected' : item.difference < 0 ? 'Surplus Allocation' : 'Exact Balance (0.00)'}
                </span>
              </div>
            </div>

            {/* Step by step arithmetic proof */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.85rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                Line-by-Line Arithmetic Audit Trail:
              </span>
              <pre className="mono" style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap', color: '#1e293b', lineHeight: 1.6, margin: 0 }}>
                {item.arithmetic_proof}
              </pre>
            </div>

            {/* Neutral Finding */}
            <div style={{ fontSize: '0.825rem', color: '#334155', background: '#ffffff', padding: '0.75rem', borderRadius: '0.375rem', border: '1px dashed #cbd5e1' }}>
              <strong>Neutral Redressal Note:</strong> {item.neutral_observation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
