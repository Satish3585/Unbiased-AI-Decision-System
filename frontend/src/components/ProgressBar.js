import React from 'react';

function ProgressBar({ value, max = 100, size = 'md' }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getColor = () => {
    if (percentage >= 90) return 'bg-emerald-500';
    if (percentage >= 70) return 'bg-amber-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colorClass = getColor();
  const textColor = colorClass.replace('bg-', 'text-');

  return (
    <div className="w-full">
      <div className={'w-full bg-slate-200 rounded-full overflow-hidden ' + (sizeClasses[size] || sizeClasses.md)}>
        <div
          className={'h-full rounded-full transition-all duration-1000 ease-out ' + colorClass}
          style={{ width: percentage + '%' }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-slate-400">0%</span>
        <span className={'text-xs font-semibold ' + textColor}>
          {value.toFixed(1)}%
        </span>
        <span className="text-xs text-slate-400">100%</span>
      </div>
    </div>
  );
}

export default ProgressBar;

