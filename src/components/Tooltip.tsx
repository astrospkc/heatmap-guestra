import React from 'react';
import { formatDisplay, getHeatmapLabel } from '../utils/dateUtils';
import type { Booking, Role } from '../types';
import { bookingOccupiesNight } from '../utils/dateUtils';

interface TooltipProps {
  date: Date;
  occupancy: number;
  rect: DOMRect;
  bookings: Booking[];
  role: Role;
}

export const Tooltip: React.FC<TooltipProps> = ({ date, occupancy, rect, bookings, role }) => {
  const isGuest = role === 'guest';
  const activeBookings = bookings.filter((b) => bookingOccupiesNight(b, date));
  const roomsLeft = 10 - occupancy;

  // Position tooltip below the cell
  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.bottom + 8,
    left: rect.left + rect.width / 2,
    transform: 'translateX(-50%)',
    zIndex: 1000,
    pointerEvents: 'none',
  };

  return (
    <div className="tooltip" style={style}>
      <div className="tooltip-date">{formatDisplay(date)}</div>
      <div className="tooltip-occ">
        {isGuest
          ? <>{roomsLeft}/10 rooms free · <span className="tooltip-level">{roomsLeft === 0 ? 'Fully Booked' : getHeatmapLabel(10 - occupancy)}</span></>
          : <>{occupancy}/10 rooms · <span className="tooltip-level">{getHeatmapLabel(occupancy)}</span></>}
      </div>
      {/* Admin-only: guest name rows */}
      {!isGuest && activeBookings.length > 0 && (
        <div className="tooltip-guests">
          {activeBookings.slice(0, 3).map((b) => (
            <div key={b.id} className="tooltip-guest-row">
              <span className="tooltip-room">Room {b.roomNumber}</span>
              <span className="tooltip-name">{b.guestName}</span>
            </div>
          ))}
          {activeBookings.length > 3 && (
            <div className="tooltip-more">+{activeBookings.length - 3} more</div>
          )}
        </div>
      )}
    </div>
  );
};
