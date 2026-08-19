import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  IndianRupee, 
  Truck, 
  RotateCcw, 
  Boxes, 
  Calendar, 
  Download, 
  Printer, 
  Filter,
  PieChart,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { 
    orders, 
    deliveries, 
    payments, 
    expenses, 
    bottleLedger, 
    stockLedger, 
    customers, 
    products, 
    currentTenant, 
    metrics 
  } = useApp();

  const [reportType, setReportType] = useState<'sales' | 'delivery' | 'bottle' | 'outstanding' | 'expense'>('sales');
  const [dateRange, setDateRange] = useState<'today' | 'weekly' | 'monthly'>('monthly');

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              Business Intelligence & Management Reports
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              PRD Section 34
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyze sales performance, bottle cycle efficiency, driver delivery rates and collections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-600 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Sub-Tabs (PRD Section 34) */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-semibold overflow-x-auto no-print">
        {[
          { id: 'sales', label: '1. Sales & Revenue', icon: TrendingUp },
          { id: 'delivery', label: '2. Delivery & Fleet', icon: Truck },
          { id: 'bottle', label: '3. Bottle Cycle & Ledger', icon: RotateCcw },
          { id: 'outstanding', label: '4. Outstanding Receivables', icon: IndianRupee },
          { id: 'expense', label: '5. Expense Breakdown', icon: PieChart },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
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

      {/* Main Report Container */}
      <div className="space-y-4">
        {/* REPORT 1: SALES & REVENUE */}
        {reportType === 'sales' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-4 rounded-2xl border-l-4 border-l-cyan-500">
                <span className="text-xs text-slate-400 block">Total Sales (Aug 2026)</span>
                <div className="text-2xl font-black text-white mt-1">₹1,84,500</div>
                <p className="text-[11px] text-cyan-400 mt-1">5,270 Jars Sold</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500">
                <span className="text-xs text-slate-400 block">Total Collections</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">₹1,62,000</div>
                <p className="text-[11px] text-emerald-400/90 mt-1">87.8% Collection Ratio</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500">
                <span className="text-xs text-slate-400 block">Avg Revenue per Customer</span>
                <div className="text-2xl font-black text-amber-300 mt-1">₹4,200</div>
                <p className="text-[11px] text-amber-400/90 mt-1">44 Active Accounts</p>
              </div>
            </div>

            {/* Product wise Sales Table */}
            <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 p-4 space-y-3">
              <h3 className="font-bold text-sm text-white">Product-wise Sales Performance</h3>
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Units Sold</th>
                    <th className="p-3">Selling Rate</th>
                    <th className="p-3 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {products.map(prod => (
                    <tr key={prod.id}>
                      <td className="p-3 font-semibold text-white">{prod.name}</td>
                      <td className="p-3 text-cyan-300">{prod.category}</td>
                      <td className="p-3 font-mono font-bold">
                        {prod.category === '20L Jar' ? '4,850' : '420'} Units
                      </td>
                      <td className="p-3">₹{prod.sellingPrice}</td>
                      <td className="p-3 text-right font-black text-emerald-400">
                        ₹{prod.category === '20L Jar' ? '1,69,750' : '14,750'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 2: DELIVERY & FLEET */}
        {reportType === 'delivery' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-4 rounded-2xl border-l-4 border-l-blue-500">
                <span className="text-xs text-slate-400 block">Total Deliveries Processed</span>
                <div className="text-2xl font-black text-white mt-1">428</div>
                <p className="text-[11px] text-blue-400 mt-1">98.2% on-time fulfilment</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500">
                <span className="text-xs text-slate-400 block">Completed Deliveries</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">416</div>
                <p className="text-[11px] text-emerald-400/90 mt-1">Zero route delay</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border-l-4 border-l-rose-500">
                <span className="text-xs text-slate-400 block">Failed / Rescheduled</span>
                <div className="text-2xl font-black text-rose-400 mt-1">12</div>
                <p className="text-[11px] text-rose-400 mt-1">Premises closed / blocked</p>
              </div>
            </div>

            {/* Driver Performance Report Table */}
            <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 p-4 space-y-3">
              <h3 className="font-bold text-sm text-white">Delivery Employee Performance (PRD Section 36)</h3>
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
                  <tr>
                    <th className="p-3">Driver Name</th>
                    <th className="p-3">Assigned Route</th>
                    <th className="p-3">Deliveries Completed</th>
                    <th className="p-3">Empties Collected</th>
                    <th className="p-3 text-right">Cash / UPI Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  <tr>
                    <td className="p-3 font-semibold text-white">Rahul Pawar</td>
                    <td className="p-3 text-cyan-300">Zone 1: CIDCO & HUDCO</td>
                    <td className="p-3 font-bold text-emerald-400">40 / 42 (95%)</td>
                    <td className="p-3 font-mono font-bold">125 Jars</td>
                    <td className="p-3 text-right font-black text-emerald-400">₹18,500</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Vikas Shinde</td>
                    <td className="p-3 text-cyan-300">Zone 2: Waluj Industrial</td>
                    <td className="p-3 font-bold text-emerald-400">36 / 38 (94%)</td>
                    <td className="p-3 font-mono font-bold">98 Jars</td>
                    <td className="p-3 text-right font-black text-emerald-400">₹14,200</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 3: BOTTLE RECONCILIATION */}
        {reportType === 'bottle' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/40">
                <span className="text-[11px] text-cyan-300 block">Plant Filled</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{metrics.totalFilledStock}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40">
                <span className="text-[11px] text-blue-300 block">Plant Empty</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{metrics.totalEmptyStock}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/40">
                <span className="text-[11px] text-amber-300 block">With Customers</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{metrics.totalBottlesWithCustomers}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/40">
                <span className="text-[11px] text-rose-300 block">Damaged / Scrap</span>
                <span className="text-xl font-extrabold text-rose-300 mt-1 block">{metrics.totalDamagedBottles}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs">
              <h3 className="font-bold text-sm text-white mb-2">Bottle Turnover & Loss Ratio</h3>
              <p className="text-slate-300">
                Current jar recovery rate is <strong className="text-emerald-400 font-bold">96.8%</strong>. Customer holding cycle averages 4.2 days per rotation.
              </p>
            </div>
          </div>
        )}

        {/* REPORT 4: OUTSTANDING AGING */}
        {reportType === 'outstanding' && (
          <div className="space-y-4">
            <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500">
              <span className="text-xs text-slate-400 block">Total Customer Outstanding</span>
              <div className="text-2xl font-black text-amber-300 mt-1">
                ₹{metrics.totalOutstanding.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-amber-400/90 mt-1">Overdue balance summary across all accounts</p>
            </div>

            <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 p-4 space-y-3">
              <h3 className="font-bold text-sm text-white">Customer Receivables Register</h3>
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
                  <tr>
                    <th className="p-3">Customer Account</th>
                    <th className="p-3">Customer Type</th>
                    <th className="p-3">Credit Limit</th>
                    <th className="p-3">Jars Held</th>
                    <th className="p-3 text-right">Outstanding (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {customers.map(cust => (
                    <tr key={cust.id}>
                      <td className="p-3 font-semibold text-white">{cust.name}</td>
                      <td className="p-3 text-cyan-300">{cust.customerType}</td>
                      <td className="p-3">₹{cust.creditLimit}</td>
                      <td className="p-3 font-bold text-amber-400">{cust.bottleBalance} Jars</td>
                      <td className={`p-3 text-right font-black ${cust.outstandingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        ₹{cust.outstandingBalance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 5: EXPENSE BREAKDOWN */}
        {reportType === 'expense' && (
          <div className="space-y-4">
            <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 p-4 space-y-3">
              <h3 className="font-bold text-sm text-white">Expense Category Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { cat: 'Packaging & Caps', amount: 3400, pct: '42%' },
                  { cat: 'Fuel (Diesel)', amount: 1200, pct: '28%' },
                  { cat: 'Plant Maintenance', amount: 850, pct: '18%' },
                  { cat: 'Electricity (Plant)', amount: 2200, pct: '12%' },
                ].map(item => (
                  <div key={item.cat} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white">{item.cat}</div>
                      <div className="text-[10px] text-slate-400">{item.pct} of total</div>
                    </div>
                    <span className="font-extrabold text-rose-400 text-sm">₹{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
