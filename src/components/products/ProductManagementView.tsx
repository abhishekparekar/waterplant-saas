import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { 
  Package, 
  PlusCircle, 
  Search, 
  IndianRupee, 
  Boxes, 
  CheckCircle2, 
  Tag, 
  ShieldAlert 
} from 'lucide-react';

export const ProductManagementView: React.FC = () => {
  const { products, addProduct, updateProduct } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<Product['category']>('20L Jar');
  const [unit, setUnit] = useState('Jar');
  const [sellingPrice, setSellingPrice] = useState(35);
  const [purchasePrice, setPurchasePrice] = useState(12);
  const [bottleDeposit, setBottleDeposit] = useState(150);
  const [taxRate, setTaxRate] = useState(18);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name,
      sku: sku || `APW-${Date.now().toString().slice(-4)}`,
      category,
      unit,
      sellingPrice,
      purchasePrice,
      bottleDeposit,
      taxRate,
      active: true,
      stockCount: 0,
      emptyBottleCount: 0
    });

    setShowModal(false);
    setName('');
    setSku('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-cyan-400" />
              Product Catalog & Pricing Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              PRD Section 15
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure 20L jars, 10L jars, bottled water cartons, and bottle deposit values
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(prod => (
          <div key={prod.id} className="glass-card p-5 rounded-2xl border border-slate-700/70 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white">{prod.name}</h3>
                  <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">{prod.sku}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                  {prod.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Selling Price</span>
                  <strong className="text-sm font-black text-emerald-400">₹{prod.sellingPrice} / {prod.unit}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Bottle Deposit</span>
                  <strong className="text-sm font-black text-amber-400">₹{prod.bottleDeposit}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>GST Tax Rate: <strong>{prod.taxRate}%</strong></span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active in Catalog
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add Product to Catalog</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20L Packaged Drinking Water Jar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="20L Jar">20L Jar</option>
                    <option value="10L Jar">10L Jar</option>
                    <option value="Bottled Water">Bottled Water Cartons</option>
                    <option value="Dispenser">Dispenser & Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bottle Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={bottleDeposit}
                    onChange={(e) => setBottleDeposit(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none"
                  />
                </div>
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
