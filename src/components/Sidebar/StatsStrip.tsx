import React from 'react';
import type { MonthStats } from '../../utils/dateUtils';

interface StatsStripProps {
  stats: MonthStats;
  monthName: string;
}

export const StatsStrip: React.FC<StatsStripProps> = ({ stats, monthName }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
    if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`;
    return `₹${amount}`;
  };

  return (
    <div className="stats-strip">
      <div className="stat-card">
        <span className="stat-icon">💰</span>
        <div className="stat-body">
          <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="stat-label">Revenue · {monthName}</div>
        </div>
      </div>
      <div className="stat-card">
        <span className="stat-icon">📊</span>
        <div className="stat-body">
          <div className="stat-value">{stats.avgOccupancy}%</div>
          <div className="stat-label">Avg Occupancy</div>
        </div>
      </div>
      <div className="stat-card">
        <span className="stat-icon">🛏️</span>
        <div className="stat-body">
          <div className="stat-value">{stats.longestStay}n</div>
          <div className="stat-label">Longest Stay</div>
        </div>
      </div>
      <div className="stat-card">
        <span className="stat-icon">🏆</span>
        <div className="stat-body">
          <div className="stat-value">{stats.mostBookedRoomType}</div>
          <div className="stat-label">Top Room Type</div>
        </div>
      </div>
    </div>
  );
};
