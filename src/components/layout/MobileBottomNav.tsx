import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Truck, 
  Boxes, 
  Menu, 
  X, 
  Users, 
  Package, 
  RotateCcw, 
  Factory, 
  Receipt, 
  IndianRupee, 
  WalletCards, 
  Lock, 
  BarChart3, 
  UserCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, metrics, currentUser, currentTenant } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { 
      id: 'deliveries', 
      label: 'Deliveries', 
      icon: Truck, 
      badge: metrics.todayPendingDeliveries > 0 ? metrics.todayPendingDeliveries : undefined 
    },
    { id: 'stock', label: 'Stock', icon: Boxes },
  ];

  const moreItems = [
    { id: 'customers', label: 'Customers CRM', icon: Users, desc: 'Manage balances & statement' },
    { id: 'bottles', label: 'Bottle Intelligence', icon: RotateCcw, desc: 'Empty & filled jar tracking' },
    { id: 'production', label: 'Production Logs', icon: Factory, desc: 'RO batches & damaged count' },
    { id: 'products', label: 'Products & Pricing', icon: Package, desc: '20L, 10L, pet bottles' },
    { id: 'invoices', label: 'Invoices & Billing', icon: Receipt, desc: 'Print & share GST invoices' },
    { id: 'payments', label: 'Payments & Collections', icon: IndianRupee, desc: 'UPI, cash, bank settlements' },
    { id: 'expenses', label: 'Business Expenses', icon: WalletCards, desc: 'Diesel, salaries, repairs' },
    { id: 'closing', label: 'Daily Closing Day-Lock', icon: Lock, desc: 'Reconcile sales & cash in hand' },
    { id: 'reports', label: 'Business Analytics', icon: BarChart3, desc: 'Sales, bottles, delivery reports' },
    { id: 'employees', label: 'Employees & Fleet', icon: UserCheck, desc: 'Delivery drivers & performance' },
    { id: 'subscription', label: 'SaaS Plan & Trial', icon: Sparkles, desc: `${currentTenant.plan} Plan` },
  ];

  return (
    <>
      {/* Fixed Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 z-40 flex items-center justify-around">
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowMoreMenu(false); }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl relative transition ${
                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-cyan-400' : 'text-slate-400'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-cyan-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            showMoreMenu ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>

      {/* More Bottom Sheet Drawer */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <h3 className="font-bold text-base text-slate-100">All Modules & Settings</h3>
                <p className="text-xs text-slate-400">PRD v1.0 Operational OS</p>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pb-16">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left border transition ${
                      isActive 
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300' 
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-700/60 text-cyan-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
