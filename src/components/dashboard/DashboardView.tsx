import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  IndianRupee, 
  Truck, 
  RotateCcw, 
  Boxes, 
  Factory, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Users, 
  ShieldAlert, 
  PlusCircle, 
  Sparkles,
  RefreshCw,
  WalletCards,
  Lock
} from 'lucide-react';

interface DashboardViewProps {
  onOpenQuickAction: (action: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenQuickAction }) => {
  const { 
    currentTenant, 
    currentUser, 
    metrics, 
    deliveries, 
    products, 
    customers, 
    recurringSchedules,
    generateDailyDeliveriesFromRecurring,
    setActiveTab,
    isTodayClosed
  } = useApp();

  const totalDelCount = deliveries.length;
  const completedCount = deliveries.filter(d => d.status === 'Delivered').length;
  const inTransitCount = deliveries.filter(d => d.status === 'In Transit').length;
  const pendingCount = deliveries.filter(d => d.status === 'Pending').length;
  const failedCount = deliveries.filter(d => d.status === 'Failed').length;
  const deliveryPct = totalDelCount > 0 ? Math.round((completedCount / totalDelCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Welcome & Quick Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800/80 to-cyan-950/40 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Water Plant Operations Console
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              Live Today
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>{currentTenant.name}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </p>
        </div>

        {/* Action shortcut bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const count = generateDailyDeliveriesFromRecurring();
              alert(count > 0 ? `Auto-generated ${count} deliveries from recurring schedules!` : 'All recurring deliveries for today are already active!');
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Today's Deliveries ({recurringSchedules.filter(r => r.active).length} Active)</span>
          </button>

          <button
            onClick={() => setActiveTab('closing')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition shadow-sm ${
              isTodayClosed 
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' 
                : 'bg-amber-600/20 hover:bg-amber-600/30 border-amber-600/50 text-amber-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isTodayClosed ? 'Day Closed & Locked' : 'Daily Closing'}</span>
          </button>
        </div>
      </div>

      {/* PRD Section 11: Today's Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="glass-card p-4 rounded-2xl glass-card-hover border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Today's Sales</span>
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white mt-2">
            ₹{metrics.todaySales.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-cyan-400/90 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Orders Dispatched</span>
          </div>
        </div>

        {/* Collected Today */}
        <div className="glass-card p-4 rounded-2xl glass-card-hover border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Collected Today</span>
            <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 mt-2">
            ₹{metrics.todayCollections.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-400/90 mt-1 flex items-center gap-1">
            <span>Cash & UPI Collections</span>
          </div>
        </div>

        {/* Customer Outstanding */}
        <div className="glass-card p-4 rounded-2xl glass-card-hover border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Customer Outstanding</span>
            <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400">
              <WalletCards className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-300 mt-2">
            ₹{metrics.totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-amber-400/90 mt-1 flex items-center gap-1">
            <span>Pending Receivables</span>
          </div>
        </div>

        {/* Deliveries Completed */}
        <div className="glass-card p-4 rounded-2xl glass-card-hover border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Deliveries</span>
            <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white mt-2">
            {completedCount} <span className="text-xs font-medium text-slate-400">/ {totalDelCount}</span>
          </div>
          <div className="text-[10px] text-blue-400 mt-1">
            {deliveryPct}% Completed Today
          </div>
        </div>

        {/* Bottles Produced */}
        <div className="glass-card p-4 rounded-2xl glass-card-hover border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Production</span>
            <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white mt-2">
            {metrics.todayProducedJars} <span className="text-xs text-slate-400 font-normal">jars</span>
          </div>
          <div className="text-[10px] text-indigo-400 mt-1">
            Net Output Today
          </div>
        </div>

        {/* Filled Stock */}
        <div className="glass-card p-4 rounded-2xl glass-card-hover border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Filled Stock</span>
            <div className="p-1.5 rounded-lg bg-teal-950 text-teal-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white mt-2">
            {metrics.totalFilledStock} <span className="text-xs text-slate-400 font-normal">jars</span>
          </div>
          <div className="text-[10px] text-teal-400 mt-1">
            Ready in Plant
          </div>
        </div>
      </div>

      {/* PRD Section 12: Alerts & Quick Signals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-amber-200">⚠️ 35 Bottles Overdue for Return</div>
            <p className="text-amber-300/80 mt-0.5">Dnyandeep High School holds 45 jars unreturned for {'>'} 14 days.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-start gap-3">
          <Truck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-cyan-200">🚚 {pendingCount + inTransitCount} Deliveries in Queue</div>
            <p className="text-cyan-300/80 mt-0.5">Zone 1 & Zone 2 delivery drivers are active in the field.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-800/40 flex items-start gap-3">
          <IndianRupee className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-red-200">💰 ₹18,500 Payments Overdue</div>
            <p className="text-red-300/80 mt-0.5">2 corporate customers have exceeded credit periods.</p>
          </div>
        </div>
      </div>

      {/* PRD Section 12: Delivery Flow & Stock Intelligence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Delivery Operational Board */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                Today's Delivery Operations
              </h2>
              <p className="text-xs text-slate-400">Live field dispatch & collection tracking</p>
            </div>
            <button 
              onClick={() => setActiveTab('deliveries')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>View Route Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Delivery Completion Rate</span>
              <span className="text-cyan-400 font-bold">{completedCount} of {totalDelCount} Delivered ({deliveryPct}%)</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div style={{ width: `${deliveryPct}%` }} className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full transition-all duration-500"></div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed: {completedCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> In Transit: {inTransitCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending: {pendingCount}
              </span>
              {failedCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Failed: {failedCount}
                </span>
              )}
            </div>
          </div>

          {/* Active Deliveries List Cards */}
          <div className="space-y-2.5 pt-2">
            {deliveries.slice(0, 4).map(del => (
              <div 
                key={del.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    del.status === 'Delivered' ? 'bg-emerald-950 text-emerald-400' :
                    del.status === 'In Transit' ? 'bg-blue-950 text-blue-400' :
                    del.status === 'Failed' ? 'bg-red-950 text-red-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100">{del.customerName}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{del.customerAddress}</div>
                    <div className="text-[10px] text-cyan-400 mt-0.5">
                      Driver: {del.assignedEmployeeName} • Jars: {del.orderedQuantity} × 20L
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-slate-100">₹{del.amountToCollect}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    del.status === 'Delivered' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' :
                    del.status === 'In Transit' ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50' :
                    del.status === 'Failed' ? 'bg-red-900/60 text-red-300 border border-red-700/50' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {del.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Bottle Intelligence & Stock 360 */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-cyan-400" />
                Bottle Intelligence
              </h2>
              <p className="text-xs text-slate-400">Total Asset Jar Reconciliation</p>
            </div>
            <button 
              onClick={() => setActiveTab('bottles')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottle status stats */}
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-300">Filled Jars at Plant</span>
              <span className="text-sm font-extrabold text-cyan-400">{metrics.totalFilledStock}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-300">Empty Jars at Plant</span>
              <span className="text-sm font-extrabold text-blue-400">{metrics.totalEmptyStock}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-300">Jars with Customers</span>
              <span className="text-sm font-extrabold text-amber-400">{metrics.totalBottlesWithCustomers}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-300">Damaged / Plant Breakage</span>
              <span className="text-sm font-extrabold text-red-400">{metrics.totalDamagedBottles}</span>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">Total Plant Jar Asset Pool</span>
              <span className="text-sm font-black text-cyan-200">
                {metrics.totalFilledStock + metrics.totalEmptyStock + metrics.totalBottlesWithCustomers + metrics.totalDamagedBottles} Jars
              </span>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">Primary Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenQuickAction('customer')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-left flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add Customer</span>
              </button>
              <button
                onClick={() => onOpenQuickAction('order')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-left flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>New Order</span>
              </button>
              <button
                onClick={() => onOpenQuickAction('production')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-left flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Start Production</span>
              </button>
              <button
                onClick={() => onOpenQuickAction('payment')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-left flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Record Payment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
