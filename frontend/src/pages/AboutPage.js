import React from 'react';
import { Info, Shield, Scale, Zap, BookOpen, Code } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="About"
        subtitle="Learn about the Unbiased AI Decision System methodology and metrics"
        icon={Info}
      />

      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-3">What is the Unbiased AI Decision System?</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                The Unbiased AI Decision System is a comprehensive platform designed to detect, measure,
                and correct bias in AI-driven decision-making datasets.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Built with a modern tech stack including React, FastAPI, and Tailwind CSS.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Upload', desc: 'Upload your CSV dataset with demographic and outcome columns.' },
              { step: '2', title: 'Select', desc: 'Choose the target outcome and protected attribute columns.' },
              { step: '3', title: 'Analyze', desc: 'Get detailed fairness metrics and bias gap calculations.' },
              { step: '4', title: 'Fix', desc: 'Apply intelligent resampling to balance group representation.' },
            ].map((item) => (
              <div key={item.step} className="text-center p-4 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-500" />
            Fairness Metrics Explained
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50">
              <h3 className="font-semibold text-slate-800 mb-2">Fairness Score</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Calculated as (minimum group rate / maximum group rate) * 100.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <h3 className="font-semibold text-slate-800 mb-2">Bias Gap</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The absolute difference between the highest and lowest group approval rates.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50">
              <h3 className="font-semibold text-slate-800 mb-2">Group Approval Rate</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The proportion of positive outcomes within each demographic group.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
