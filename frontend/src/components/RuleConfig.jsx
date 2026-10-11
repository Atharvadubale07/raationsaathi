import React, { useState } from 'react';
import { Sliders, Plus, Trash2, Info, CheckCircle2 } from 'lucide-react';

export default function RuleConfig({ rules, memberCount, onRulesChange }) {
  const [newCommodity, setNewCommodity] = useState('Rice');
  const [newRuleType, setNewRuleType] = useState('per_member');
  const [newQty, setNewQty] = useState(5.0);
  const [newUnit, setNewUnit] = useState('kg');

  const addRule = () => {
    if (!newCommodity.trim() || newQty <= 0) return;
    const ruleObj = {
      id: `rule_${Date.now()}`,
      commodity: newCommodity.trim(),
      rule_type: newRuleType,
      quantity: parseFloat(newQty),
      unit: newUnit,
      period_label: 'Monthly',
      subsidy_rate: 0.0
    };
    onRulesChange([...rules, ruleObj]);
    setNewQty(5.0);
  };

  const removeRule = (id) => {
    onRulesChange(rules.filter((r) => r.id !== id));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Sliders size={18} color="#1e3a8a" /> Step 1: Explicit Entitlement Rules Configuration
        </h2>
        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
          {rules.length} Rule(s) Configured
        </span>
      </div>

      <div className="banner-info">
        <Info size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Explicit Rule Governance:</strong> As mandated by civic verification protocols,
          the system applies <em>only</em> the rules explicitly specified in this table.
          No unstated or assumed quotas are applied.
        </div>
      </div>

      {/* Rules list table */}
      <div className="table-wrapper" style={{ marginBottom: '1.25rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Commodity</th>
              <th>Rule Formulation</th>
              <th>Base Rate</th>
              <th>Unit</th>
              <th>Household Entitlement ({memberCount} Members)</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => {
              const total = rule.rule_type === 'per_member'
                ? (rule.quantity * memberCount).toFixed(2)
                : rule.quantity.toFixed(2);
              const expr = rule.rule_type === 'per_member'
                ? `${rule.quantity} ${rule.unit} × ${memberCount} members`
                : `Flat Household Quota`;

              return (
                <tr key={rule.id}>
                  <td>
                    <strong>{rule.commodity}</strong>
                  </td>
                  <td>
                    <span className="badge badge-surplus" style={{ textTransform: 'capitalize' }}>
                      {rule.rule_type === 'per_member' ? 'Per Member Quota' : 'Flat Household Quota'}
                    </span>
                  </td>
                  <td>
                    <span className="mono font-semibold">{rule.quantity}</span> {rule.unit}
                  </td>
                  <td>{rule.unit}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1rem', color: '#1e3a8a' }}>
                        {total} {rule.unit}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({expr})</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                      title="Delete Rule"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rules.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No explicit rules defined. Add a rule below to calculate entitlements.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Rule Form */}
      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
          + Add New Explicit Entitlement Rule
        </h4>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Commodity / Item</label>
            <input
              type="text"
              className="form-input"
              value={newCommodity}
              onChange={(e) => setNewCommodity(e.target.value)}
              placeholder="e.g. Rice, Wheat, Sugar"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rule Type</label>
            <select
              className="form-select"
              value={newRuleType}
              onChange={(e) => setNewRuleType(e.target.value)}
            >
              <option value="per_member">Per Member per period</option>
              <option value="flat_household">Flat Household per period</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              step="0.5"
              min="0.1"
              className="form-input"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit</label>
            <select
              className="form-select"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
            >
              <option value="kg">kg (Kilograms)</option>
              <option value="liter">liter (Litres)</option>
              <option value="packet">packet (Packets)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={addRule}
              className="btn btn-primary"
              style={{ width: '100%', height: '39px' }}
            >
              <Plus size={16} /> Add Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
