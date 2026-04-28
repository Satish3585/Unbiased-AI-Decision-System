import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  BarChart3, 
  FileSearch, 
  Wrench, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import ActionCard from '../components/ActionCard';

function HomePage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl overflow-hidden relative mb-10">
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Welcome!
            </h1>
            <p className="text-xl text-slate-500 font-medium mb-8">
              Ensure fairness and detect bias in your AI decisions.
            </p>
            <Link 
              to="/upload" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="flex-1 flex justify-center">
            {/* Simple CSS-based Balance Scale / Illustration */}
            <div className="relative w-72 h-56 flex items-end justify-center">
              <div className="absolute top-0 w-64 h-48 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner flex items-center justify-center">
                 <div className="w-48 h-32 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col p-4">
                    <div className="flex gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <div className="w-3 h-3 rounded-full bg-indigo-400" />
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded mb-2" />
                    <div className="w-3/4 h-2 bg-slate-100 rounded mb-2" />
                    <div className="w-full h-2 bg-slate-100 rounded mb-2" />
                 </div>
              </div>
              <div className="relative z-10 text-indigo-600 drop-shadow-xl scale-125 translate-y-4">
                <ShieldCheck size={120} strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard 
          icon={UploadCloud} 
          title="Upload Dataset" 
          description="Upload your CSV dataset to get started." 
          to="/upload" 
          color="indigo" 
          delay={0.1} 
        />
        <ActionCard 
          icon={BarChart3} 
          title="Analyze Bias" 
          description="Detect bias and measure fairness across groups." 
          to="/analyze" 
          color="indigo" 
          delay={0.2} 
        />
        <ActionCard 
          icon={FileSearch} 
          title="Explain Results" 
          description="Get AI-powered explanations." 
          to="/results" 
          color="indigo" 
          delay={0.3} 
        />
        <ActionCard 
          icon={Wrench} 
          title="Fix Bias" 
          description="Apply techniques to reduce bias." 
          to="/fix" 
          color="indigo" 
          delay={0.4} 
        />
      </div>
    </div>
  );
}

export default HomePage;
