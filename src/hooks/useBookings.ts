import { useState, useEffect } from 'react';
import type { Booking } from '../types';

interface UseBookingsResult {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

export function useBookings(): UseBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('bookings.json')
        const data = await res.json();
        console.log("data: ", data)
        setBookings(data);
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
        setLoading(false);
      }

    }
    fetchBookings()

  }, []);


  return { bookings, loading, error };
}
