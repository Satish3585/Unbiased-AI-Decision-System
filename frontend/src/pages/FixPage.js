import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Sparkles, RefreshCw, TrendingUp, Users, BarChart3 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { fixBias, explainWithAI } from "../api";
import MetricCard from "../components/MetricCard";
import ProgressBar from "../components/ProgressBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function FixPage() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  const { target, group, fixedResults, setFixedResults, setAiExplanation, aiExplanation, loading, setLoading, error, setError } = ctx;
  const [showAI, setShowAI] = useState(false);

  const handleFix = async () => {
    setLoading(true);
    setError("");
    setShowAI(false);
    try {
      const res = await fixBias(target, group);
      setFixedResults(res.data);
    } catch (err) { setError("Fix failed: " + (err.response?.data?.detail || err.message)); }
    setLoading(false);
  };

  const handleAIExplain = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await explainWithAI(target, group);
      setAiExplanation(res.data.ai_explanation);
      setShowAI(true);
    } catch (err) { setError("AI explanation failed: " + (err.response?.data?.detail || err.message)); }
    setLoading(false);
  };

  const getBeforeAfterData = () => {
    if (!fixedResults) return [];
    return Object.entries(fixedResults.before.group_rates).map(([g]) => ({
      group: g,
      before: Math.round(fixedResults.before.group_rates[g] * 100),
      after: Math.round(fixedResults.after.group_rates[g] * 100)
    }));
  };

  const getFairnessData = () => {
    if (!fixedResults) return [];
    return [
      { name: "Before", value: fixedResults.before.fairness_score },
      { name: "After", value: fixedResults.after.fairness_score }
    ];
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg"><Sparkles size={24}/></div>
          <div><h1 className="text-3xl font-black text-slate-900">Bias Fix</h1><p className="text-slate-500 font-medium">Apply corrections and review improvements.</p></div>
        </div>
        <button onClick={()=>navigate("/analyze")} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-all"><ArrowLeft size={20}/> Back</button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-100 rounded-2xl p-5">
          <p className="text-rose-800 font-medium">{error}</p>
        </div>
      )}

      {!fixedResults && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-6 text-emerald-600"><Sparkles size={40}/></div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Ready to Fix</h2>
          <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">We will balance the dataset by resampling underrepresented groups.</p>
          <button onClick={handleFix} disabled={loading} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2 mx-auto">
            {loading?<RefreshCw className="animate-spin"/>:"Fix Bias"} {loading?"Processing...":"Apply Fix"}
          </button>
        </div>
      )}

      {fixedResults && (
        <div>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <MetricCard icon={<CheckCircle size={28}/>} title="Before Score" value={fixedResults.before.fairness_score.toFixed(1) + "%"} color="amber" />
            <MetricCard icon={<CheckCircle size={28}/>} title="After Score" value={fixedResults.after.fairness_score.toFixed(1) + "%"} color="emerald" />
            <MetricCard icon={<TrendingUp size={28}/>} title="Improvement" value={"+" + fixedResults.improvement.toFixed(1) + "pp"} color="blue" />
            <MetricCard icon={<Users size={28}/>} title="Rows Added" value={fixedResults.rows_after - fixedResults.rows_before} color="indigo" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-emerald-600"/> Before vs After: Group Rates
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getBeforeAfterData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="group" tick={{ fontSize: 13, fill: "#475569" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => v + "%"} />
                  <Tooltip formatter={(value) => [value + "%", "Rate"]} />
                  <Legend />
                  <Bar dataKey="before" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="after" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-600"/> Fairness Score Comparison
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getFairnessData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#475569" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => v + "%"} />
                  <Tooltip formatter={(value) => [value + "%", "Score"]} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 mb-8">
            <h3 className="text-lg font-black text-slate-800 mb-6">Group Rate Changes</h3>
            <div className="space-y-6">
              {Object.entries(fixedResults.before.group_rates).map(([g]) => (
                <div key={g} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>{g}</span>
                    <span className="text-slate-400">Before {(fixedResults.before.group_rates[g]*100).toFixed(1)}% to After {(fixedResults.after.group_rates[g]*100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <ProgressBar value={fixedResults.before.group_rates[g]*100} color="bg-amber-400" />
                    <ProgressBar value={fixedResults.after.group_rates[g]*100} color="bg-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100 p-8 mb-8">
            <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2"><Sparkles size={20} className="text-emerald-600"/> Fix Summary</h3>
            <p className="text-slate-600 leading-relaxed font-medium text-lg">{fixedResults.after.explanation}</p>
          </div>

          {!showAI && (
            <div className="flex justify-center mb-8">
              <button onClick={handleAIExplain} disabled={loading} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2">
                {loading?<RefreshCw className="animate-spin"/>:"Get AI Explanation"} <Sparkles className="w-5 h-5"/>
              </button>
            </div>
          )}

          {showAI && aiExplanation && (
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-3xl border border-indigo-100 p-8 mb-8">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Sparkles size={20} className="text-indigo-600"/> AI-Generated Explanation</h3>
              <div className="prose prose-slate max-w-none">
                {aiExplanation.split('\n').map((line, i) => (
                  line.startsWith('- ') ? (
                    <li key={i} className="text-slate-600 font-medium ml-4">{line.slice(2)}</li>
                  ) : line.startsWith('**') && line.endsWith('**') ? (
                    <h4 key={i} className="text-slate-800 font-bold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>
                  ) : (
                    <p key={i} className="text-slate-600 leading-relaxed font-medium mb-2">{line}</p>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FixPage;

