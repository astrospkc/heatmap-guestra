import React from 'react';
import type { Booking, SelectionRange } from '../../types';
import {
  getAvailableRooms,
  getOverlappingBookings,
  formatDisplay,
  nightsBetween,
} from '../../utils/dateUtils';

interface GuestPanelProps {
  bookings: Booking[];
  selection: SelectionRange | null;
}

const ALL_ROOMS = ['101', '102', '103', '201', '202', '203', '301', '302', '401', '402'];

const ROOM_META: Record<string, { type: string; icon: string; floor: string }> = {
  '101': { type: 'Standard',   icon: '🛏',  floor: '1st Floor' },
  '102': { type: 'Standard',   icon: '🛏',  floor: '1st Floor' },
  '103': { type: 'Deluxe',     icon: '🛎',  floor: '1st Floor' },
  '201': { type: 'Deluxe',     icon: '🛎',  floor: '2nd Floor' },
  '202': { type: 'Deluxe',     icon: '🛎',  floor: '2nd Floor' },
  '203': { type: 'Suite',      icon: '✨',  floor: '2nd Floor' },
  '301': { type: 'Suite',      icon: '✨',  floor: '3rd Floor' },
  '302': { type: 'Suite',      icon: '✨',  floor: '3rd Floor' },
  '401': { type: 'Penthouse',  icon: '🏙',  floor: 'Top Floor' },
  '402': { type: 'Penthouse',  icon: '🏙',  floor: 'Top Floor' },
};

export const GuestPanel: React.FC<GuestPanelProps> = ({ bookings, selection }) => {
  if (!selection) {
    return (
      <div className="panel-empty">
        <div className="panel-empty-icon">🏨</div>
        <p>Select a check-in &amp; check-out date</p>
        <p className="panel-empty-sub">Drag across dates to see available rooms</p>
      </div>
    );
  }

  const availableRooms = getAvailableRooms(bookings, selection.start, selection.end);
  const occupiedRooms  = ALL_ROOMS.filter((r) => !availableRooms.includes(r));

  const isSingleDay = selection.start.getTime() === selection.end.getTime();
  const dateLabel   = isSingleDay
    ? formatDisplay(selection.start)
    : `${formatDisplay(selection.start)} – ${formatDisplay(selection.end)}`;
  const nights = isSingleDay
    ? 1
    : Math.round((selection.end.getTime() - selection.start.getTime()) / 86_400_000) + 1;

  return (
    <div className="booking-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-date-range">{dateLabel}</div>
        <div className="panel-meta">{nights} night{nights !== 1 ? 's' : ''}</div>
      </div>

      {/* Summary chips */}
      <div className="guest-summary-row">
        <span className="guest-summary-chip avail">
          ✅ {availableRooms.length} Available
        </span>
        <span className="guest-summary-chip occup">
          🔴 {occupiedRooms.length} Occupied
        </span>
      </div>

      {/* Available rooms */}
      {availableRooms.length === 0 ? (
        <div className="guest-fully-booked">
          <div className="guest-fully-booked-icon">😔</div>
          <p>No rooms available for this period</p>
          <p className="panel-empty-sub">Try a different date range</p>
        </div>
      ) : (
        <div className="guest-rooms-section">
          <div className="guest-rooms-title">
            <span className="avail-dot" /> Available Rooms
          </div>
          <div className="guest-room-list">
            {availableRooms.map((roomNum) => {
              const meta = ROOM_META[roomNum];
              return (
                <div key={roomNum} className="guest-room-card">
                  <div className="guest-room-icon">{meta.icon}</div>
                  <div className="guest-room-info">
                    <div className="guest-room-name">Room {roomNum}</div>
                    <div className="guest-room-meta">{meta.type} · {meta.floor}</div>
                  </div>
                  <div className="guest-room-badge avail-badge">Available</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Occupied rooms */}
      {occupiedRooms.length > 0 && (
        <div className="guest-rooms-section">
          <div className="guest-rooms-title unavail-title">
            <span className="unavail-dot" /> Occupied Rooms
          </div>
          <div className="guest-room-list">
            {occupiedRooms.map((roomNum) => {
              const meta = ROOM_META[roomNum];
              return (
                <div key={roomNum} className="guest-room-card guest-room-card--dim">
                  <div className="guest-room-icon">{meta.icon}</div>
                  <div className="guest-room-info">
                    <div className="guest-room-name">Room {roomNum}</div>
                    <div className="guest-room-meta">{meta.type} · {meta.floor}</div>
                  </div>
                  <div className="guest-room-badge unavail-badge">Booked</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
