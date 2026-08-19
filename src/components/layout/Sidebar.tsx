import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Truck, 
  ShoppingBag, 
  RotateCcw, 
  Boxes, 
  Factory, 
  Users, 
  Package, 
  Receipt, 
  IndianRupee, 
  WalletCards, 
  Lock, 
  BarChart3, 
  UserCheck, 
  Sparkles,
  CalendarDays,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { UserRole } from '../../types';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    metrics, 
    deliveries, 
    isTodayClosed,
    currentTenant
  } = useApp();

  const role = currentUser.role;

  // Filter accessible tabs based on User Role (PRD Section 6)
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'manager', 'office'] },
    { id: 'deliveries', label: 'Deliveries & Routes', icon: Truck, badge: metrics.todayPendingDeliveries > 0 ? String(metrics.todayPendingDeliveries) : undefined, badgeColor: 'bg-cyan-500', roles: ['owner', 'manager', 'delivery', 'office'] },
    { id: 'orders', label: 'Orders & Recurring', icon: ShoppingBag, roles: ['owner', 'manager', 'office'] },
    { id: 'bottles', label: 'Bottle Intelligence', icon: RotateCcw, roles: ['owner', 'manager', 'office'] },
    { id: 'stock', label: 'Stock & Inventory', icon: Boxes, roles: ['owner', 'manager', 'office'] },
    { id: 'production', label: 'Production Logs', icon: Factory, roles: ['owner', 'manager'] },
    { id: 'customers', label: 'Customers CRM', icon: Users, roles: ['owner', 'manager', 'office'] },
    { id: 'products', label: 'Products & Pricing', icon: Package, roles: ['owner', 'manager', 'office'] },
    { id: 'invoices', label: 'Invoices & Billing', icon: Receipt, roles: ['owner', 'manager', 'office'] },
    { id: 'payments', label: 'Payments & Balance', icon: IndianRupee, roles: ['owner', 'manager', 'office'] },
    { id: 'expenses', label: 'Business Expenses', icon: WalletCards, roles: ['owner', 'manager'] },
    { id: 'closing', label: 'Daily Closing', icon: Lock, badge: isTodayClosed ? 'Locked' : 'Open', badgeColor: isTodayClosed ? 'bg-emerald-600' : 'bg-amber-600', roles: ['owner', 'manager'] },
    { id: 'reports', label: 'Business Reports', icon: BarChart3, roles: ['owner', 'manager'] },
    { id: 'employees', label: 'Employees & Fleet', icon: UserCheck, roles: ['owner', 'manager'] },
    { id: 'subscription', label: 'SaaS Plan & Billing', icon: Sparkles, badge: `${currentTenant.plan}`, badgeColor: 'bg-indigo-600', roles: ['owner'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-[calc(100vh-57px)] sticky top-[57px] select-none">
      {/* Top Nav List */}
      <div className="p-3 space-y-1 overflow-y-auto flex-1">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Operations & Finance
        </div>

        {filteredNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white ${item.badgeColor || 'bg-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom SaaS Status Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-200">{currentTenant.plan} Plan</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              {currentTenant.subscriptionStatus}
            </span>
          </div>
          {currentTenant.trialDaysLeft > 0 ? (
            <p className="text-[11px] text-cyan-300 flex items-center gap-1 font-medium">
              <CalendarDays className="w-3 h-3 text-cyan-400" />
              {currentTenant.trialDaysLeft} days left in free trial
            </p>
          ) : (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3" />
              Active Subscription
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};
