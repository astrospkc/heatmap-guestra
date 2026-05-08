import React from 'react';
import type { Booking, Role } from '../../types';
import {
  getHeatmapColor,
  bookingOccupiesNight,
  formatDate,
  toDay,
} from '../../utils/dateUtils';

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  bookings: Booking[];
  occupancyCount: number;
  isSelected: boolean;
  isDragStart: boolean;
  isToday: boolean;
  role: Role;
  onMouseDown: (date: Date) => void;
  onMouseEnter: (date: Date) => void;
  onMouseUp: () => void;
  onHover: (date: Date | null, rect: DOMRect | null) => void;
}

export const DayCell: React.FC<DayCellProps> = ({
  date,
  isCurrentMonth,
  bookings,
  occupancyCount,
  isSelected,
  isDragStart,
  isToday,
  role,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onHover,
}) => {
  const isGuest = role === 'guest';
  const heatBg = getHeatmapColor(occupancyCount);
  const dayNum = date.getDate();

  // Bookings active on this specific night (for dot indicators)
  const activeBookings = bookings.filter((b) => bookingOccupiesNight(b, date));
  const dotCount = Math.min(activeBookings.length, 5);
  const roomsLeft = 10 - occupancyCount;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseEnter(date);
    onHover(date, e.currentTarget.getBoundingClientRect());
  };

  return (
    <div
      className={`day-cell${isCurrentMonth ? '' : ' dim'}${isSelected ? ' selected' : ''}${isDragStart ? ' drag-start' : ''}${isToday ? ' today' : ''}`}
      style={{ background: isSelected ? undefined : heatBg }}
      data-date={formatDate(date)}
      onMouseDown={() => onMouseDown(date)}
      onMouseEnter={handleMouseEnter}
      onMouseUp={onMouseUp}
      onMouseLeave={() => onHover(null, null)}
    >
      <span className="day-num">{dayNum}</span>

      {/* Occupancy bar */}
      {isCurrentMonth && occupancyCount > 0 && (
        <div className="occ-bar-wrap">
          <div
            className="occ-bar"
            style={{ width: `${(occupancyCount / 10) * 100}%` }}
          />
        </div>
      )}

      {/* Booking dots — admin only */}
      {isCurrentMonth && dotCount > 0 && !isGuest && (
        <div className="dots">
          {Array.from({ length: dotCount }).map((_, i) => (
            <span key={i} className={`dot dot-${activeBookings[i]?.status ?? 'confirmed'}`} />
          ))}
        </div>
      )}

      {/* Badge: admin shows X/10, guest shows X left */}
      {isCurrentMonth && occupancyCount > 0 && (
        <span className={`occ-badge${isGuest ? ' occ-badge--guest' : ''}`}>
          {isGuest ? `${roomsLeft} left` : `${occupancyCount}/10`}
        </span>
      )}
    </div>
  );
};

// ─── Today marker util ─────────────────────────────────────────────────────
export function isDateToday(date: Date): boolean {
  return formatDate(toDay(date)) === formatDate(toDay(new Date()));
}
