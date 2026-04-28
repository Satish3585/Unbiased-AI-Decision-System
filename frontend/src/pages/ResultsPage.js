import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSearch,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
  ShieldCheck,
  BarChart3,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import BiasChart from '../components/BiasChart';
import ProgressBar from '../components/ProgressBar';
import MetricCard from '../components/MetricCard';

function ResultsPage() {
  const navigate = useNavigate();
  const { results, explanation } = useAppContext();
  const displayExplanation = explanation || results?.explanation || '';

  useEffect(() => {
    if (!results) {
      navigate('/analyze');
    }
  }, [results, navigate]);

  if (!results) return null;

  const score = results.fairness_score;
  const metricColor = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="max-w-6xl mx-auto py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <FileSearch size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Analysis Results</h1>
            <p className="text-slate-500 font-medium">Detailed fairness metrics and bias visualization.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/analyze')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button
            onClick={() => navigate('/fix')}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            Fix This Bias
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          icon={<ShieldCheck size={28} />}
          label="Fairness Score"
          value={`${results.fairness_score.toFixed(1)}%`}
          color={metricColor}
          desc="Higher is fairer (100% = perfect)"
        />
        <MetricCard
          icon={<BarChart3 size={28} />}
          label="Bias Gap"
          value={`${results.bias_gap.toFixed(1)}%`}
          color="text-rose-500"
          desc="Approval rate difference"
        />
        <MetricCard
          icon={<Activity size={28} />}
          label="Groups Analyzed"
          value={Object.keys(results.group_rates).length}
          color="text-slate-700"
          desc="Number of protected groups"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Group Approval Rates Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" /> Group Approval Rates
          </h3>
          <BiasChart data={results.group_rates} />
        </div>

        {/* Group Breakdown with Progress Bars */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" /> Group Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(results.group_rates).map(([g, rate]) => (
              <div key={g} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-700">{g}</span>
                <div className="flex items-center gap-3">
                  <ProgressBar
                    value={rate * 100}
                    color={rate * 100 >= 80 ? 'bg-emerald-500' : rate * 100 >= 50 ? 'bg-amber-500' : 'bg-rose-500'}
                  />
                  <span className="font-black text-slate-800 w-16 text-right">{(rate * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fairness Status Banner */}
      <div className={`rounded-3xl border p-8 mb-8 ${
        score >= 90
          ? 'bg-emerald-50 border-emerald-100'
          : score >= 70
          ? 'bg-amber-50 border-amber-100'
          : 'bg-rose-50 border-rose-100'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            score >= 90 ? 'bg-emerald-100 text-emerald-600' : score >= 70 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
          }`}>
            {score >= 90 ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <h3 className={`text-xl font-black mb-2 ${
              score >= 90 ? 'text-emerald-900' : score >= 70 ? 'text-amber-900' : 'text-rose-900'
            }`}>
              {score >= 90 ? 'Fair System Detected' : score >= 70 ? 'Moderate Bias Detected' : 'Significant Bias Detected'}
            </h3>
            <p className={`leading-relaxed font-medium ${
              score >= 90 ? 'text-emerald-700' : score >= 70 ? 'text-amber-700' : 'text-rose-700'
            }`}>
              {score >= 90
                ? 'Your dataset shows fair representation across all protected groups. The fairness score is above 90%, indicating balanced outcomes.'
                : score >= 70
                ? 'Your dataset shows moderate bias. Some groups experience slightly different outcomes. Consider reviewing the data or applying bias correction.'
                : 'Your dataset shows significant bias. One or more protected groups are experiencing substantially different outcomes. Bias correction is strongly recommended.'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden mb-8">
        <div className="p-10">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-800 mb-4">AI Explanation</h3>
              <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                {displayExplanation.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
                {!displayExplanation && <p>No detailed explanation available for this dataset.</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Lightbulb className="text-amber-500" />
              Recommendations
            </h4>
            <ul className="grid gap-4">
              {[
                'Review input features for potential bias.',
                'Consider collecting more diverse data.',
                'Apply bias mitigation techniques.',
                'Monitor fairness metrics in production.',
                'Set up alerts when fairness score drops below 90%.'
              ].map((rec, i) => (
                <li key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="font-bold text-slate-700 group-hover:text-indigo-900 transition-colors">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => navigate('/analyze')}
          className="px-10 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all shadow-lg flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Analysis
        </button>
        <button
          onClick={() => navigate('/fix')}
          className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl flex items-center gap-2"
        >
          Fix Bias <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ResultsPage;

