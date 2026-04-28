import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * ActionCard - Dashboard action card with icon, title, description and link
 */
function ActionCard({ icon: Icon, title, description, to, color = 'indigo', delay = 0 }) {
  const colorMap = {
    indigo: 'from-indigo-500 to-purple-500 shadow-indigo-200',
    emerald: 'from-emerald-500 to-teal-500 shadow-emerald-200',
    rose: 'from-rose-500 to-pink-500 shadow-rose-200',
    amber: 'from-amber-500 to-orange-500 shadow-amber-200',
  };

  const theme = colorMap[color] || colorMap.indigo;

  return (
    <Link
      to={to}
      className={'block bg-white rounded-2xl p-6 border border-slate-100 card-hover group animate-fadeIn'}
      style={{ animationDelay: delay + 's' }}
    >
      <div className={'w-14 h-14 rounded-xl bg-gradient-to-br ' + theme + ' flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300'}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-4">{description}</p>
      <div className="flex items-center gap-1 text-indigo-600 font-medium text-sm group-hover:gap-2 transition-all">
        <span>Get Started</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

export default ActionCard;
