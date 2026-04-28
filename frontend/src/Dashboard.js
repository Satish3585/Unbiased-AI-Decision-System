import React from 'react';
import { AlertTriangle, CheckCircle, TrendingUp, Users, Zap, Info, ArrowRight } from 'lucide-react';
import Chart from './Chart';

function Dashboard({ results, fixedResults, explanation, getFairnessStatus }) {
  const before = fixedResults?.before || results;
  const after = fixedResults?.after || null;
  const status = getFairnessStatus ? getFairnessStatus(results.fairness_score) : { label: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Comparison Banner */}
      {fixedResults && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="font-bold text-indigo-900 text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={22} /> Before vs After Comparison
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Before Fairness</p>
              <p className="text-3xl font-bold text-red-500">{before.fairness_score}%</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Original</span>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <p className="text-sm text-gray-500 mb-1">After Fairness</p>
              <p className="text-3xl font-bold text-green-500">{after.fairness_score}%</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Corrected</span>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Improvement</p>
              <p className="text-3xl font-bold text-indigo-600">
                +{(after.fairness_score - before.fairness_score).toFixed(1)}%
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">Gain</span>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Fairness Score</p>
            <Zap size={18} className={status.color} />
          </div>
          <p className={`text-3xl font-bold ${status.color}`}>{results.fairness_score}%</p>
          <span className={`inline-block mt-2 px-2 py-0.5 ${status.bg} ${status.color} text-xs rounded-full font-medium`}>
            {status.label}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Bias Gap</p>
            <AlertTriangle size={18} className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-500">{results.bias_gap}%</p>
          <p className="text-xs text-gray-400 mt-2">Difference between highest and lowest group</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Groups</p>
            <Users size={18} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{Object.keys(results.group_rates).length}</p>
          <p className="text-xs text-gray-400 mt-2">Protected attribute categories</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Status</p>
            {results.fairness_score >= 90 ? <CheckCircle size={18} className="text-green-500" /> : <AlertTriangle size={18} className="text-red-500" />}
          </div>
          <p className={`text-lg font-bold ${results.fairness_score >= 90 ? 'text-green-600' : 'text-red-600'}`}>
            {results.fairness_score >= 90 ? 'Fair' : 'Biased Detected'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {results.fairness_score >= 90 ? 'System is balanced' : 'Correction recommended'}
          </p>
        </div>
      </div>

      {/* Group Rates Table + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Group Approval Rates</h3>
          <Chart data={results.group_rates} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(results.group_rates).map(([groupName, rate]) => (
              <div key={groupName} className="flex items-center gap-4">
                <div className="w-24 font-medium text-gray-700">{groupName}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      rate >= 0.8 ? 'bg-green-500' : rate >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${rate * 100}%` }}
                  />
                </div>
                <div className="w-16 text-right font-semibold text-gray-800">{(rate * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
          <Info size={20} /> Analysis Explanation
        </h3>
        <p className="text-gray-800 leading-relaxed">{explanation}</p>
      </div>

      {/* Recommendations */}
      {results.fairness_score < 90 && !fixedResults && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Recommendation
          </h3>
          <p className="text-gray-800 mb-3">
            The fairness score is below 90%. We recommend applying bias correction to balance the dataset.
          </p>
          <div className="flex items-center gap-2 text-sm text-red-700">
            <ArrowRight size={16} />
            <span>Click the <strong>"Fix Bias"</strong> button above to apply automatic correction.</span>
          </div>
        </div>
      )}

      {fixedResults && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
            <CheckCircle size={20} /> Correction Applied
          </h3>
          <p className="text-gray-800">
            Bias correction has been successfully applied using resampling techniques. The dataset has been balanced to ensure fair representation across all groups.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

