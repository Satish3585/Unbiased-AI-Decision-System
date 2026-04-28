import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, ArrowRight, BarChart3, Brain, AlertTriangle, CheckCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { analyzeBias } from "../api";
import MetricCard from "../components/MetricCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function AnalyzePage() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  const { target, group, results, setResults, loading, setLoading, error, setError } = ctx;

  useEffect(() => {
    if (!ctx.file) navigate("/");
  }, [ctx.file, navigate]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    if (ctx.resetFix) ctx.resetFix();
    try {
      const res = await analyzeBias(target, group);
      setResults(res.data);
    } catch (err) {
      setError("Analysis failed: " + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  const getGroupChartData = () => {
    if (!results || !results.group_rates) return [];
    return Object.entries(results.group_rates).map(([g, rate]) => ({
      group: g,
      rate: Math.round(rate * 100)
    }));
  };

  const isFair = results && results.fairness_score >= 90;
  const isModerate = results && results.fairness_score >= 50 && results.fairness_score < 90;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Bias Analysis</h1>
            <p className="text-slate-500 font-medium">Detect and measure algorithmic bias.</p>
          </div>
        </div>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-all">
          <ArrowLeft size={20} /> Back
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-rose-800 font-medium">{error}</p>
        </div>
      )}

      {!results && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-violet-50 flex items-center justify-center mx-auto mb-6 text-violet-600">
            <BarChart3 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Analyze Dataset</h2>
          <p className="text-slate-500 font-medium mb-2">Target: <strong>{target}</strong></p>
          <p className="text-slate-500 font-medium mb-8">Protected Attribute: <strong>{group}</strong></p>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-10 py-4 bg-violet-600 text-white rounded-2xl font-black text-lg hover:bg-violet-700 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loading ? "Analyzing..." : "Analyze Bias"}
          </button>
        </div>
      )}

      {results && (
        <div>
          <div className={"rounded-2xl p-6 mb-8 flex items-center gap-4 " + (isFair ? "bg-emerald-50 border border-emerald-200" : isModerate ? "bg-amber-50 border border-amber-200" : "bg-rose-50 border border-rose-200")}>
            {isFair ? <CheckCircle className="w-8 h-8 text-emerald-600" /> : isModerate ? <AlertTriangle className="w-8 h-8 text-amber-600" /> : <AlertTriangle className="w-8 h-8 text-rose-600" />}
            <div>
              <h3 className={"font-bold text-lg " + (isFair ? "text-emerald-800" : isModerate ? "text-amber-800" : "text-rose-800")}>
                {isFair ? "Fair - No Significant Bias Detected" : isModerate ? "Moderate Bias Detected" : "High Bias Detected - Action Recommended"}
              </h3>
              <p className="text-slate-600 font-medium">Fairness Score: {results.fairness_score}% | Bias Gap: {results.bias_gap}%</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              icon={<Activity size={28} />}
              title="Fairness Score"
              value={results.fairness_score + "%"}
              subtitle="Higher is better"
              color={isFair ? "emerald" : isModerate ? "amber" : "rose"}
            />
            <MetricCard
              icon={<AlertTriangle size={28} />}
              title="Bias Gap"
              value={results.bias_gap + "%"}
              subtitle="Difference between highest and lowest group"
              color="amber"
            />
            <MetricCard
              icon={<BarChart3 size={28} />}
              title="Groups Analyzed"
              value={Object.keys(results.group_rates).length}
              subtitle="Number of protected groups"
              color="blue"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-violet-600" /> Group Approval Rates
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getGroupChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="group" tick={{ fontSize: 13, fill: "#475569" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => v + "%"} />
                  <Tooltip formatter={(value) => [value + "%", "Approval Rate"]} />
                  <Bar dataKey="rate" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Brain size={20} className="text-violet-600" /> Fairness vs Bias Gap
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{ name: "Score", val: results.fairness_score }, { name: "Gap", val: results.bias_gap }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="val" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 mb-8">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Brain size={20} className="text-violet-600" /> Group Breakdown
            </h3>
            <div className="space-y-4">
              {Object.entries(results.group_rates).map(([g, rate]) => (
                <div key={g} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-700">{g}</span>
                  <div className="flex items-center gap-3 flex-1 mx-4">
                    <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div className={"h-full rounded-full transition-all " + (rate * 100 >= 80 ? "bg-emerald-500" : rate * 100 >= 50 ? "bg-amber-500" : "bg-rose-500")} style={{ width: (rate * 100) + "%" }} />
                    </div>
                    <span className="font-black text-slate-800 w-16 text-right">{(rate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-3xl border border-violet-100 p-8 mb-8">
            <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
              <Brain size={20} className="text-violet-600" /> Explanation
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium text-lg">{results.explanation}</p>
          </div>

          <div className="flex justify-end gap-4">
            <button onClick={() => { setResults(null); setError(""); }} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all">Re-analyze</button>
            {!isFair && <button onClick={() => navigate("/fix")} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl flex items-center gap-2">Fix Bias <ArrowRight className="w-5 h-5" /></button>}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyzePage;

