import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Droplets, 
  UserCheck, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Bell, 
  PlusCircle, 
  Building2, 
  CheckCircle2, 
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Lock
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenQuickAction: (action: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAction }) => {
  const { 
    currentTenant, 
    currentUser, 
    tenants, 
    switchTenant, 
    switchRole, 
    isMobileSimulator, 
    setIsMobileSimulator,
    isOfflineMode,
    setIsOfflineMode,
    offlineQueueCount,
    syncOfflineData,
    notifications,
    markNotificationRead,
    isTodayClosed
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  const roles: { role: UserRole; label: string; desc: string; icon: string }[] = [
    { role: 'owner', label: 'Owner Mode', desc: 'Full financial & operational access', icon: '👑' },
    { role: 'manager', label: 'Manager Mode', desc: 'Operations, stock & dispatch', icon: '📋' },
    { role: 'delivery', label: 'Delivery Boy (Mobile)', desc: 'Field deliveries & bottle collection', icon: '🚚' },
    { role: 'office', label: 'Office & Sales', desc: 'Orders, invoices & customer CRM', icon: '🏢' }
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand & Plant Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Droplets className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                  HydroSaaS
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  v1.0 PRD
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[170px] sm:max-w-xs font-medium">
                {currentTenant.name}
              </p>
            </div>
          </div>

          {/* Tenant Switcher Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => { setShowTenantMenu(!showTenantMenu); setShowRoleMenu(false); setShowNotifMenu(false); }}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700/80 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium truncate max-w-[130px]">{currentTenant.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showTenantMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Business (Multi-Tenant)
                </div>
                {tenants.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { switchTenant(t.id); setShowTenantMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 transition ${
                      t.id === currentTenant.id ? 'bg-cyan-950/40 text-cyan-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div>{t.name}</div>
                      <div className="text-[10px] text-slate-400">{t.city} • {t.plan} Plan</div>
                    </div>
                    {t.id === currentTenant.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Action Buttons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Button (PRD Section 50) */}
          <div className="relative">
            <button
              onClick={() => { setShowQuickMenu(!showQuickMenu); setShowRoleMenu(false); }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md shadow-cyan-600/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Action</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-200">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                  ⚡ Primary Actions (PRD 50)
                </div>
                <button
                  onClick={() => { onOpenQuickAction('customer'); setShowQuickMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-900/40 hover:text-cyan-300 flex items-center gap-2"
                >
                  <span className="text-cyan-400 font-bold">+</span> Add Customer
                </button>
                <button
                  onClick={() => { onOpenQuickAction('order'); setShowQuickMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-900/40 hover:text-cyan-300 flex items-center gap-2"
                >
                  <span className="text-cyan-400 font-bold">+</span> New Order / Schedule
                </button>
                <button
                  onClick={() => { onOpenQuickAction('production'); setShowQuickMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-900/40 hover:text-cyan-300 flex items-center gap-2"
                >
                  <span className="text-cyan-400 font-bold">+</span> Start Production Batch
                </button>
                <button
                  onClick={() => { onOpenQuickAction('payment'); setShowQuickMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-900/40 hover:text-cyan-300 flex items-center gap-2"
                >
                  <span className="text-cyan-400 font-bold">+</span> Record Payment
                </button>
                <button
                  onClick={() => { onOpenQuickAction('expense'); setShowQuickMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-900/40 hover:text-cyan-300 flex items-center gap-2"
                >
                  <span className="text-cyan-400 font-bold">+</span> Add Expense
                </button>
                <button
                  onClick={() => { onOpenQuickAction('stock'); setShowQuickMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-900/40 hover:text-cyan-300 flex items-center gap-2"
                >
                  <span className="text-cyan-400 font-bold">+</span> Stock / Bottle Adjustment
                </button>
              </div>
            )}
          </div>

          {/* Offline Sync Mode Toggle (PRD Section 39) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (isOfflineMode) {
                  syncOfflineData();
                  setIsOfflineMode(false);
                } else {
                  setIsOfflineMode(true);
                }
              }}
              title={isOfflineMode ? "Offline Mode Active (Click to Sync Online)" : "Connected to Cloud"}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition ${
                isOfflineMode 
                  ? 'bg-amber-950/60 border-amber-600/60 text-amber-300' 
                  : 'bg-emerald-950/40 border-emerald-700/50 text-emerald-400'
              }`}
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 animate-bounce" />
                  <span className="text-[11px] font-medium hidden md:inline">Offline {offlineQueueCount > 0 ? `(${offlineQueueCount})` : ''}</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium hidden md:inline">Online</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Simulator Viewport Toggle */}
          <button
            onClick={() => setIsMobileSimulator(!isMobileSimulator)}
            title={isMobileSimulator ? "Switch to Desktop Workspace" : "Simulate Mobile App Frame"}
            className={`p-1.5 rounded-lg border transition ${
              isMobileSimulator
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isMobileSimulator ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifMenu(!showNotifMenu); setShowRoleMenu(false); setShowQuickMenu(false); }}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white relative transition"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-2">
                  <span className="font-semibold text-xs text-slate-200">Alerts & Notifications</span>
                  <span className="text-[10px] text-cyan-400">{unreadNotifs.length} unread</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2 rounded-lg text-xs cursor-pointer transition ${
                        n.read ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-700/70 text-slate-200 border-l-2 border-cyan-400'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">{n.title}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher (PRD Section 6) */}
          <div className="relative">
            <button
              onClick={() => { setShowRoleMenu(!showRoleMenu); setShowQuickMenu(false); setShowTenantMenu(false); }}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold leading-none">{currentUser.name.split(' ')[0]}</div>
                <div className="text-[10px] text-cyan-400 capitalize">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Test User Roles (PRD Section 6)
                </div>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => { switchRole(r.role); setShowRoleMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-700/60 transition ${
                      currentUser.role === r.role ? 'bg-cyan-950/60 text-cyan-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span className="text-base">{r.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.desc}</div>
                    </div>
                    {currentUser.role === r.role && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}

                {isTodayClosed && (
                  <div className="mx-2 mt-2 p-2 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center gap-1.5 text-[11px] text-red-300">
                    <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Today's Business is Locked via Daily Closing</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
