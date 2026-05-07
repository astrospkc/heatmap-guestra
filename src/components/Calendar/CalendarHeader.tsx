import React from 'react';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  year,
  month,
  onPrev,
  onNext,
  onToday,
}) => {
  return (
    <div className="cal-header">
      <div className="cal-header-left">
        <h2 className="cal-month-title">
          {MONTH_NAMES[month]} <span className="cal-year">{year}</span>
        </h2>
      </div>
      <div className="cal-header-right">
        <button className="cal-btn today-btn" onClick={onToday}>
          Today
        </button>
        <button className="cal-btn nav-btn" onClick={onPrev} aria-label="Previous month">
          ‹
        </button>
        <button className="cal-btn nav-btn" onClick={onNext} aria-label="Next month">
          ›
        </button>
      </div>
    </div>
  );
};
