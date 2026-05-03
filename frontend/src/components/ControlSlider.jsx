import React, { useState, useRef, useEffect } from 'react';

const ControlSlider = ({ label, value, min, max, step = 1, unit, onChange, accent = "blue" }) => {
  const isNeon = accent === "neon";
  const accentColor = isNeon ? '#00f0ff' : '#0ea5e9';
  const range = max - min || 1;
  const pct = ((value - min) / range) * 100;

  // Editable value state
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  const decimals = step < 1 ? Math.max(0, Math.ceil(-Math.log10(step))) : 0;
  const displayValue = typeof value === 'number' ? value.toFixed(decimals) : value;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleValueClick = () => {
    setEditValue(String(displayValue));
    setIsEditing(true);
  };

  const commitEdit = () => {
    setIsEditing(false);
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 10,
      }}>
        <label className="font-mono" style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#64748b',
          textTransform: 'uppercase',
          lineHeight: 'normal',
          paddingTop: 4,
        }}>{label}</label>

        {/* Clickable value / inline edit */}
        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="font-mono"
              style={{
                width: Math.max(48, String(editValue).length * 14 + 12),
                fontWeight: 700,
                fontSize: 22,
                color: accentColor,
                textShadow: `0 0 12px ${accentColor}44`,
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${accentColor}66`,
                borderRadius: 8,
                padding: '2px 8px',
                outline: 'none',
                textAlign: 'right',
                lineHeight: 'normal',
                caretColor: accentColor,
              }}
            />
            <span style={{
              fontSize: 11,
              color: '#475569',
              fontWeight: 400,
              lineHeight: 'normal',
            }}>{unit}</span>
          </div>
        ) : (
          <div
            className="font-mono"
            onClick={handleValueClick}
            title="Click to type a value"
            style={{
              fontWeight: 700,
              fontSize: 22,
              color: accentColor,
              textShadow: `0 0 12px ${accentColor}44`,
              lineHeight: 'normal',
              paddingTop: 4,
              transition: 'color 0.3s',
              cursor: 'text',
              borderBottom: `1px dashed ${accentColor}33`,
              paddingBottom: 1,
            }}>
            {displayValue}
            <span style={{
              fontSize: 11,
              color: '#475569',
              marginLeft: 4,
              fontWeight: 400,
              lineHeight: 'normal',
            }}>{unit}</span>
          </div>
        )}
      </div>

      {/* Custom slider with glowing gradient fill */}
      <div style={{ position: 'relative', paddingTop: 2, paddingBottom: 2 }}>
        {/* Track background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 6,
          marginTop: -3,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          {/* Filled portion with gradient */}
          <div style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${accentColor}55, ${accentColor})`,
            boxShadow: `0 0 10px ${accentColor}44`,
            transition: 'width 0.05s linear',
          }} />
        </div>

        {/* Native range input (transparent, sits on top) */}
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step}
          value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: '100%',
            height: 22,
            position: 'relative',
            zIndex: 2,
            background: 'transparent',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Range labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 4,
      }}>
        <span className="font-mono" style={{ fontSize: 12, color: '#64748b' }}>{min}</span>
        <span className="font-mono" style={{ fontSize: 12, color: '#64748b' }}>{max}</span>
      </div>
    </div>
  );
};

export default ControlSlider;
