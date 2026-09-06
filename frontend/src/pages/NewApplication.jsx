import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApplication } from '../services/api';
import { Send, Sparkles, AlertCircle } from 'lucide-react';

const NewApplication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    applicant_name: 'Aditya Sharma',
    annual_income: 850000,
    credit_score: 740,
    loan_amount: 1500000,
    loan_term_months: 60,
    emp_length_years: 5,
    dti_ratio: 22,
    delinquencies: 0,
    home_ownership: 1,
    loan_purpose: 0,
    existing_liabilities: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'applicant_name' ? value : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await createApplication(formData);
      if (res?.data?._id) {
        navigate(`/decision/${res.data._id}`);
      } else {
        throw new Error('Application ID missing from backend response');
      }
    } catch (err) {
      console.error('Failed to submit application:', err);
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to connect to the prediction API. Ensure the backend instance is awake.';
      setErrorMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">New Loan Application</h1>
        <p className="text-sm text-slate-400">
          Enter applicant financial metrics for real-time XGBoost risk classification & TreeExplainer SHAP breakdown.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Submission failed:</span> {errorMessage}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#0b1120] border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Applicant Full Name</label>
            <input
              type="text"
              name="applicant_name"
              value={formData.applicant_name}
              onChange={handleChange}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Annual Income (₹)</label>
            <input
              type="number"
              name="annual_income"
              value={formData.annual_income}
              onChange={handleChange}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Credit Score (300 - 850)</label>
            <input
              type="number"
              name="credit_score"
              min="300"
              max="850"
              value={formData.credit_score}
              onChange={handleChange}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Requested Loan Amount (₹)</label>
            <input
              type="number"
              name="loan_amount"
              value={formData.loan_amount}
              onChange={handleChange}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Loan Term (Months)</label>
            <select
              name="loan_term_months"
              value={formData.loan_term_months}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="12">12 Months (1 Year)</option>
              <option value="24">24 Months (2 Years)</option>
              <option value="36">36 Months (3 Years)</option>
              <option value="60">60 Months (5 Years)</option>
              <option value="120">120 Months (10 Years)</option>
              <option value="240">240 Months (20 Years)</option>
              <option value="360">360 Months (30 Years)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Employment Length (Years)</label>
            <input
              type="number"
              name="emp_length_years"
              value={formData.emp_length_years}
              onChange={handleChange}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Debt-to-Income Ratio (%)</label>
            <input
              type="number"
              name="dti_ratio"
              min="0"
              max="100"
              value={formData.dti_ratio}
              onChange={handleChange}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Past Delinquencies</label>
            <input
              type="number"
              name="delinquencies"
              min="0"
              value={formData.delinquencies}
              onChange={handleChange}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Home Ownership</label>
            <select
              name="home_ownership"
              value={formData.home_ownership}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="0">Rent</option>
              <option value="1">Mortgage</option>
              <option value="2">Own</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Loan Purpose</label>
            <select
              name="loan_purpose"
              value={formData.loan_purpose}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="0">Debt Consolidation</option>
              <option value="1">Home Improvement</option>
              <option value="2">Education</option>
              <option value="3">Business Expansion</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-all shadow-md shadow-emerald-950 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-slate-950" />}
            <span>{loading ? 'Evaluating Model Inferences...' : 'Evaluate & Predict'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewApplication;
