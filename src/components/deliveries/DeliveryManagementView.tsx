import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Truck, 
  Search, 
  Filter, 
  UserCheck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Smartphone, 
  RefreshCw,
  PlusCircle,
  Calendar,
  Layers
} from 'lucide-react';
import { DriverMobileDeliveryView } from './DriverMobileDeliveryView';

export const DeliveryManagementView: React.FC = () => {
  const { 
    deliveries, 
    currentUser, 
    users, 
    assignDeliveryEmployee,
    generateDailyDeliveriesFromRecurring,
    recurringSchedules
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [employeeFilter, setEmployeeFilter] = useState<string>('All');
  const [showDriverMobilePreview, setShowDriverMobilePreview] = useState<boolean>(currentUser.role === 'delivery');

  // If currently in delivery role, render the mobile driver interface directly
  if (showDriverMobilePreview || currentUser.role === 'delivery') {
    return (
      <DriverMobileDeliveryView 
        onBackToManagerView={currentUser.role !== 'delivery' ? () => setShowDriverMobilePreview(false) : undefined} 
      />
    );
  }

  const deliveryDrivers = users.filter(u => u.role === 'delivery');

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.customerAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesEmployee = employeeFilter === 'All' || d.assignedEmployeeId === employeeFilter;
    return matchesSearch && matchesStatus && matchesEmployee;
  });

  const totalCount = deliveries.length;
  const completedCount = deliveries.filter(d => d.status === 'Delivered').length;
  const inTransitCount = deliveries.filter(d => d.status === 'In Transit').length;
  const pendingCount = deliveries.filter(d => d.status === 'Pending').length;
  const failedCount = deliveries.filter(d => d.status === 'Failed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Mobile Driver Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck className="w-6 h-6 text-cyan-400" />
              Delivery Operations & Dispatch Console
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            PRD Section 19: Assign routes, monitor field deliveries and manage drivers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const count = generateDailyDeliveriesFromRecurring();
              alert(count > 0 ? `Generated ${count} recurring deliveries!` : 'All recurring orders for today are already active.');
            }}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-600 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Deliveries ({recurringSchedules.length} Schedules)</span>
          </button>

          <button
            onClick={() => setShowDriverMobilePreview(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition"
          >
            <Smartphone className="w-4 h-4" />
            <span>Test Driver Mobile View</span>
          </button>
        </div>
      </div>

      {/* Delivery Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
          <span className="text-[11px] text-slate-400 block font-medium">Total Deliveries</span>
          <span className="text-lg font-extrabold text-white mt-1 block">{totalCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40">
          <span className="text-[11px] text-emerald-400 block font-medium">Completed</span>
          <span className="text-lg font-extrabold text-emerald-300 mt-1 block">{completedCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40">
          <span className="text-[11px] text-blue-400 block font-medium">In Transit</span>
          <span className="text-lg font-extrabold text-blue-300 mt-1 block">{inTransitCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/40">
          <span className="text-[11px] text-amber-400 block font-medium">Pending Dispatch</span>
          <span className="text-lg font-extrabold text-amber-300 mt-1 block">{pendingCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/40 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-rose-400 block font-medium">Failed / Reschedule</span>
          <span className="text-lg font-extrabold text-rose-300 mt-1 block">{failedCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customer, address, order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Failed">Failed</option>
          </select>

          {/* Employee Filter */}
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value="All">All Drivers</option>
            {deliveryDrivers.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Order & Customer</th>
                <th className="px-4 py-3">Address & Route</th>
                <th className="px-4 py-3">Ordered Jars</th>
                <th className="px-4 py-3">Driver Assignment</th>
                <th className="px-4 py-3">Collection Details</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredDeliveries.map(del => (
                <tr key={del.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white text-sm">{del.customerName}</div>
                    <div className="text-[11px] text-cyan-400 font-medium mt-0.5">{del.orderNumber}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {del.customerMobile}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 max-w-xs">
                    <div className="truncate text-slate-200">{del.customerAddress}</div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Scheduled: {del.deliveryDate}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white text-sm">{del.orderedQuantity} × 20L Jars</div>
                    <div className="text-[11px] text-slate-400">Total: ₹{del.amountToCollect}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <select
                      value={del.assignedEmployeeId}
                      onChange={(e) => assignDeliveryEmployee(del.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-cyan-300 font-medium outline-none focus:border-cyan-500"
                    >
                      {deliveryDrivers.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3.5">
                    {del.status === 'Delivered' ? (
                      <div>
                        <div className="text-emerald-400 font-bold">₹{del.collectedAmount} ({del.paymentMethod})</div>
                        <div className="text-[11px] text-slate-400">Empties collected: {del.collectedEmptyBottles} jars</div>
                      </div>
                    ) : del.status === 'Failed' ? (
                      <div className="text-rose-400 text-[11px]">
                        Reason: {del.failedReason || 'Unavailable'}
                      </div>
                    ) : (
                      <div className="text-slate-400 text-[11px]">
                        To Collect: ₹{del.amountToCollect}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      del.status === 'Delivered' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' :
                      del.status === 'In Transit' ? 'bg-blue-950/80 text-blue-300 border-blue-700/60' :
                      del.status === 'Failed' ? 'bg-rose-950/80 text-rose-300 border-rose-700/60' :
                      'bg-slate-800 text-slate-300 border-slate-600'
                    }`}>
                      {del.status}
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
