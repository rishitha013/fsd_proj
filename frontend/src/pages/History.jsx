import React, { useEffect, useState } from 'react';
import { getApplications } from '../services/api';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const History = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  useEffect(() => {
    getApplications(500) // fetch up to 500 records
      .then((res) => setApps(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredApps = apps.filter((a) =>
    a.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredApps.length / recordsPerPage) || 1;
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredApps.slice(startIndex, startIndex + recordsPerPage);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit & Inferences History</h1>
          <p className="text-sm text-slate-400">
            Total records in database: <span className="text-emerald-400 font-semibold">{apps.length} applications</span>
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by applicant or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#0b1120] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="bg-[#0b1120] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Application ID</th>
              <th className="py-3.5 px-4">Applicant</th>
              <th className="py-3.5 px-4">Income</th>
              <th className="py-3.5 px-4">Loan Amount</th>
              <th className="py-3.5 px-4">Verdict</th>
              <th className="py-3.5 px-4">Confidence</th>
              <th className="py-3.5 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-500">Loading audit records from MongoDB...</td>
              </tr>
            ) : currentRecords.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-500">No matching applications found.</td>
              </tr>
            ) : (
              currentRecords.map((a) => (
                <tr key={a._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{a._id.substring(0, 8)}...</td>
                  <td className="py-3.5 px-4 font-medium text-white">{a.applicant_name}</td>
                  <td className="py-3.5 px-4">₹{a.inputs.annual_income.toLocaleString()}</td>
                  <td className="py-3.5 px-4">₹{a.inputs.loan_amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      a.approved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {a.approved ? 'APPROVED' : 'REJECTED'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold">{a.probability}%</td>
                  <td className="py-3.5 px-4">
                    <Link to={`/decision/${a._id}`} className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium">
                      Inspect SHAP →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
          <div>
            Showing <span className="text-white font-medium">{filteredApps.length === 0 ? 0 : startIndex + 1}</span> to{' '}
            <span className="text-white font-medium">{Math.min(startIndex + recordsPerPage, filteredApps.length)}</span> of{' '}
            <span className="text-white font-medium">{filteredApps.length}</span> entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;