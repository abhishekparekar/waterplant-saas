import React, { useState } from 'react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  RotateCcw, 
  IndianRupee, 
  FileText, 
  ShoppingBag, 
  Calendar, 
  Printer, 
  PlusCircle,
  X,
  CreditCard,
  Building
} from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
  onRecordPayment: (cust: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ 
  customer, 
  onClose,
  onRecordPayment
}) => {
  const { 
    orders, 
    payments, 
    bottleLedger, 
    currentTenant, 
    invoices 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'payments' | 'bottles' | 'statement'>('overview');

  const customerOrders = orders.filter(o => o.customerId === customer.id);
  const customerPayments = payments.filter(p => p.customerId === customer.id);
  const customerBottleEntries = bottleLedger.filter(b => b.customerId === customer.id);
  const customerInvoices = invoices.filter(i => i.customerId === customer.id);

  const printStatement = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950/50 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xl font-black">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-white">{customer.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {customer.customerType}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  customer.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {customer.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-cyan-400" /> {customer.mobile}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-rose-400" /> {customer.address}, {customer.city}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRecordPayment(customer)}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow transition"
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (PRD Section 14) */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 text-xs font-semibold overflow-x-auto no-print">
          {[
            { id: 'overview', label: '1. Overview', icon: User },
            { id: 'orders', label: `2. Orders (${customerOrders.length})`, icon: ShoppingBag },
            { id: 'payments', label: `3. Payments (${customerPayments.length})`, icon: IndianRupee },
            { id: 'bottles', label: `4. Bottle Ledger (${customer.bottleBalance} Jars)`, icon: RotateCcw },
            { id: 'statement', label: '5. Account Statement', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition whitespace-nowrap ${
                  isActive ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Financial & Bottle KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Current Outstanding</span>
                  <span className={`text-lg font-extrabold mt-1 block ${customer.outstandingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    ₹{customer.outstandingBalance.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/40">
                  <span className="text-[11px] text-cyan-400 block">Jars with Customer</span>
                  <span className="text-lg font-extrabold text-cyan-300 mt-1 block">
                    {customer.bottleBalance} Jars (20L)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Bottle Deposit Paid</span>
                  <span className="text-lg font-extrabold text-white mt-1 block">
                    ₹{customer.bottleDeposit.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40">
                  <span className="text-[11px] text-emerald-400 block">Lifetime Business</span>
                  <span className="text-lg font-extrabold text-emerald-300 mt-1 block">
                    ₹{customer.totalSalesAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2 text-xs">
                <h3 className="font-bold text-sm text-slate-200">Commercial & Delivery Terms</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Default Rate per 20L</span>
                    <strong className="text-white">₹{customer.defaultPrice} / Jar</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Credit Limit</span>
                    <strong className="text-white">₹{customer.creditLimit}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Payment Schedule</span>
                    <strong className="text-white">{customer.paymentTerms}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Customer Since</span>
                    <strong className="text-white">{customer.createdAt}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">Customer Order History</div>
              {customerOrders.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No orders recorded yet.</p>
              ) : (
                customerOrders.map(ord => (
                  <div key={ord.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{ord.orderNumber} ({ord.orderType})</div>
                      <div className="text-[11px] text-slate-400">Date: {ord.scheduledDate} • {ord.items[0]?.quantity} Jars</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">₹{ord.grandTotal}</div>
                      <span className="text-[10px] text-slate-400">{ord.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">Payment & Receipt Ledger</div>
              {customerPayments.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No payments recorded yet.</p>
              ) : (
                customerPayments.map(pay => (
                  <div key={pay.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-emerald-400">₹{pay.amount} ({pay.paymentMethod})</div>
                      <div className="text-[11px] text-slate-400">Ref: {pay.referenceNumber || 'N/A'} • Collected by: {pay.collectedBy}</div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <div>{pay.paymentDate}</div>
                      <span className="text-emerald-300 font-semibold">{pay.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: BOTTLES */}
          {activeTab === 'bottles' && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">20L Jar Movement Ledger (Customer Specific)</div>
              {customerBottleEntries.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No bottle movements recorded.</p>
              ) : (
                customerBottleEntries.map(entry => (
                  <div key={entry.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{entry.movementType}</div>
                      <div className="text-[11px] text-slate-400">{entry.notes}</div>
                    </div>
                    <div className="text-right font-mono">
                      <span className={`font-bold ${entry.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
                      </span>
                      <div className="text-[10px] text-slate-400">New Balance: {entry.newBalance} Jars</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: PRINTABLE STATEMENT (PRD Section 14) */}
          {activeTab === 'statement' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between no-print">
                <span className="text-xs text-slate-400">Complete Ledger Statement of Account</span>
                <button
                  onClick={printStatement}
                  className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Statement</span>
                </button>
              </div>

              {/* Printable container */}
              <div className="printable-area p-5 bg-white text-slate-900 rounded-2xl space-y-4 text-xs font-sans shadow-lg">
                {/* Statement Header */}
                <div className="flex justify-between border-b pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-cyan-900">{currentTenant.name}</h3>
                    <p className="text-[11px] text-slate-600">{currentTenant.address}, {currentTenant.city}</p>
                    <p className="text-[11px] text-slate-600">Ph: {currentTenant.mobile} • GSTIN: {currentTenant.gstin || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-sm text-slate-800">CUSTOMER STATEMENT</h4>
                    <p className="text-[11px] text-slate-600">Date: {new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between">
                  <div>
                    <strong>Customer:</strong> {customer.name}<br />
                    <span>{customer.address}, {customer.city}</span><br />
                    <span>Phone: {customer.mobile}</span>
                  </div>
                  <div className="text-right">
                    <span><strong>Current Bottle Holding:</strong> {customer.bottleBalance} Jars</span><br />
                    <span className="text-red-700 font-bold"><strong>Current Outstanding Balance:</strong> ₹{customer.outstandingBalance}</span>
                  </div>
                </div>

                {/* Transactions Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100">
                      <th className="p-2">Date</th>
                      <th className="p-2">Details / Ref</th>
                      <th className="p-2 text-right">Debit (Sales ₹)</th>
                      <th className="p-2 text-right">Credit (Paid ₹)</th>
                      <th className="p-2 text-right">Bottle Δ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {customerOrders.map(ord => (
                      <tr key={ord.id}>
                        <td className="p-2">{ord.scheduledDate}</td>
                        <td className="p-2">Invoice / Delivery {ord.orderNumber}</td>
                        <td className="p-2 text-right font-semibold">₹{ord.grandTotal}</td>
                        <td className="p-2 text-right text-emerald-700">₹{ord.paidAmount}</td>
                        <td className="p-2 text-right font-mono">+{ord.items[0]?.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
