import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  IndianRupee, 
  PlusCircle, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  CreditCard, 
  WalletCards, 
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import { PaymentMethod } from '../../types';

export const PaymentManagementView: React.FC = () => {
  const { 
    payments, 
    customers, 
    invoices, 
    recordPayment, 
    metrics 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);

  // Payment form state
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [refNumber, setRefNumber] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [collectedBy, setCollectedBy] = useState('Rahul Pawar');
  const [notes, setNotes] = useState('Direct payment received');

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.referenceNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === customerId);
    if (!cust || amount <= 0) {
      alert('Please select a customer and enter a valid positive amount.');
      return;
    }

    recordPayment({
      customerId: cust.id,
      customerName: cust.name,
      amount,
      paymentMethod: method,
      referenceNumber: refNumber || `PAY-${Date.now().toString().slice(-6)}`,
      collectedBy,
      paymentDate: payDate,
      notes
    });

    setShowModal(false);
    setAmount(0);
    setRefNumber('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <IndianRupee className="w-6 h-6 text-cyan-400" />
              Payments & Customer Outstanding Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              PRD Section 29 & 30
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track daily UPI, Cash, and Bank collections and customer outstanding aging
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Customer Payment</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Collected Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            ₹{metrics.todayCollections.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-1">Cash, UPI & Bank Settlement</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Total Customer Outstanding</span>
            <WalletCards className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1">
            ₹{metrics.totalOutstanding.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-amber-400/90 mt-1">Pending unpaid balance across accounts</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-cyan-500">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Total Transactions Logged</span>
            <Receipt className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {payments.length} Receipts
          </div>
          <p className="text-[11px] text-cyan-400 mt-1">100% auditable history</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search payment by customer or UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value="All">All Payment Methods</option>
            <option value="UPI">UPI / QR</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
            <option value="Card">Card</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Receipt / Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount Collected</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Ref / UTR Number</th>
                <th className="px-4 py-3">Collected By</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredPayments.map(pay => (
                <tr key={pay.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white text-sm">{pay.paymentDate}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{pay.id}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-100 text-sm">{pay.customerName}</div>
                    <div className="text-[10px] text-slate-400">{pay.notes}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-black text-emerald-400 text-base">₹{pay.amount.toLocaleString('en-IN')}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-[11px]">
                      {pay.paymentMethod}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-slate-300">
                    {pay.referenceNumber || 'N/A'}
                  </td>

                  <td className="px-4 py-3.5 text-slate-300">
                    {pay.collectedBy}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {pay.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Record Customer Payment Collection</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Customer</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    const c = customers.find(x => x.id === e.target.value);
                    if (c) setAmount(c.outstandingBalance);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Outstanding: ₹{c.outstandingBalance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Amount Collected (₹)</label>
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
                  <label className="block font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash Handover</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                    <option value="Card">Card Swipe</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Collected By</label>
                  <input
                    type="text"
                    required
                    value={collectedBy}
                    onChange={(e) => setCollectedBy(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">UTR / Ref Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-998811 or Cheque #00441"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notes / Description</label>
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold"
                >
                  Confirm & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
