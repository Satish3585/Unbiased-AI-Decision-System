import React from 'react';

/**
 * MetricCard - Displays a metric value with icon, title and subtitle
 * Used in dashboard and results pages
 * Accepts icon as: a Component, <Icon />, or null
 */
function MetricCard({ icon, title, value, subtitle, color = 'indigo', className = '' }) {
  const colorMap = {
    indigo: 'from-indigo-500 to-purple-500 text-indigo-600 bg-indigo-50',
    emerald: 'from-emerald-500 to-teal-500 text-emerald-600 bg-emerald-50',
    rose: 'from-rose-500 to-pink-500 text-rose-600 bg-rose-50',
    amber: 'from-amber-500 to-orange-500 text-amber-600 bg-amber-50',
    blue: 'from-blue-500 to-cyan-500 text-blue-600 bg-blue-50',
  };

  const theme = colorMap[color] || colorMap.indigo;

  // Handle icon properly: could be a component class/function, or a React element
  let iconElement = null;
  if (icon) {
    if (React.isValidElement(icon)) {
      // Already a React element like <Activity size={28} />
      iconElement = React.cloneElement(icon, { className: 'w-6 h-6 text-white' });
    } else if (typeof icon === 'function') {
      // Component type
      const IconComp = icon;
      iconElement = <IconComp className="w-6 h-6 text-white" />;
    }
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 ${className}`}>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme} flex items-center justify-center mb-4`}>
        {iconElement}
      </div>
      <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}

export default MetricCard;
