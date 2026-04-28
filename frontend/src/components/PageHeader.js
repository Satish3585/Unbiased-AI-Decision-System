import React from 'react';

function PageHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-8 h-8 text-indigo-600" />}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
            {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
