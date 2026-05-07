import type { Booking, CalendarDay } from '../types';

// ─── Date helpers ────────────────────────────────────────────────────────────

/** Strip time component — compare dates by calendar day only */
export function toDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Parse a YYYY-MM-DD string as a local date (no timezone shift) */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date as YYYY-MM-DD */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format as "Jan 5, 2026" */
export function formatDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Number of nights between checkIn and checkOut */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseDate(checkIn);
  const b = parseDate(checkOut);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

// ─── Calendar grid ───────────────────────────────────────────────────────────

/**
 * Returns a grid of CalendarDay objects for the given month.
 * Always starts on Sunday, always a complete 6-week grid (42 cells).
 */
export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const startDay = firstOfMonth.getDay(); // 0=Sun
  const days: CalendarDay[] = [];

  // Pad from previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= lastOfMonth.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  // Pad to next month to complete 6 rows (42 cells)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
  }

  return days;
}

// ─── Occupancy logic ─────────────────────────────────────────────────────────

/**
 * Returns true if a booking occupies the given night.
 * Rule: checkIn <= date < checkOut  (checkout day is FREE)
 * Cancelled bookings never count.
 */
export function bookingOccupiesNight(booking: Booking, date: Date): boolean {
  if (booking.status === 'cancelled') return false;
  const night = toDay(date).getTime();
  const checkIn = parseDate(booking.checkIn).getTime();
  const checkOut = parseDate(booking.checkOut).getTime();
  return night >= checkIn && night < checkOut;
}

/** Count how many rooms are occupied on a given night (out of 10 total) */
export function getOccupancyCount(bookings: Booking[], date: Date): number {
  const occupiedRooms = new Set<string>();
  for (const b of bookings) {
    if (bookingOccupiesNight(b, date)) {
      occupiedRooms.add(b.roomNumber);
    }
  }
  return occupiedRooms.size;
}

/** Returns all bookings that overlap with the given date range [start, end] inclusive */
export function getOverlappingBookings(
  bookings: Booking[],
  start: Date,
  end: Date
): Booking[] {
  const s = toDay(start).getTime();
  // end is inclusive: we want bookings that checkIn before end+1 and checkOut after start
  const e = new Date(toDay(end).getTime() + 86_400_000).getTime(); // end + 1 day

  return bookings.filter((b) => {
    const checkIn = parseDate(b.checkIn).getTime();
    const checkOut = parseDate(b.checkOut).getTime();
    // Overlap: checkIn < e && checkOut > s
    return checkIn < e && checkOut > s;
  });
}

/** Get rooms NOT booked during the range [start, end] */
export function getAvailableRooms(
  bookings: Booking[],
  start: Date,
  end: Date
): string[] {
  const allRooms = ['101', '102', '103', '201', '202', '203', '301', '302', '401', '402'];
  const overlapping = getOverlappingBookings(bookings, start, end);

  // A room is unavailable if it has any non-cancelled booking overlapping the range
  const bookedRooms = new Set(
    overlapping.filter((b) => b.status !== 'cancelled').map((b) => b.roomNumber)
  );

  return allRooms.filter((r) => !bookedRooms.has(r));
}

// ─── Stats helpers ────────────────────────────────────────────────────────────

export interface MonthStats {
  totalRevenue: number;
  avgOccupancy: number; // percentage
  longestStay: number;  // nights
  mostBookedRoomType: string;
}

export function getMonthStats(bookings: Booking[], year: number, month: number): MonthStats {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Total occupancy across all days
  let totalOccupied = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    totalOccupied += getOccupancyCount(bookings, new Date(year, month, d));
  }
  const avgOccupancy = Math.round((totalOccupied / (daysInMonth * 10)) * 100);

  // Revenue: bookings that overlap this month (non-cancelled)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month, daysInMonth);
  const monthBookings = getOverlappingBookings(bookings, firstDay, lastDay).filter(
    (b) => b.status !== 'cancelled'
  );

  const totalRevenue = monthBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const longestStay = monthBookings.reduce(
    (max, b) => Math.max(max, nightsBetween(b.checkIn, b.checkOut)),
    0
  );

  // Most booked room type
  const typeCounts: Record<string, number> = {};
  for (const b of monthBookings) {
    typeCounts[b.roomType] = (typeCounts[b.roomType] ?? 0) + 1;
  }
  const mostBookedRoomType =
    Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  return { totalRevenue, avgOccupancy, longestStay, mostBookedRoomType };
}

// ─── Heatmap color ────────────────────────────────────────────────────────────

/** Returns a CSS background color based on occupancy count out of 10 */
export function getHeatmapColor(count: number): string {
  if (count === 0) return 'rgba(255,255,255,0.04)';
  if (count <= 2)  return 'rgba(139, 92, 246, 0.25)';  // soft lavender
  if (count <= 4)  return 'rgba(124, 58, 237, 0.45)';  // medium purple
  if (count <= 6)  return 'rgba(251, 146, 60, 0.50)';  // warm amber
  if (count <= 8)  return 'rgba(249, 115, 22, 0.65)';  // orange
  return 'rgba(239, 68, 68, 0.75)';                     // full red — almost full
}

/** Text label for heatmap count */
export function getHeatmapLabel(count: number): string {
  if (count === 0) return 'Available';
  if (count <= 3)  return 'Low';
  if (count <= 6)  return 'Moderate';
  if (count <= 8)  return 'High';
  return 'Full';
}
