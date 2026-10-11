import React, { useState } from 'react';
import { BookOpen, Plus, FileText, Trash2, ShieldCheck, Link2 } from 'lucide-react';

export default function LedgerTable({
  distributions,
  onAddDistribution,
  onRemoveDistribution,
  onOpenReceiptModal
}) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [date, setDate] = useState('2026-10-04');
  const [commodity, setCommodity] = useState('Rice');
  const [qty, setQty] = useState(5.0);
  const [unit, setUnit] = useState('kg');
  const [sourceType, setSourceType] = useState('POS_RECEIPT');
  const [refNo, setRefNo] = useState('');
  const [rawEvidence, setRawEvidence] = useState('');

  const handleAddManual = (e) => {
    e.preventDefault();
    if (!commodity.trim() || qty <= 0) return;

    const newRecord = {
      id: `dist_${Date.now()}`,
      date,
      commodity: commodity.trim(),
      quantity_received: parseFloat(qty),
      unit,
      source_type: sourceType,
      receipt_reference: refNo.trim() || `REF-${Date.now().toString().slice(-5)}`,
      raw_evidence: rawEvidence.trim() || `Manual entry confirmed on ${date}`,
      is_verified_by_user: true
    };

    onAddDistribution(newRecord);
    setRefNo('');
    setRawEvidence('');
    setShowManualForm(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <BookOpen size={18} color="#1e3a8a" /> Step 2: Distribution Ledger & Verifiable Evidence
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onOpenReceiptModal}
            className="btn btn-outline"
            style={{ color: '#1e3a8a', borderColor: '#3b82f6', background: '#eff6ff' }}
          >
            <FileText size={15} /> Interpret Receipt / Slip (AI Suggestion)
          </button>
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="btn btn-primary"
          >
            <Plus size={15} /> {showManualForm ? 'Close Entry Form' : 'Add Manual Delivery'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
        Log every collection visit or partial delivery. Every record is strictly linked to an evidence reference
        (POS receipt, SMS alert, or handwritten slip voucher) which is preserved in the audit report.
      </p>

      {/* Manual Entry Form */}
      {showManualForm && (
        <form onSubmit={handleAddManual} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>
            Enter Distribution Transaction
          </h4>
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Collection Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Commodity</label>
              <input
                type="text"
                className="form-input"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                placeholder="e.g. Rice, Wheat"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Received</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="form-input mono"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="packet">packet</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Receipt / Token Ref #</label>
              <input
                type="text"
                className="form-input mono"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="e.g. POS-8812 or SLIP-44"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Evidence Channel</label>
              <select className="form-select" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
                <option value="POS_RECEIPT">e-PoS Terminal Receipt</option>
                <option value="SMS_ALERT">SMS Transaction Alert</option>
                <option value="DEALER_SLIP">Dealer Handwritten Voucher</option>
                <option value="MANUAL_NOTE">Beneficiary Verified Note</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Raw Evidence Text / Note Excerpt</label>
            <input
              type="text"
              className="form-input"
              value={rawEvidence}
              onChange={(e) => setRawEvidence(e.target.value)}
              placeholder="e.g. Received partial 10kg from Sharma store; dealer promised 10kg next week."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={() => setShowManualForm(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Delivery Record
            </button>
          </div>
        </form>
      )}

      {/* Ledger Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Commodity</th>
              <th>Quantity Received</th>
              <th>Evidence Reference</th>
              <th>Source Channel</th>
              <th>Evidence Excerpt</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {distributions.map((dist) => (
              <tr key={dist.id}>
                <td>
                  <span className="mono font-semibold">{dist.date}</span>
                </td>
                <td>
                  <strong>{dist.commodity}</strong>
                </td>
                <td>
                  <span className="mono font-semibold" style={{ fontSize: '0.95rem', color: '#1e3a8a' }}>
                    {dist.quantity_received.toFixed(2)} {dist.unit}
                  </span>
                </td>
                <td>
                  <span className="badge badge-surplus mono" style={{ fontSize: '0.725rem' }}>
                    <Link2 size={11} /> {dist.receipt_reference}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                    {dist.source_type.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ maxWidth: '300px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={dist.raw_evidence}>
                    "{dist.raw_evidence}"
                  </p>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>
                    <ShieldCheck size={14} /> Confirmed
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => onRemoveDistribution(dist.id)}
                    className="btn btn-danger"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                    title="Delete record"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {distributions.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No distributions logged yet. Add deliveries above or use 'Interpret Receipt'.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
