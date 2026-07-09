import React from 'react';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, style, hoverable = false, onClick, className }: CardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: '#161B22',
        border: '1px solid #30363D',
        borderRadius: '12px',
        padding: '20px',
        cursor: hoverable || onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.borderColor = '#58A6FF';
          e.currentTarget.style.boxShadow = '0 0 12px rgba(88, 166, 255, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.borderColor = '#30363D';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </div>
  );
}
