import React from 'react';
import { Card } from './Card';

interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: { value: string; isPositive: boolean };
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export function StatsCard({ label, value, subValue, trend, icon, style }: StatsCardProps) {
  return (
    <Card style={{ minWidth: '200px', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '13px', color: '#8B949E', fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#E6EDF3' }}>{value}</span>
          {subValue && (
            <span style={{ fontSize: '13px', color: '#6E7681' }}>{subValue}</span>
          )}
          {trend && (
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: trend.isPositive ? '#3FB950' : '#F85149',
              }}
            >
              {trend.isPositive ? '▲' : '▼'} {trend.value}
            </span>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(88, 166, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#58A6FF',
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
