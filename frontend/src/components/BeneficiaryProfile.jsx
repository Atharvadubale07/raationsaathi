import React from 'react';
import { User, Users, Store, Calendar, CreditCard } from 'lucide-react';

export default function BeneficiaryProfile({ beneficiary, onChange }) {
  const updateField = (field, value) => {
    onChange({
      ...beneficiary,
      [field]: field === 'family_member_count' ? Math.max(1, parseInt(value) || 1) : value
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <User size={18} color="#1e3a8a" /> Beneficiary & Household Details
        </h2>
        <span className="badge badge-surplus">
          Category: {beneficiary.category}
        </span>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            <CreditCard size={13} style={{ display: 'inline', marginRight: 4 }} />
            Ration Card Number
          </label>
          <input
            type="text"
            className="form-input mono"
            value={beneficiary.card_number}
            onChange={(e) => updateField('card_number', e.target.value)}
            placeholder="e.g. NFSA-07-2849102"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <User size={13} style={{ display: 'inline', marginRight: 4 }} />
            Head of Family (Beneficiary Name)
          </label>
          <input
            type="text"
            className="form-input"
            value={beneficiary.head_of_family}
            onChange={(e) => updateField('head_of_family', e.target.value)}
            placeholder="e.g. Sunita Devi"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Users size={13} style={{ display: 'inline', marginRight: 4 }} />
            Family Member Count
          </label>
          <input
            type="number"
            min="1"
            max="25"
            className="form-input"
            value={beneficiary.family_member_count}
            onChange={(e) => updateField('family_member_count', e.target.value)}
          />
          <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
            Multiplier used for 'Per Member' entitlement calculations
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Card Scheme / Category</label>
          <select
            className="form-select"
            value={beneficiary.category}
            onChange={(e) => updateField('category', e.target.value)}
          >
            <option value="PHH (Priority Household)">PHH (Priority Household)</option>
            <option value="AAY (Antyodaya Anna Yojana)">AAY (Antyodaya Anna Yojana)</option>
            <option value="BPL (Below Poverty Line)">BPL (Below Poverty Line)</option>
            <option value="General / APL">General / APL</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Store size={13} style={{ display: 'inline', marginRight: 4 }} />
            Fair Price Shop (FPS) Code & Name
          </label>
          <input
            type="text"
            className="form-input"
            value={beneficiary.fps_id}
            onChange={(e) => updateField('fps_id', e.target.value)}
            placeholder="e.g. FPS-DL-1104 (Sharma Store)"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
            Entitlement Period
          </label>
          <input
            type="text"
            className="form-input"
            value={beneficiary.period}
            onChange={(e) => updateField('period', e.target.value)}
            placeholder="e.g. October 2026"
          />
        </div>
      </div>
    </div>
  );
}
