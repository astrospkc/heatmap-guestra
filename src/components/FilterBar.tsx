import React from 'react';
import type { Filters } from '../types';

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const ROOM_TYPES = ['All', 'Standard', 'Deluxe', 'Suite', 'Penthouse'];
const STATUSES = ['All', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
const SOURCES = ['All', 'Direct', 'Airbnb', 'Booking.com', 'Expedia', 'Agoda', 'Walk-in'];

const STATUS_DISPLAY: Record<string, string> = {
  All: 'All Statuses',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
};

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActive =
    filters.roomType !== 'All' || filters.status !== 'All' || filters.source !== 'All';

  return (
    <div className="filter-bar">
      <div className="filter-label">Filters</div>

      <select
        className="filter-select"
        value={filters.roomType}
        onChange={(e) => update('roomType', e.target.value)}
      >
        {ROOM_TYPES.map((t) => (
          <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filters.status}
        onChange={(e) => update('status', e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_DISPLAY[s]}</option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filters.source}
        onChange={(e) => update('source', e.target.value)}
      >
        {SOURCES.map((s) => (
          <option key={s} value={s}>{s === 'All' ? 'All Sources' : s}</option>
        ))}
      </select>

      {hasActive && (
        <button
          className="filter-clear"
          onClick={() => onChange({ roomType: 'All', status: 'All', source: 'All' })}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
};
