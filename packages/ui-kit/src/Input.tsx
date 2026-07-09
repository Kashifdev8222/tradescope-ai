import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, style, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: '13px', fontWeight: 500, color: '#8B949E' }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span style={{ position: 'absolute', left: '12px', color: '#6E7681', display: 'flex' }}>
            {icon}
          </span>
        )}
        <input
          id={inputId}
          style={{
            width: '100%',
            padding: icon ? '10px 12px 10px 36px' : '10px 12px',
            background: '#0D1117',
            border: `1px solid ${error ? '#F85149' : '#30363D'}`,
            borderRadius: '8px',
            color: '#E6EDF3',
            fontSize: '14px',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.15s ease',
            ...style,
          }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = '#58A6FF';
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = '#30363D';
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: '#F85149' }}>{error}</span>
      )}
    </div>
  );
}
