import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BarChart3, 
  FileSearch, 
  Wrench, 
  History, 
  Info,
  Menu,
  ChevronRight,
  Github,
  Shield
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Upload Dataset', icon: UploadCloud },
  { path: '/analyze', label: 'Analyze Bias', icon: BarChart3 },
  { path: '/results', label: 'Results', icon: FileSearch },
  { path: '/fix', label: 'Fix Bias', icon: Wrench },
  { path: '/history', label: 'History', icon: History },
  { path: '/about', label: 'About', icon: Info },
];

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={'fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ' + (sidebarOpen ? 'translate-x-0' : '-translate-x-full')}
      >
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Unbiased AI</h1>
              <p className="text-xs text-slate-400">Decision System</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ' + (isActive ? 'bg-white/15 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10')}
              >
                <Icon className={'w-5 h-5 ' + (isActive ? 'text-indigo-300' : 'group-hover:text-indigo-300 transition-colors')} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-300" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <Github className="w-4 h-4" />
            <span>View on GitHub</span>
          </a>
          <p className="text-xs text-slate-500 mt-3">v1.0.0 &middot; Built with React + FastAPI</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-800">Unbiased AI</span>
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;

