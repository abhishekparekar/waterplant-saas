import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  IndianRupee, 
  Truck, 
  RotateCcw, 
  Boxes, 
  Factory, 
  ShieldCheck,
  Calendar,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DailyClosingView: React.FC = () => {
  const { 
    dailyClosings, 
    performDailyClosing, 
    isTodayClosed, 
    metrics, 
    currentUser, 
    currentTenant, 
    auditLogs 
  } = useApp();

  const [cashInHand, setCashInHand] = useState<number>(6800);
  const [closingNotes, setClosingNotes] = useState('All delivery vehicles parked, physical cash verified with driver handovers.');
  const [closedSuccessMessage, setClosedSuccessMessage] = useState<string | null>(null);

  const handleCloseDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to close and lock today’s operational business day? Changes after closing will require authorized adjustment logs.')) {
      return;
    }

    const res = performDailyClosing({
      cashInHand,
      auditNotes: closingNotes
    });

    if (res.success) {
      setClosedSuccessMessage(res.message);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-6 h-6 text-cyan-400" />
              Daily Closing & Operational Day-Lock
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              isTodayClosed ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}>
              {isTodayClosed ? '🔒 Day Locked' : '🟢 Day In Progress'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            PRD Section 33: End-of-day financial reconciliation, bottle audit and immutable day closure
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Reconciled for: <strong className="text-white">{todayStr}</strong>
        </div>
      </div>

      {closedSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-sm">Daily Closing Completed & Locked!</div>
            <p className="text-[11px] mt-0.5">{closedSuccessMessage}</p>
          </div>
        </div>
      )}

      {/* Daily Numbers Reconciliation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Financial Reconciliation */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              1. Financial Reconciliation
            </h2>
            <span className="text-[11px] text-cyan-400">Cash Flow Balance</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60">
              <span className="text-slate-300">Total Invoiced Sales Today:</span>
              <strong className="text-white text-sm">₹{metrics.todaySales.toLocaleString('en-IN')}</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60">
              <span className="text-slate-300">Total Money Collected Today:</span>
              <strong className="text-emerald-400 text-sm font-black">₹{metrics.todayCollections.toLocaleString('en-IN')}</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60">
              <span className="text-slate-300">Total Operational Expenses Paid:</span>
              <strong className="text-rose-400 text-sm">₹{metrics.todayExpenses.toLocaleString('en-IN')}</strong>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-sm font-black">
              <span className="text-emerald-300">Net Operating Cash Balance:</span>
              <span className="text-emerald-400">₹{(metrics.todayCollections - metrics.todayExpenses).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right: Operational & Bottle Reconciliation */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              2. Operations & Bottle Reconciliation
            </h2>
            <span className="text-[11px] text-cyan-400">Jar Asset Balance</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60">
              <span className="text-slate-300">Deliveries Completed / Total:</span>
              <strong className="text-white font-bold">{metrics.todayCompletedDeliveries} / {metrics.todayCompletedDeliveries + metrics.todayPendingDeliveries} Deliveries</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60">
              <span className="text-slate-300">Net 20L Jars Produced Today:</span>
              <strong className="text-cyan-300 font-bold">+{metrics.todayProducedJars} Jars</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60">
              <span className="text-slate-300">Empty Bottles Collected Back:</span>
              <strong className="text-blue-300 font-bold">420 Jars</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60">
              <span className="text-slate-300">Damaged / Scrap Jars:</span>
              <strong className="text-rose-400 font-bold">4 Jars</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Lock Form */}
      {!isTodayClosed ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-6 rounded-3xl border border-cyan-800/50 shadow-2xl space-y-4">
          <div>
            <h2 className="font-extrabold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              End-of-Day Lock Confirmation Form
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify physical cash in drawer, review handover balances and confirm lock.
            </p>
          </div>

          <form onSubmit={handleCloseDay} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Physical Cash in Hand / Cash Drawer (₹)
              </label>
              <input
                type="number"
                required
                value={cashInHand}
                onChange={(e) => setCashInHand(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-black text-base outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Closing Audit Notes & Observations
              </label>
              <input
                type="text"
                required
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
              >
                <Lock className="w-5 h-5" />
                <span>Close & Lock Business Day ({todayStr})</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Business Day {todayStr} is Officially Locked</h3>
              <p className="text-slate-400 mt-0.5">Closed by {currentUser.name}. Immutable audit trail active.</p>
            </div>
          </div>
        </div>
      )}

      {/* Historical Closings Log Table */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-bold text-sm text-white">Historical Daily Closings Log (PRD Section 33)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Closing Date</th>
                <th className="px-4 py-3">Closed By</th>
                <th className="px-4 py-3">Sales</th>
                <th className="px-4 py-3">Collections</th>
                <th className="px-4 py-3">Expenses</th>
                <th className="px-4 py-3">Net Cash Flow</th>
                <th className="px-4 py-3">Deliveries</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {dailyClosings.map(c => (
                <tr key={c.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3.5 font-bold text-white">
                    {c.date}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    {c.closedBy}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-white">
                    ₹{c.totalSales.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5 font-black text-emerald-400">
                    ₹{c.totalCollections.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-rose-400">
                    ₹{c.totalExpenses.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5 font-black text-cyan-300">
                    ₹{c.netCashFlow.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    {c.completedDeliveries} / {c.deliveriesCount}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
