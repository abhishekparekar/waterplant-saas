import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Boxes, 
  PlusCircle, 
  Search, 
  Filter, 
  Layers, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Package,
  Sparkles
} from 'lucide-react';
import { StockLedger } from '../../types';

export const StockManagementView: React.FC = () => {
  const { 
    products, 
    stockLedger, 
    recordStockAdjustment, 
    metrics 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Adjustment state
  const [adjustProductId, setAdjustProductId] = useState('prod_20l_jar');
  const [adjustQtyChange, setAdjustQtyChange] = useState<number>(0);
  const [adjustCategory, setAdjustCategory] = useState<StockLedger['category']>('Filled Bottles');
  const [adjustReason, setAdjustReason] = useState('Physical stock audit reconciliation');

  const filteredLedger = stockLedger.filter(entry => {
    const matchesSearch = entry.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.transactionType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || entry.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustQtyChange === 0) {
      alert('Please enter a non-zero quantity change.');
      return;
    }

    recordStockAdjustment(
      adjustProductId,
      adjustQtyChange,
      adjustCategory,
      adjustReason
    );

    setShowAdjustModal(false);
    setAdjustQtyChange(0);
    setAdjustReason('Physical stock audit reconciliation');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Boxes className="w-6 h-6 text-cyan-400" />
              Stock Management & Transaction Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              PRD Section 27 & 28
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transaction-based accounting: Opening + Production - Dispatch + Returns - Damaged = Closing
          </p>
        </div>

        <button
          onClick={() => setShowAdjustModal(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Stock Adjustment Transaction</span>
        </button>
      </div>

      {/* Stock Category Overview Cards (PRD Section 27) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Finished Goods */}
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-cyan-500 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Finished Goods (Filled)</span>
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalFilledStock} Units</div>
          <p className="text-[11px] text-cyan-400/90">20L Jars, 10L, 1L & 500ml Boxes</p>
        </div>

        {/* Empty Jars */}
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-blue-500 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Empty Jar Stock</span>
            <RotateCcw className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{metrics.totalEmptyStock} Jars</div>
          <p className="text-[11px] text-blue-400/90">At plant awaiting refill</p>
        </div>

        {/* Raw Material: Caps & Sleeves */}
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-indigo-500 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Jar Seal Caps</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300">14,200 Caps</div>
          <p className="text-[11px] text-indigo-400/90">Tamper-proof blue seals</p>
        </div>

        {/* Raw Material: Labels */}
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-teal-500 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Branded Labels</span>
            <Package className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-300">22,500 Rolls</div>
          <p className="text-[11px] text-teal-400/90">HydroSaaS Plant Rolls</p>
        </div>
      </div>

      {/* Products Stock Inventory Grid */}
      <div className="glass-card p-5 rounded-2xl space-y-3">
        <h2 className="font-bold text-sm text-white">Product Stock Live Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map(prod => (
            <div key={prod.id} className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white text-sm">{prod.name}</div>
                <div className="text-[10px] text-cyan-400 mt-0.5">SKU: {prod.sku} • Rate: ₹{prod.sellingPrice}</div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-base text-emerald-400 block">{prod.stockCount}</span>
                <span className="text-[10px] text-slate-400">{prod.unit}s in stock</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Ledger Filter & Table */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 overflow-hidden shadow-xl space-y-4 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="font-bold text-sm text-white">Audit Transaction Ledger (Rule 28)</h2>
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Filled Bottles">Filled Bottles</option>
              <option value="Empty Jars">Empty Jars</option>
              <option value="Raw Material Caps">Raw Material Caps</option>
              <option value="Raw Material Labels">Raw Material Labels</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Product / Material</th>
                <th className="px-4 py-3">Transaction Type</th>
                <th className="px-4 py-3">Delta Change</th>
                <th className="px-4 py-3">Prev → New Stock</th>
                <th className="px-4 py-3">Reason / Ref</th>
                <th className="px-4 py-3">Operator</th>
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
                    <span className="font-semibold text-white">{entry.productName}</span>
                    <div className="text-[10px] text-slate-400">{entry.category}</div>
                  </td>

                  <td className="px-4 py-3.5 font-medium text-cyan-300">
                    {entry.transactionType}
                  </td>

                  <td className="px-4 py-3.5 font-extrabold text-sm">
                    {entry.quantityChange > 0 ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" /> +{entry.quantityChange}
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <ArrowDownLeft className="w-3.5 h-3.5" /> {entry.quantityChange}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-slate-300">
                    {entry.previousStock} → <strong className="text-white font-bold">{entry.newStock}</strong>
                  </td>

                  <td className="px-4 py-3.5 text-slate-300 text-[11px] max-w-xs truncate">
                    {entry.reason}
                  </td>

                  <td className="px-4 py-3.5 text-slate-400">
                    {entry.operator}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Stock Adjustment Transaction</h3>
              <button onClick={() => setShowAdjustModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Product</label>
                <select
                  value={adjustProductId}
                  onChange={(e) => setAdjustProductId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Current: {p.stockCount})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={adjustCategory}
                  onChange={(e) => setAdjustCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="Filled Bottles">Filled Bottles</option>
                  <option value="Empty Jars">Empty Jars</option>
                  <option value="Raw Material Caps">Raw Material Caps</option>
                  <option value="Raw Material Labels">Raw Material Labels</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Quantity Change (+ to add, - to deduct)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. +50 or -10"
                  value={adjustQtyChange || ''}
                  onChange={(e) => setAdjustQtyChange(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Audit Reason (Rule 4: Mandatory reason for adjustments)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physical count reconciliation"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
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
                  Confirm & Post Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
