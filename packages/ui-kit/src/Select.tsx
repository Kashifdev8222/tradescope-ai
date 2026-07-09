import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export function Select({ label, error, options, style, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{ fontSize: '13px', fontWeight: 500, color: '#8B949E' }}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: '#0D1117',
          border: `1px solid ${error ? '#F85149' : '#30363D'}`,
          borderRadius: '8px',
          color: '#E6EDF3',
          fontSize: '14px',
          fontFamily: 'inherit',
          outline: 'none',
          cursor: 'pointer',
          appearance: 'auto',
          ...style,
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: '12px', color: '#F85149' }}>{error}</span>
      )}
    </div>
  );
}
