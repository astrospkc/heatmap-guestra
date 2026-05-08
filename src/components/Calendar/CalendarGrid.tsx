import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Booking, SelectionRange } from '../../types';
import { getCalendarDays, getOccupancyCount, formatDate, toDay } from '../../utils/dateUtils';
import { DayCell, isDateToday } from './DayCell';
import { CalendarHeader } from './CalendarHeader';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface TooltipData {
  date: Date;
  occupancy: number;
  rect: DOMRect;
}

interface CalendarGridProps {
  bookings: Booking[];
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  onSelectionChange: (range: SelectionRange | null) => void;
  onHoverTooltip: (data: TooltipData | null) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  bookings,
  year,
  month,
  onMonthChange,
  onSelectionChange,
  onHoverTooltip,
}) => {
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const mouseDownRef = useRef(false);

  const days = getCalendarDays(year, month);

  // month - when its the first month of the year i.e. 0, then it should go to the previous year and 11th month
  const goToPrev = () => {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  };

  // month - when its the last month of the year i.e. 11, then it should go to the next year and 0 month
  const goToNext = () => {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  };

  const goToToday = () => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth());
  };

  // ─── Drag selection ─────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((date: Date) => {
    mouseDownRef.current = true;
    setDragStart(date);
    setDragEnd(date);
    setIsDragging(true);
    setSelection(null);
    onSelectionChange(null);
  }, [onSelectionChange]);

  const handleMouseEnter = useCallback((date: Date) => {
    if (mouseDownRef.current && isDragging) {
      setDragEnd(date);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!mouseDownRef.current) return;
    mouseDownRef.current = false;
    setIsDragging(false);

    if (dragStart && dragEnd) {
      const start = toDay(dragStart).getTime() <= toDay(dragEnd).getTime() ? dragStart : dragEnd;
      const end = toDay(dragStart).getTime() <= toDay(dragEnd).getTime() ? dragEnd : dragStart;
      const range = { start: toDay(start), end: toDay(end) };
      setSelection(range);
      onSelectionChange(range);
    }

    setDragStart(null);
    setDragEnd(null);
  }, [dragStart, dragEnd, onSelectionChange]);

  // Global mouseup to handle releasing outside calendar
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (mouseDownRef.current) handleMouseUp();
    };
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleMouseUp]);

  // ─── Selection range helpers ───────────────────────────────────────────────
  const isInSelection = (date: Date): boolean => {
    if (!dragStart || !dragEnd) {
      // Use finalized selection
      if (!selection) return false;
      const t = toDay(date).getTime();
      return t >= selection.start.getTime() && t <= selection.end.getTime();
    }
    // During drag: normalize direction
    const t = toDay(date).getTime();
    const s = toDay(dragStart).getTime();
    const e = toDay(dragEnd).getTime();
    const [lo, hi] = s <= e ? [s, e] : [e, s];
    return t >= lo && t <= hi;
  };

  const isDragStartDate = (date: Date): boolean => {
    if (!dragStart) return false;
    return formatDate(toDay(date)) === formatDate(toDay(dragStart));
  };

  // ─── Tooltip ───────────────────────────────────────────────────────────────
  const handleHover = useCallback((date: Date | null, rect: DOMRect | null) => {
    if (!date || !rect) {
      onHoverTooltip(null);
      return;
    }
    const occupancy = getOccupancyCount(bookings, date);
    onHoverTooltip({ date, occupancy, rect });
  }, [bookings, onHoverTooltip]);

  return (
    <div className="calendar-wrap">
      <CalendarHeader
        year={year}
        month={month}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
      />

      {/* Day-of-week labels */}
      <div className="dow-row">
        {DAY_LABELS.map((d) => (
          <div key={d} className="dow-label">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="day-grid" onMouseLeave={() => handleHover(null, null)}>
        {days.map(({ date, isCurrentMonth }) => {
          const occupancy = getOccupancyCount(bookings, date);
          return (
            <DayCell
              key={formatDate(date)}
              date={date}
              isCurrentMonth={isCurrentMonth}
              bookings={bookings}
              occupancyCount={occupancy}
              isSelected={isInSelection(date)}
              isDragStart={isDragStartDate(date)}
              isToday={isDateToday(date)}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseUp={handleMouseUp}
              onHover={handleHover}
            />
          );
        })}
      </div>

      {/* Heatmap legend */}
      <div className="heatmap-legend">
        <span className="legend-label">Occupancy:</span>
        {[
          { label: '0', color: 'rgba(255,255,255,0.04)' },
          { label: '1–2', color: 'rgba(139, 92, 246, 0.25)' },
          { label: '3–4', color: 'rgba(124, 58, 237, 0.45)' },
          { label: '5–6', color: 'rgba(251, 146, 60, 0.50)' },
          { label: '7–8', color: 'rgba(249, 115, 22, 0.65)' },
          { label: '9–10', color: 'rgba(239, 68, 68, 0.75)' },
        ].map(({ label, color }) => (
          <div key={label} className="legend-item">
            <span className="legend-swatch" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
