import React from 'react';

type StatusType = 'online' | 'offline' | 'active' | 'suspended' | 'pending' | 'completed' | 'failed';

const statusConfig: Record<StatusType, { color: string; label: string }> = {
  online: { color: '#3FB950', label: 'Online' },
  offline: { color: '#6E7681', label: 'Offline' },
  active: { color: '#3FB950', label: 'Active' },
  suspended: { color: '#F85149', label: 'Suspended' },
  pending: { color: '#D29922', label: 'Pending' },
  completed: { color: '#3FB950', label: 'Completed' },
  failed: { color: '#F85149', label: 'Failed' },
};

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showDot?: boolean;
  style?: React.CSSProperties;
}

export function StatusIndicator({ status, label, showDot = true, style }: StatusIndicatorProps) {
  const config = statusConfig[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: 500,
        color: config.color,
        ...style,
      }}
    >
      {showDot && (
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: config.color,
          }}
        />
      )}
      {label || config.label}
    </span>
  );
}
