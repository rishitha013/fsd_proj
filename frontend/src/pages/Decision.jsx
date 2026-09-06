import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApplicationById, runWhatIf } from '../services/api';
import { CheckCircle2, XCircle, Sliders, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import AIChatDrawer from '../components/AIChatDrawer';

const Decision = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [whatIfIncome, setWhatIfIncome] = useState(0);
  const [whatIfAmount, setWhatIfAmount] = useState(0);
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  useEffect(() => {
    getApplicationById(id)
      .then((res) => {
        setData(res.data);
        if (res.data?.inputs) {
          setWhatIfIncome(res.data.inputs.annual_income || 0);
          setWhatIfAmount(res.data.inputs.loan_amount || 0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleWhatIfSubmit = async (e) => {
    e.preventDefault();
    setWhatIfLoading(true);
    try {
      const res = await runWhatIf({
        application_id: id,
        overrides: {
          annual_income: Number(whatIfIncome),
          loan_amount: Number(whatIfAmount),
        },
      });
      setWhatIfResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setWhatIfLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading audit records...</div>;
  if (!data) return <div className="p-8 text-rose-400">Application not found.</div>;

  const shapData = (data.shap_contributions || []).map((c) => ({
    feature: c.feature,
    contribution: Number(c.contribution) || 0,
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-mono text-slate-500">APPLICATION REF: {data._id}</span>
          <h1 className="text-3xl font-bold text-white tracking-tight">{data.applicant_name}</h1>
        </div>

        <div className={`px-5 py-3 rounded-xl border flex items-center space-x-3 ${
          data.approved
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {data.approved ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6 text-rose-400" />}
          <div>
            <div className="text-xs uppercase font-bold tracking-wider">
              {data.approved ? 'Loan Approved' : 'Loan Rejected'}
            </div>
            <div className="text-xl font-black">{data.probability}% Confidence</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0b1120] border border-slate-800 rounded-xl p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">SHAP Feature Attribution (TreeExplainer)</h2>
            <p className="text-xs text-slate-400">
              Positive values (green) drive loan approval; negative values (red) elevate risk of rejection.
            </p>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shapData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <XAxis type="number" domain={['dataMin - 0.1', 'dataMax + 0.1']} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11} width={160} />
                <Tooltip
                  formatter={(val) => [val, 'SHAP Impact']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                />
                <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />
                <Bar dataKey="contribution" barSize={16}>
                  {shapData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.contribution >= 0 ? '#10b981' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <Sliders className="w-4 h-4" />
              <h2 className="font-semibold text-sm text-white">Interactive What-If Engine</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Simulate modified financial figures through the live XGBoost inference model.
            </p>

            <form onSubmit={handleWhatIfSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Simulated Annual Income (₹)</label>
                <input
                  type="number"
                  value={whatIfIncome}
                  onChange={(e) => setWhatIfIncome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Simulated Loan Amount (₹)</label>
                <input
                  type="number"
                  value={whatIfAmount}
                  onChange={(e) => setWhatIfAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={whatIfLoading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 rounded flex items-center justify-center space-x-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${whatIfLoading ? 'animate-spin' : ''}`} />
                <span>Simulate Inferences</span>
              </button>
            </form>
          </div>

          {whatIfResult && (
            <div className="mt-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="text-slate-400 font-medium">Simulation Result:</div>
              <div className="flex justify-between items-center">
                <span>New Verdict:</span>
                <span className={`font-bold ${whatIfResult.what_if.approved ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {whatIfResult.what_if.approved ? 'APPROVED' : 'REJECTED'} ({whatIfResult.what_if.probability}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <AIChatDrawer applicationId={data._id} />
    </div>
  );
};

export default Decision;