import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Factory, 
  PlusCircle, 
  Search, 
  Calendar, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Boxes,
  Layers
} from 'lucide-react';
import { ProductionRecord } from '../../types';

export const ProductionView: React.FC = () => {
  const { 
    productionRecords, 
    products, 
    currentUser, 
    addProductionRecord, 
    metrics 
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [batchNum, setBatchNum] = useState(`BAT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-01`);
  const [prodDate, setProdDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'Morning' | 'Afternoon' | 'Night'>('Morning');
  const [productId, setProductId] = useState('prod_20l_jar');
  const [qtyProduced, setQtyProduced] = useState(500);
  const [damagedQty, setDamagedQty] = useState(6);
  const [sourceTDS, setSourceTDS] = useState(680);
  const [purifiedTDS, setPurifiedTDS] = useState(85);
  const [operator, setOperator] = useState(currentUser.name);
  const [notes, setNotes] = useState('All sand filters, carbon beds, RO membranes & UV sterilization running within optimal limits.');

  const netQty = Math.max(0, qtyProduced - damagedQty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === productId) || products[0];

    addProductionRecord({
      batchNumber: batchNum,
      date: prodDate,
      shift,
      productId: prod.id,
      productName: prod.name,
      quantityProduced: qtyProduced,
      damagedQuantity: damagedQty,
      waterSourceTDS: sourceTDS,
      purifiedTDS,
      operator,
      notes
    });

    setShowModal(false);
  };

  const totalProducedAllTime = productionRecords.reduce((sum, p) => sum + p.netQuantity, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Factory className="w-6 h-6 text-cyan-400" />
              Water Plant Production & RO Batch Console
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              PRD Section 26
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Log daily bottling runs, track rejection / damaged jars and automatically sync finished stock
          </p>
        </div>

        <button
          onClick={() => {
            setBatchNum(`BAT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(productionRecords.length + 1).padStart(2,'0')}`);
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Bottling Batch</span>
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/40">
          <span className="text-[11px] text-cyan-300 block">Today Net Produced</span>
          <span className="text-xl font-extrabold text-white mt-1 block">{metrics.todayProducedJars} Jars</span>
          <span className="text-[10px] text-cyan-400">Ready for dispatch</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
          <span className="text-[11px] text-slate-400 block">Current Plant Filled Stock</span>
          <span className="text-xl font-extrabold text-teal-300 mt-1 block">{metrics.totalFilledStock} Jars</span>
          <span className="text-[10px] text-slate-400">20L Jars Inventory</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
          <span className="text-[11px] text-slate-400 block">Water Quality (Avg TDS)</span>
          <span className="text-xl font-extrabold text-emerald-400 mt-1 block">85 ppm</span>
          <span className="text-[10px] text-emerald-400/90">BIS 14543 Compliant</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
          <span className="text-[11px] text-slate-400 block">Total Batches Logged</span>
          <span className="text-xl font-extrabold text-white mt-1 block">{productionRecords.length} Runs</span>
          <span className="text-[10px] text-slate-400">Lifetime records</span>
        </div>
      </div>

      {/* Production Records Table */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-bold text-sm text-white">Bottling Run History & Quality Logs</h2>
          <span className="text-xs text-slate-400">{productionRecords.length} Total Batches</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Batch & Date</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Produced</th>
                <th className="px-4 py-3">Damaged</th>
                <th className="px-4 py-3">Net Stock Added</th>
                <th className="px-4 py-3">Water Quality (TDS)</th>
                <th className="px-4 py-3">Operator & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {productionRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white text-sm">{rec.batchNumber}</div>
                    <div className="text-[10px] text-slate-400">{rec.date}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-700 text-cyan-300">
                      {rec.shift} Shift
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-medium text-slate-200">
                    {rec.productName}
                  </td>

                  <td className="px-4 py-3.5 font-semibold text-slate-200">
                    {rec.quantityProduced} Jars
                  </td>

                  <td className="px-4 py-3.5 font-semibold text-rose-400">
                    {rec.damagedQuantity} Jars
                  </td>

                  <td className="px-4 py-3.5 font-black text-sm text-emerald-400">
                    +{rec.netQuantity} Jars
                  </td>

                  <td className="px-4 py-3.5 font-mono text-[11px]">
                    <span className="text-slate-400">Raw: {rec.waterSourceTDS || 680}</span> → <strong className="text-emerald-400">{rec.purifiedTDS || 85} ppm</strong>
                  </td>

                  <td className="px-4 py-3.5 max-w-xs">
                    <div className="font-medium text-slate-200 text-[11px]">{rec.operator}</div>
                    <div className="text-[10px] text-slate-400 truncate">{rec.notes}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Record Production Bottling Run</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={batchNum}
                    onChange={(e) => setBatchNum(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Production Date</label>
                  <input
                    type="date"
                    required
                    value={prodDate}
                    onChange={(e) => setProdDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Shift</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Morning">Morning Shift</option>
                    <option value="Afternoon">Afternoon Shift</option>
                    <option value="Night">Night Shift</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Product</label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantities & Net calculation */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Gross Bottles Filled</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={qtyProduced}
                      onChange={(e) => setQtyProduced(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Damaged / Rejects</label>
                    <input
                      type="number"
                      min="0"
                      value={damagedQty}
                      onChange={(e) => setDamagedQty(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-rose-400 font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-700/60 text-xs">
                  <span className="text-slate-300 font-semibold">Net Stock Added to Plant:</span>
                  <strong className="text-emerald-400 font-black text-sm">+{netQty} Finished Jars</strong>
                </div>
              </div>

              {/* TDS Monitor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Source Water TDS (ppm)</label>
                  <input
                    type="number"
                    value={sourceTDS}
                    onChange={(e) => setSourceTDS(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Purified TDS (ppm)</label>
                  <input
                    type="number"
                    value={purifiedTDS}
                    onChange={(e) => setPurifiedTDS(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Operator Name</label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Production Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold"
                >
                  Save & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
