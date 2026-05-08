import React, { useState, useCallback, useMemo } from 'react';
import { useBookings } from './hooks/useBookings';
import { CalendarGrid } from './components/Calendar/CalendarGrid';
import { BookingPanel } from './components/Sidebar/BookingPanel';
import { StatsStrip } from './components/Sidebar/StatsStrip';
import { FilterBar } from './components/FilterBar';
import { Tooltip } from './components/Tooltip';
import type { SelectionRange, Filters } from './types';
import { getMonthStats } from './utils/dateUtils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface TooltipState {
  date: Date;
  occupancy: number;
  rect: DOMRect;
}

function App() {
  const { bookings, loading, error } = useBookings();

  const now = new Date();
  const [year, setYear]         = useState(now.getFullYear());
  const [month, setMonth]       = useState(now.getMonth());
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [tooltip, setTooltip]   = useState<TooltipState | null>(null);
  const [filters, setFilters]   = useState<Filters>({
    roomType: 'All',
    status: 'All',
    source: 'All',
  });

  // Apply filters to bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filters.roomType !== 'All' && b.roomType !== filters.roomType) return false;
      if (filters.status   !== 'All' && b.status   !== filters.status)   return false;
      if (filters.source   !== 'All' && b.source   !== filters.source)   return false;
      return true;
    });
  }, [bookings, filters]);

  const stats = useMemo(
    () => getMonthStats(filteredBookings, year, month),
    [filteredBookings, year, month]
  );

  const handleMonthChange = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setSelection(null);
  }, []);

  const handleSelectionChange = useCallback((range: SelectionRange | null) => {
    setSelection(range);
  }, []);

  const handleHoverTooltip = useCallback((data: TooltipState | null) => {
    setTooltip(data);
  }, []);


  // ── Loading / Error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading bookings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <div className="error-icon">⚠️</div>
        <h2>Failed to load bookings</h2>
        <p>{error}</p>
        <p className="error-hint">Make sure <code>bookings.json</code> is in the <code>/public</code> folder.</p>
      </div>
    );
  }


  return (
    <div className="app">
      {/* ── Top nav bar ─────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">🏨</span>
          <span className="logo-text">Guestra</span>
          <span className="logo-sub">Occupancy Dashboard</span>
        </div>

        <div className="header-right">
          <span className="header-badge">{bookings.length} bookings</span>
        </div>
      </header>

      {/* ── Stats strip ──────────────────────────────────────────────────────── */}
      <StatsStrip stats={stats} monthName={MONTH_NAMES[month]} />

      {/* ── Filter bar ───────────────────────────────────────────────────────── */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="app-main">
        {/* Calendar */}
        <section className="calendar-section">
          <CalendarGrid
            bookings={filteredBookings}
            year={year}
            month={month}
            onMonthChange={handleMonthChange}
            onSelectionChange={handleSelectionChange}
            onHoverTooltip={handleHoverTooltip}
          />
        </section>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-title">
            {selection ? 'Selection Details' : 'Availability'}
          </div>
          <BookingPanel bookings={filteredBookings} selection={selection} />
        </aside>
      </main>

      {/* ── Hover tooltip (portal-like, fixed position) ─────────────────── */}
      {tooltip && (
        <Tooltip
          date={tooltip.date}
          occupancy={tooltip.occupancy}
          rect={tooltip.rect}
          bookings={filteredBookings}
        />
      )}
    </div>
  );
}

export default App;
