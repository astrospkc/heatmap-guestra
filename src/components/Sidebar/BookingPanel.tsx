import React from 'react';
import type { Booking, SelectionRange } from '../../types';
import {
  getOverlappingBookings,
  getAvailableRooms,
  formatDisplay,
  nightsBetween,
} from '../../utils/dateUtils';

interface BookingPanelProps {
  bookings: Booking[];
  selection: SelectionRange | null;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
};

const STATUS_CLASS: Record<string, string> = {
  confirmed: 'status-confirmed',
  checked_in: 'status-checkedin',
  checked_out: 'status-checkedout',
  cancelled: 'status-cancelled',
};

const ROOM_TYPE_ICON: Record<string, string> = {
  Standard: '🛏',
  Deluxe: '🛎',
  Suite: '✨',
  Penthouse: '🏙',
};

export const BookingPanel: React.FC<BookingPanelProps> = ({ bookings, selection }) => {
  if (!selection) {
    return (
      <div className="panel-empty">
        <div className="panel-empty-icon">📅</div>
        <p>Click a day or drag to select a date range</p>
        <p className="panel-empty-sub">See available rooms and bookings</p>
      </div>
    );
  }

  const overlapping = getOverlappingBookings(bookings, selection.start, selection.end);
  const availableRooms = getAvailableRooms(bookings, selection.start, selection.end);
  const isSingleDay =
    selection.start.getTime() === selection.end.getTime();

  const dateLabel = isSingleDay
    ? formatDisplay(selection.start)
    : `${formatDisplay(selection.start)} – ${formatDisplay(selection.end)}`;

  return (
    <div className="booking-panel">
      {/* Range header */}
      <div className="panel-header">
        <div className="panel-date-range">{dateLabel}</div>
        <div className="panel-meta">
          {overlapping.filter((b) => b.status !== 'cancelled').length} booking(s)
        </div>
      </div>

      {/* Available rooms */}
      <div className="available-section">
        <div className="available-title">
          <span className="avail-dot" /> Available Rooms ({availableRooms.length}/10)
        </div>
        {availableRooms.length === 0 ? (
          <p className="no-avail">No rooms available for this period</p>
        ) : (
          <div className="room-chips">
            {availableRooms.map((r) => (
              <span key={r} className="room-chip">Room {r}</span>
            ))}
          </div>
        )}
      </div>

      {/* Booking list */}
      <div className="bookings-list-title">Bookings in Range</div>
      {overlapping.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings overlap this range</p>
        </div>
      ) : (
        <div className="bookings-list">
          {overlapping.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
};

const BookingCard: React.FC<{ booking: Booking }> = ({ booking: b }) => {
  const nights = nightsBetween(b.checkIn, b.checkOut);

  return (
    <div className={`booking-card ${b.status === 'cancelled' ? 'booking-cancelled' : ''}`}>
      <div className="booking-card-top">
        <div className="booking-guest">{b.guestName}</div>
        <span className={`booking-status ${STATUS_CLASS[b.status]}`}>
          {STATUS_LABELS[b.status]}
        </span>
      </div>
      <div className="booking-card-body">
        <div className="booking-room">
          <span className="room-icon">{ROOM_TYPE_ICON[b.roomType] ?? '🛏'}</span>
          Room {b.roomNumber} · {b.roomType}
        </div>
        <div className="booking-dates">
          {b.checkIn} → {b.checkOut}
          <span className="booking-nights">{nights} night{nights !== 1 ? 's' : ''}</span>
        </div>
        <div className="booking-footer">
          <span className="booking-source">{b.source}</span>
          <span className="booking-amount">₹{b.totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
