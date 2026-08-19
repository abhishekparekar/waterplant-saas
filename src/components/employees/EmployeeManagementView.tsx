import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types';
import { 
  UserCheck, 
  PlusCircle, 
  Search, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  IndianRupee, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const EmployeeManagementView: React.FC = () => {
  const { users, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => {
    return u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.role.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-cyan-400" />
              Employee Directory & Delivery Fleet Metrics
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              PRD Section 35 & 36
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage plant operators, managers, sales officers and track delivery boy performance
          </p>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="glass-card p-5 rounded-2xl border border-slate-700/70 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-cyan-600/20">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">{user.name}</h3>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-1 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400" /> {user.mobile}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {user.email}
              </p>
              {user.assignedRoute && (
                <p className="text-cyan-300 text-[11px] font-medium pt-1">
                  Route: {user.assignedRoute}
                </p>
              )}
            </div>

            {/* Performance Stats if delivery driver (PRD Section 36) */}
            {user.performance && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Field Metrics</span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-1.5 rounded-lg bg-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Deliveries</span>
                    <strong className="text-emerald-400">{user.performance.completedDeliveries} / {user.performance.totalDeliveries}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Bottles Collected</span>
                    <strong className="text-blue-400">{user.performance.bottlesCollected} Jars</strong>
                  </div>
                  <div className="col-span-2 p-1.5 rounded-lg bg-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Total Cash/UPI Handled</span>
                    <strong className="text-emerald-400">₹{user.performance.totalCollected.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
