import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, CustomerType } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  PlusCircle, 
  Phone, 
  MapPin, 
  RotateCcw, 
  IndianRupee, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Home,
  Hotel,
  GraduationCap
} from 'lucide-react';
import { CustomerDetailModal } from './CustomerDetailModal';

export const CustomerListView: React.FC = () => {
  const { 
    customers, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    products, 
    recordPayment 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    customerType: 'Home' as CustomerType,
    address: '',
    city: 'Chhatrapati Sambhajinagar',
    pincode: '431001',
    defaultProductId: 'prod_20l_jar',
    defaultPrice: 35,
    bottleDeposit: 150,
    creditLimit: 2000,
    paymentTerms: 'Cash / UPI on Delivery',
    status: 'Active' as Customer['status']
  });

  const customerTypes: CustomerType[] = [
    'Home', 'Office', 'Hotel', 'Restaurant', 'School', 'Hospital', 'Shop', 'Event', 'Distributor', 'Other'
  ];

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.mobile.includes(searchQuery) ||
                          c.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || c.customerType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      customerType: 'Home',
      address: '',
      city: 'Chhatrapati Sambhajinagar',
      pincode: '431001',
      defaultProductId: 'prod_20l_jar',
      defaultPrice: 35,
      bottleDeposit: 150,
      creditLimit: 2000,
      paymentTerms: 'Cash / UPI on Delivery',
      status: 'Active'
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      mobile: cust.mobile,
      email: cust.email || '',
      customerType: cust.customerType,
      address: cust.address,
      city: cust.city,
      pincode: cust.pincode,
      defaultProductId: cust.defaultProductId,
      defaultPrice: cust.defaultPrice,
      bottleDeposit: cust.bottleDeposit,
      creditLimit: cust.creditLimit,
      paymentTerms: cust.paymentTerms,
      status: cust.status
    });
    setShowFormModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setShowFormModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              Customer Management & Accounts CRM
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {customers.length} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            PRD Section 13 & 14: Customer balances, bottle deposits, credit terms & statements
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, phone, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value="All">All Customer Types</option>
            {customerTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(cust => (
          <div 
            key={cust.id}
            className="glass-card p-4 rounded-2xl border border-slate-700/70 hover:border-cyan-500/50 transition flex flex-col justify-between space-y-3"
          >
            {/* Top row: Name & Type */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-sm text-white hover:text-cyan-300 transition cursor-pointer" onClick={() => setSelectedCustomer(cust)}>
                    {cust.name}
                  </h3>
                  <p className="text-[11px] text-cyan-400 font-medium flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {cust.mobile}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                  {cust.customerType}
                </span>
              </div>

              {/* Address */}
              <p className="text-[11px] text-slate-400 mt-2 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="truncate">{cust.address}, {cust.city}</span>
              </p>
            </div>

            {/* Balances block */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Bottle Holding</span>
                <strong className="text-xs font-black text-amber-400">{cust.bottleBalance} Jars</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Outstanding</span>
                <strong className={`text-xs font-black ${cust.outstandingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹{cust.outstandingBalance}
                </strong>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400">Rate: ₹{cust.defaultPrice}/jar</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedCustomer(cust)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold border border-cyan-800/60 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> Profile
                </button>
                <button
                  onClick={() => handleOpenEdit(cust)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete customer ${cust.name}?`)) deleteCustomer(cust.id);
                  }}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Detail Profile Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onRecordPayment={(c) => {
            const amount = prompt(`Enter payment collection amount for ${c.name}:`, String(c.outstandingBalance));
            if (amount && Number(amount) > 0) {
              recordPayment({
                customerId: c.id,
                customerName: c.name,
                amount: Number(amount),
                paymentMethod: 'UPI',
                collectedBy: 'Office Admin',
                paymentDate: new Date().toISOString().split('T')[0],
                notes: 'Payment collected via customer profile'
              });
              alert(`Payment of ₹${amount} recorded successfully!`);
            }
          }}
        />
      )}

      {/* Customer Add/Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-5 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {editingCustomer ? 'Edit Customer Account' : 'Add New Customer (PRD Section 13)'}
              </h3>
              <button onClick={() => setShowFormModal(false)}>✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Customer / Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hotel Grand / Abhishek Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98220 12345"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Customer Type</label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  >
                    {customerTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 14, Near City Center"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Rate per 20L (₹)</label>
                  <input
                    type="number"
                    value={formData.defaultPrice}
                    onChange={(e) => setFormData({ ...formData, defaultPrice: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Bottle Deposit (₹)</label>
                  <input
                    type="number"
                    value={formData.bottleDeposit}
                    onChange={(e) => setFormData({ ...formData, bottleDeposit: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payment Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Billing (1st-5th)"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
