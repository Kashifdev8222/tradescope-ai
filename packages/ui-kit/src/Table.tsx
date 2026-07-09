import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  style?: React.CSSProperties;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data found',
  isLoading = false,
  style,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#8B949E', ...style }}>
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6E7681', ...style }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #30363D' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '12px 16px',
                  textAlign: col.align || 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#8B949E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  width: col.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              style={{
                borderBottom: '1px solid #21262D',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#161B22'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '14px 16px',
                    textAlign: col.align || 'left',
                    fontSize: '14px',
                    color: '#E6EDF3',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
