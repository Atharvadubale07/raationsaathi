import React from 'react';
import { Scale, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export default function Header({ presets, activePresetId, onSelectPreset, onReset }) {
  return (
    <header className="no-print">
      <div className="gov-topbar">
        <div className="gov-topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'white', color: '#1e3a8a', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex' }}>
              <Scale size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                RationSaathi <span style={{ fontWeight: 400, opacity: 0.9 }}>| राशन साथी</span>
              </h1>
              <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                Public Distribution Entitlement & Dispute Assistant • Domain 6 (P-01)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="gov-badge">
              <ShieldCheck size={14} /> Deterministic Arithmetic Certified
            </span>
          </div>
        </div>
      </div>

      {/* Preset demo scenarios for hackathon evaluation */}
      <div className="presets-bar">
        <div className="presets-inner">
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} color="#d97706" /> Demo Scenarios:
          </span>

          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`preset-chip ${activePresetId === preset.id ? 'active' : ''}`}
              title={preset.description}
            >
              <span>{preset.title.split('—')[0].trim()}</span>
              {activePresetId === preset.id && <span style={{ fontSize: '0.7rem' }}>✓</span>}
            </button>
          ))}

          <button
            onClick={onReset}
            className="preset-chip"
            style={{ marginLeft: 'auto', color: '#64748b' }}
            title="Clear all fields for manual user test"
          >
            <RefreshCw size={13} /> Reset / Custom Input
          </button>
        </div>
      </div>
    </header>
  );
}
