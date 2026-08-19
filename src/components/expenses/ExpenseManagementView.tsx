import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, PaymentMethod } from '../../types';
import { 
  WalletCards, 
  PlusCircle, 
  Search, 
  Filter, 
  Calendar, 
  Fuel, 
  Zap, 
  Wrench, 
  Layers, 
  Users, 
  Truck
} from 'lucide-react';

export const ExpenseManagementView: React.FC = () => {
  const { expenses, addExpense, metrics, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [category, setCategory] = useState<Expense['category']>('Fuel');
  const [amount, setAmount] = useState<number>(0);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser.name);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  const expenseCategories: Expense['category'][] = [
    'Fuel',
    'Electricity',
    'Salary',
    'Vehicle Maintenance',
    'Bottle Purchase',
    'Packaging & Caps',
    'Raw Material / Filter',
    'Rent',
    'Marketing',
    'Repair & Maintenance',
    'Other'
  ];

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.paidBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenseAll = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description) {
      alert('Please enter valid amount and description.');
      return;
    }

    addExpense({
      category,
      amount,
      date: expDate,
      description,
      paidBy,
      paymentMethod
    });

    setShowModal(false);
    setAmount(0);
    setDescription('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <WalletCards className="w-6 h-6 text-cyan-400" />
              Business Expense Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              PRD Section 32
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track daily diesel, electricity, filter replacements, bottle purchases and staff salaries
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Expense Entry</span>
        </button>
      </div>

      {/* Expense Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-rose-500">
          <span className="text-xs text-slate-400 block">Today's Expenses</span>
          <div className="text-2xl font-black text-rose-400 mt-1">
            ₹{metrics.todayExpenses.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-rose-400/90 mt-1">Operations & logistics cost today</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500">
          <span className="text-xs text-slate-400 block">Total Lifetime Expenses</span>
          <div className="text-2xl font-black text-white mt-1">
            ₹{totalExpenseAll.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cumulative operational overhead</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500">
          <span className="text-xs text-slate-400 block">Net Daily Margin</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            ₹{(metrics.todayCollections - metrics.todayExpenses).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-1">Collection minus Today's Expense</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search expense description or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value="All">All Categories</option>
            {expenseCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Paid By</th>
                <th className="px-4 py-3">Payment Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3.5 text-slate-400">
                    {exp.date}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-semibold text-[11px]">
                      {exp.category}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-extrabold text-rose-400 text-sm">₹{exp.amount.toLocaleString('en-IN')}</div>
                  </td>

                  <td className="px-4 py-3.5 font-medium text-slate-200">
                    {exp.description}
                  </td>

                  <td className="px-4 py-3.5 text-slate-300">
                    {exp.paidBy}
                  </td>

                  <td className="px-4 py-3.5 text-cyan-400 font-mono">
                    {exp.paymentMethod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add Business Expense Entry</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description / Bill Notes</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diesel for Zone 1 van MH-20-4412"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Paid By (Person)</label>
                  <input
                    type="text"
                    required
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="UPI">UPI / GPay</option>
                    <option value="Cash">Cash Handover</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                  </select>
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
