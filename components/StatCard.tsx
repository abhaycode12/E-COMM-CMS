
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  trend: number;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon }) => {
  const isPositive = trend >= 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="p-3 bg-gray-50 rounded-xl text-2xl">{icon}</span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? '+' : ''}{trend}%
        </span>
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
