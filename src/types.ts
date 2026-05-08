// Role type
export type Role = 'admin' | 'guest';

// Booking data type
export interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: 'Standard' | 'Deluxe' | 'Suite' | 'Penthouse';
  checkIn: string;  // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  totalAmount: number;
  currency: string;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  source: string;
}

export interface SelectionRange {
  start: Date;
  end: Date;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

export interface Filters {
  roomType: string;
  status: string;
  source: string;
}
