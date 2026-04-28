import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, CheckCircle, Loader, ArrowRight, ShieldAlert, Shield } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { uploadCSV } from "../api";

function UploadPage() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  const { file, setFile, setColumns, setMetadata, target, setTarget, group, setGroup, resetAnalysis, loading, setLoading, error, setError } = ctx;
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (fileToUpload) => {
    if (!fileToUpload) return;
    setLoading(true);
    setError("");
    resetAnalysis();
    try {
      const res = await uploadCSV(fileToUpload);
      setColumns(res.data.columns);
      setMetadata(res.data.metadata || {});
      setFile(fileToUpload);
    } catch (err) { setError("Upload failed: " + (err.response?.data?.detail || err.message)); }
    setLoading(false);
  };

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.name.endsWith(".csv")) handleUpload(f);
    else setError("Please upload a valid CSV file.");
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f?.name.endsWith(".csv")) handleUpload(f); else setError("Please upload a CSV file."); };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg"><UploadCloud size={24}/></div>
        <div><h1 className="text-3xl font-black text-slate-900">Upload Dataset</h1><p className="text-slate-500 font-medium">Upload your CSV file to analyze for bias.</p></div>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5"/>
          <p className="text-rose-800 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 mb-8">
        <div className={`border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${dragActive?"border-indigo-500 bg-indigo-50/50":"border-slate-200 hover:border-indigo-300"}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
          <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center mx-auto mb-6 text-slate-400"><UploadCloud size={40}/></div>
          <p className="text-xl font-bold text-slate-700 mb-2">Drag and drop your file here</p>
          <p className="text-slate-400 font-medium mb-8">or click to browse</p>
          <input type="file" accept=".csv" onChange={onFileChange} className="hidden" id="csv-upload"/>
          <label htmlFor="csv-upload" className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-lg">
            {loading?<Loader className="animate-spin"/>:<Shield size={18}/>}{loading?"Processing...":(file?"Uploaded Successfully":"Choose File")}
          </label>
          <p className="mt-6 text-xs text-slate-400 font-medium tracking-wide uppercase">Supports CSV files only</p>
        </div>

        {file && (
          <div className="mt-8 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm"><FileText size={20}/></div>
              <div><p className="font-bold text-slate-800">{file.name}</p><p className="text-xs text-emerald-600 font-medium">{(file.size/1024).toFixed(1)} KB &bull; Uploaded successfully</p></div>
            </div>
            <CheckCircle size={24} className="text-emerald-500"/>
          </div>
        )}
      </div>

      {file && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 animate-fadeIn">
          <h2 className="text-xl font-black text-slate-800 mb-6">Select Columns</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-500 ml-1">Target Column (Decision) <span className="text-emerald-600">— must be binary (2 values)</span></label>
              <select className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all cursor-pointer" value={target} onChange={(e)=>setTarget(e.target.value)}>
                <option value="">Select Target...</option>
                {ctx.columns.map(c => {
                  const meta = ctx.metadata[c] || {};
                  const isValid = meta.is_binary;
                  const preview = meta.unique_values_preview?.join(', ') || '';
                  const label = isValid
                    ? `${c}  ✓ binary (${preview})`
                    : `${c}  — ${meta.unique_count} values: ${preview}`;
                  return (
                    <option key={c} value={c} disabled={!isValid} style={{color: isValid ? '#1e293b' : '#94a3b8'}}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Valid targets show <span className="text-emerald-600 font-bold">✓ binary</span>. Columns with exactly 2 unique values (0/1, yes/no, pass/fail, etc.) work best.
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-500 ml-1">Protected Attribute <span className="text-emerald-600">— must be categorical</span></label>
              <select className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all cursor-pointer" value={group} onChange={(e)=>setGroup(e.target.value)}>
                <option value="">Select Attribute...</option>
                {ctx.columns.map(c => {
                  const meta = ctx.metadata[c] || {};
                  const isValid = meta.is_categorical;
                  const preview = meta.unique_values_preview?.join(', ') || '';
                  const label = isValid
                    ? `${c}  ✓ ${meta.unique_count} categories (${preview})`
                    : meta.is_id_column
                    ? `${c}  — ID column (${meta.unique_count} values)`
                    : `${c}  — ${meta.unique_count} values: ${preview}`;
                  return (
                    <option key={c} value={c} disabled={!isValid} style={{color: isValid ? '#1e293b' : '#94a3b8'}}>
                      {label}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Valid attributes show <span className="text-emerald-600 font-bold">✓ categories</span>. Must have ≤ 10 unique values (gender, race, age group). ID columns are excluded.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={()=>navigate("/analyze")} disabled={!target||!group} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
              Proceed to Analysis <ArrowRight className="w-5 h-5"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
