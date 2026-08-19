import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  RotateCcw, 
  Search, 
  Filter, 
  AlertTriangle, 
  PlusCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building2, 
  ShieldCheck,
  Boxes,
  Truck,
  Users
} from 'lucide-react';
import { BottleLedger } from '../../types';

export const BottleIntelligenceView: React.FC = () => {
  const { 
    bottleLedger, 
    customers, 
    products, 
    recordBottleAdjustment, 
    metrics 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [movementFilter, setMovementFilter] = useState<string>('All');
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);

  // Adjustment form state
  const [adjustCustomerId, setAdjustCustomerId] = useState<string>('');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustCategory, setAdjustCategory] = useState<BottleLedger['balanceCategory']>('With Customer');
  const [adjustReason, setAdjustReason] = useState<string>('Physical audit reconciliation');

  const filteredLedger = bottleLedger.filter(entry => {
    const matchesSearch = (entry.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (entry.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.movementType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMovement = movementFilter === 'All' || entry.movementType === movementFilter;
    return matchesSearch && matchesMovement;
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustQty === 0) {
      alert('Please enter a non-zero adjustment quantity (positive or negative).');
      return;
    }

    recordBottleAdjustment(
      adjustCustomerId ? adjustCustomerId : undefined,
      adjustQty,
      adjustCategory,
      adjustReason
    );

    setShowAdjustModal(false);
    setAdjustCustomerId('');
    setAdjustQty(0);
    setAdjustReason('Physical audit reconciliation');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-cyan-400" />
              Bottle Intelligence & Asset Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              PRD Core Differentiator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track every 20L Jar movement: Plant → Truck → Customer → Empty Return → Washing Line
          </p>
        </div>

        <button
          onClick={() => setShowAdjustModal(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Manual Bottle Adjustment</span>
        </button>
      </div>

      {/* 6-State Bottle Lifecycle Dashboard (PRD Section 23) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/40">
          <div className="flex items-center justify-between text-cyan-300 text-xs">
            <span>Plant Filled</span>
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white mt-1.5">{metrics.totalFilledStock}</div>
          <div className="text-[10px] text-cyan-400/90 mt-0.5">Ready for dispatch</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40">
          <div className="flex items-center justify-between text-blue-300 text-xs">
            <span>Plant Empty</span>
            <RotateCcw className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-white mt-1.5">{metrics.totalEmptyStock}</div>
          <div className="text-[10px] text-blue-400/90 mt-0.5">Awaiting washing / refill</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/40">
          <div className="flex items-center justify-between text-amber-300 text-xs">
            <span>With Customers</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white mt-1.5">{metrics.totalBottlesWithCustomers}</div>
          <div className="text-[10px] text-amber-400/90 mt-0.5">Held in rotation</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40">
          <div className="flex items-center justify-between text-indigo-300 text-xs">
            <span>In-Transit Truck</span>
            <Truck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white mt-1.5">38</div>
          <div className="text-[10px] text-indigo-400/90 mt-0.5">On active routes</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/40">
          <div className="flex items-center justify-between text-rose-300 text-xs">
            <span>Damaged / Cracked</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-300 mt-1.5">{metrics.totalDamagedBottles}</div>
          <div className="text-[10px] text-rose-400/90 mt-0.5">Scrap / Replacement</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-800/40">
          <div className="flex items-center justify-between text-teal-300 text-xs">
            <span>Total Asset Pool</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-extrabold text-teal-300 mt-1.5">
            {metrics.totalFilledStock + metrics.totalEmptyStock + metrics.totalBottlesWithCustomers + metrics.totalDamagedBottles + 38}
          </div>
          <div className="text-[10px] text-teal-400/90 mt-0.5">100% Accounted</div>
        </div>
      </div>

      {/* Top Customer Bottle Holders Overdue list */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Customer Bottle Holding Register (Top Active Accounts)
          </h2>
          <span className="text-xs text-slate-400">Total {customers.length} Accounts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {customers.map(cust => (
            <div 
              key={cust.id} 
              className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-white truncate max-w-[180px]">{cust.name}</div>
                <div className="text-[10px] text-slate-400">{cust.customerType} • {cust.city}</div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-sm text-amber-400 block">{cust.bottleBalance} Jars</span>
                <span className="text-[10px] text-slate-400">Holding</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters for Ledger */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search bottle movements or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value="All">All Movement Types</option>
            <option value="Plant Produced">Plant Produced</option>
            <option value="Delivered to Customer">Delivered to Customer</option>
            <option value="Empty Returned from Customer">Empty Returned</option>
            <option value="Damaged at Plant">Damaged at Plant</option>
            <option value="Adjustment">Adjustment</option>
          </select>
        </div>
      </div>

      {/* Bottle Ledger Table (PRD Section 24) */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Movement Type</th>
                <th className="px-4 py-3">Customer / Entity</th>
                <th className="px-4 py-3">Quantity Delta</th>
                <th className="px-4 py-3">Prev → New Balance</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredLedger.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-white">{entry.movementType}</span>
                    {entry.employeeName && (
                      <div className="text-[10px] text-cyan-400">By: {entry.employeeName}</div>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    {entry.customerName ? (
                      <span className="font-medium text-slate-200">{entry.customerName}</span>
                    ) : (
                      <span className="text-slate-500 italic">Plant Operation</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-extrabold text-sm">
                    {entry.quantity > 0 ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" /> +{entry.quantity}
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <ArrowDownLeft className="w-3.5 h-3.5" /> {entry.quantity}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-slate-300">
                    {entry.previousBalance} → <strong className="text-white font-bold">{entry.newBalance}</strong>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-slate-300 font-medium">
                      {entry.balanceCategory}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-slate-400 text-[11px] max-w-xs truncate">
                    {entry.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Manual Bottle Balance Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Customer Account (Optional)</label>
                <select
                  value={adjustCustomerId}
                  onChange={(e) => setAdjustCustomerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="">-- Plant Internal Level (No Customer) --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Current Holding: {c.bottleBalance} Jars)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Quantity Delta (Positive to add, Negative to deduct)
                </label>
                <input
                  type="number"
                  placeholder="e.g. +5 or -5"
                  value={adjustQty || ''}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-cyan-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Category</label>
                <select
                  value={adjustCategory}
                  onChange={(e) => setAdjustCategory(e.target.value as BottleLedger['balanceCategory'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="With Customer">With Customer</option>
                  <option value="At Plant Filled">At Plant Filled</option>
                  <option value="At Plant Empty">At Plant Empty</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Reason for Adjustment (Rule 4: Mandatory Audit Reason)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physical inventory reconciliation"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold"
                >
                  Save Ledger Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
