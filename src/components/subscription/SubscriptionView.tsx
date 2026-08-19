import React from 'react';
import { useApp } from '../../context/AppContext';
import { SubscriptionPlan } from '../../types';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  Lock, 
  Database, 
  KeyRound, 
  Cloud,
  Zap
} from 'lucide-react';

export const SubscriptionView: React.FC = () => {
  const { currentTenant, upgradePlan, tenants, switchTenant } = useApp();

  const plans: {
    plan: SubscriptionPlan;
    name: string;
    target: string;
    price: string;
    period: string;
    features: string[];
    isCurrent: boolean;
  }[] = [
    {
      plan: 'Starter',
      name: 'Starter Plan',
      target: 'Small water plant (1–5 Staff)',
      price: '₹1,499',
      period: '/month',
      features: [
        'Up to 300 Customers',
        'Daily Order & Delivery Management',
        'Bottle Ledger & Holding Counts',
        'Basic Finished Stock Inventory',
        'Standard Daily Closing & Reports',
        'Single Delivery Vehicle Route'
      ],
      isCurrent: currentTenant.plan === 'Starter'
    },
    {
      plan: 'Growth',
      name: 'Growth Plan (Most Popular)',
      target: 'Growing water supplier (5–25 Staff)',
      price: '₹3,499',
      period: '/month',
      features: [
        'Unlimited Customers & Orders',
        'Recurring Delivery Auto-Scheduler',
        'Driver Mobile Field Delivery App',
        'Offline Delivery Sync Queue',
        'Production RO Batches & TDS Logs',
        'Expense Tracking & Daily Day-Lock',
        'Tax Invoices & WhatsApp Sharing',
        'Up to 5 Delivery Routes / Drivers'
      ],
      isCurrent: currentTenant.plan === 'Growth'
    },
    {
      plan: 'Business',
      name: 'Business Plan',
      target: 'Large bottling plant (25+ Staff)',
      price: '₹7,999',
      period: '/month',
      features: [
        'Everything in Growth Plan',
        'Multiple Delivery Teams & Zones',
        'Advanced BI Analytics & Export',
        'Role-Based Granular Permissions',
        'Full Audit Trail & Day Closing Logs',
        'Priority 24/7 Phone & WhatsApp Support'
      ],
      isCurrent: currentTenant.plan === 'Business'
    },
    {
      plan: 'Enterprise',
      name: 'Enterprise',
      target: 'Multiple branches & distributor hubs',
      price: 'Custom',
      period: '',
      features: [
        'Multi-Branch Plant Management',
        'Dedicated Cloud Firestore Instance',
        'Custom ERP & Tally Integration',
        'Custom SLA & Dedicated Account Manager'
      ],
      isCurrent: currentTenant.plan === 'Enterprise'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-5 rounded-2xl border border-indigo-800/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              SaaS Subscription, Trial & Architecture
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700">
              PRD Section 40–47
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Subscription tiers, 14-day free trial engine, multi-tenant isolation, and Firestore schema
          </p>
        </div>

        {/* Trial / Active Status Badge */}
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs flex items-center gap-3">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Current Subscription</div>
            <div className="font-extrabold text-white text-sm flex items-center gap-1.5 mt-0.5">
              <span>{currentTenant.name}</span>
              <span className="text-cyan-400">({currentTenant.plan})</span>
            </div>
            {currentTenant.trialDaysLeft > 0 ? (
              <span className="text-amber-300 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" /> {currentTenant.trialDaysLeft} Days Remaining in Free Trial
              </span>
            ) : (
              <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" /> Active Subscription
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Tenant Switcher (PRD Section 42) */}
      <div className="glass-card p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              Multi-Tenant Architecture Isolation (PRD Section 42)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every water plant operates strictly inside its isolated <code className="text-cyan-300">tenantId</code> namespace. Plant A data can NEVER be accessed by Plant B.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {tenants.map(t => (
            <div 
              key={t.id}
              className={`p-4 rounded-xl border transition flex items-center justify-between ${
                t.id === currentTenant.id
                  ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
              }`}
            >
              <div>
                <div className="font-bold text-sm">{t.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">tenantId: <code className="text-cyan-400">{t.id}</code></div>
                <div className="text-[11px] text-slate-400 mt-1">{t.city} • {t.businessType}</div>
              </div>

              {t.id === currentTenant.id ? (
                <span className="px-3 py-1 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-xs">
                  Active Tenant
                </span>
              ) : (
                <button
                  onClick={() => switchTenant(t.id)}
                  className="px-3 py-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition"
                >
                  Switch Tenant
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Pricing Plans (PRD Section 44) */}
      <div>
        <h2 className="font-bold text-base text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Subscription Plans & Feature Limits (PRD Section 44 & 47)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(p => (
            <div 
              key={p.plan}
              className={`glass-card p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                p.isCurrent ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-slate-800/90' : 'border-slate-700/70'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-base text-white">{p.name}</h3>
                  {p.isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{p.target}</p>

                <div className="my-4">
                  <span className="text-2xl font-black text-white">{p.price}</span>
                  <span className="text-xs text-slate-400 font-medium">{p.period}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Included Features:</span>
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {p.isCurrent ? (
                  <button 
                    disabled
                    className="w-full py-2 rounded-xl bg-slate-800 text-cyan-300 font-bold text-xs border border-cyan-800/60"
                  >
                    Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => upgradePlan(p.plan)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition"
                  >
                    Switch to {p.plan}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Firebase & Firestore Cloud Architecture Spec (PRD Section 40 & 41) */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm text-white">Firebase Firestore Architecture & Schema (PRD Section 41)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Cloud Firestore + Cloud Functions + FCM</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-slate-300">
            <div className="text-cyan-400 font-bold mb-2">📁 Subcollection Paths:</div>
            <div>tenants/&#123;tenantId&#125;/customers/&#123;customerId&#125;</div>
            <div>tenants/&#123;tenantId&#125;/products/&#123;productId&#125;</div>
            <div>tenants/&#123;tenantId&#125;/orders/&#123;orderId&#125;</div>
            <div>tenants/&#123;tenantId&#125;/recurringOrders/&#123;recurringOrderId&#125;</div>
            <div>tenants/&#123;tenantId&#125;/deliveries/&#123;deliveryId&#125;</div>
            <div>tenants/&#123;tenantId&#125;/bottleLedger/&#123;ledgerId&#125;</div>
            <div>tenants/&#123;tenantId&#125;/stockLedger/&#123;ledgerId&#125;</div>
            <div>tenants/&#123;tenantId&#125;/production/&#123;productionId&#125;</div>
            <div>tenants/&#123;tenantId&#125;/payments/&#123;paymentId&#125;</div>
            <div>tenants/&#123;tenantId&#125;/invoices/&#123;invoiceId&#125;</div>
            <div>tenants/&#123;tenantId&#125;/dailyClosings/&#123;closingId&#125;</div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-slate-300">
            <div className="text-emerald-400 font-bold">🔒 Multi-Tenant Firestore Security Rules:</div>
            <p className="text-[11px] font-sans text-slate-400">
              Enforced at the database security rules level to guarantee complete isolation.
            </p>
            <pre className="text-[11px] text-slate-400 overflow-x-auto leading-relaxed">
{`match /tenants/{tenantId}/{collection}/{docId} {
  allow read: if request.auth != null && 
    request.auth.token.tenantId == tenantId;
  allow write: if request.auth != null && 
    request.auth.token.tenantId == tenantId && 
    request.auth.token.role in ['owner', 'manager'];
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
