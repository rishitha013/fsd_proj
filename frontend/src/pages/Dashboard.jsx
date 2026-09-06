import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import { ShieldCheck, ShieldAlert, FileText, Percent, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400">Loading risk metrics...</div>;
  }

  const chartData = [
    { name: 'Approved', value: stats?.approved_count || 0, color: '#10b981' },
    { name: 'Rejected', value: stats?.rejected_count || 0, color: '#f43f5e' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Executive Risk Dashboard</h1>
        <p className="text-sm text-slate-400">Live decision stream and aggregate portfolio indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Total Evaluated</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total_applications}</div>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Approved Decisions</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.approved_count}</div>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Rejected Decisions</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.rejected_count}</div>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Mean Model Confidence</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.avg_confidence}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-sm text-slate-200 mb-1">Approval Distribution</h2>
            <p className="text-xs text-slate-400">Overall outcome distribution</p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={5}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Approved</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Rejected</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-[#0b1120] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-sm text-slate-200">Recent Applications</h2>
              <p className="text-xs text-slate-400">Live decision stream from MongoDB Atlas</p>
            </div>
            <Link to="/history" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Applicant</th>
                  <th className="py-2.5 px-3">Loan Amount</th>
                  <th className="py-2.5 px-3">Decision</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.recent_decisions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-500">No applications recorded yet.</td>
                  </tr>
                ) : (
                  stats.recent_decisions.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-medium text-white">{d.name}</td>
                      <td className="py-3 px-3">₹{d.loan_amount.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          d.approved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {d.approved ? 'APPROVED' : 'REJECTED'}
                        </span>
                      </td>
                      <td className="py-3 px-3">{d.probability}%</td>
                      <td className="py-3 px-3">
                        <Link to={`/decision/${d.id}`} className="text-emerald-400 hover:underline">
                          Audit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;