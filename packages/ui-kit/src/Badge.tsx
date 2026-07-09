import React from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'live';

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot?: string }> = {
  success: { bg: '#1B3A2D', text: '#3FB950' },
  danger: { bg: '#3D1F1F', text: '#F85149' },
  warning: { bg: '#3D3420', text: '#D29922' },
  info: { bg: '#1B2D3D', text: '#79C0FF' },
  neutral: { bg: '#21262D', text: '#8B949E' },
  live: { bg: '#1B3A2D', text: '#3FB950', dot: '#3FB950' },
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Badge({ variant = 'neutral', children, style }: BadgeProps) {
  const s = variantStyles[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.text}20`,
        ...style,
      }}
    >
      {s.dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: s.dot,
            animation: 'pulse 2s infinite',
          }}
        />
      )}
      {children}
    </span>
  );
}
