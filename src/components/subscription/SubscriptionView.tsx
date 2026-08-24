import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubscriptionPlan, SubscriptionDuration, PaymentMethod, SubscriptionRecord } from '../../types';
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
  Zap,
  CreditCard,
  QrCode,
  Download,
  Clock,
  ArrowRight,
  X,
  Check,
  Flame,
  Shield,
  HelpCircle,
  Smartphone
} from 'lucide-react';

export const SubscriptionView: React.FC = () => {
  const { currentTenant, renewSubscription, subscriptionHistory, tenants, switchTenant } = useApp();

  // Selected duration: 1 Month, 6 Months (15% discount), 12 Months (25% discount)
  const [selectedDuration, setSelectedDuration] = useState<SubscriptionDuration>(6);
  const [activeTab, setActiveTab] = useState<'plans' | 'history' | 'architecture'>('plans');

  // Checkout modal states
  const [checkoutPlan, setCheckoutPlan] = useState<{ plan: SubscriptionPlan; name: string; price: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedRecord, setCompletedRecord] = useState<SubscriptionRecord | null>(null);

  // Base monthly rates
  const monthlyRates: Record<SubscriptionPlan, number> = {
    Starter: 1499,
    Growth: 3499,
    Business: 7999,
    Enterprise: 14999
  };

  // Calculate pricing for a plan based on selected duration
  const getPlanPricing = (plan: SubscriptionPlan) => {
    const baseMonthly = monthlyRates[plan];
    const rawTotal = baseMonthly * selectedDuration;
    
    let discountPct = 0;
    if (selectedDuration === 6) discountPct = 0.15;
    if (selectedDuration === 12) discountPct = 0.25;

    const discountAmount = Math.round(rawTotal * discountPct);
    const finalTotal = rawTotal - discountAmount;
    const effectiveMonthly = Math.round(finalTotal / selectedDuration);

    return {
      baseMonthly,
      rawTotal,
      discountAmount,
      finalTotal,
      effectiveMonthly,
      savingsBadge: discountPct > 0 ? `Save ₹${discountAmount.toLocaleString('en-IN')}` : null
    };
  };

  const plansConfig: {
    plan: SubscriptionPlan;
    name: string;
    target: string;
    popular?: boolean;
    features: string[];
  }[] = [
    {
      plan: 'Starter',
      name: 'Starter Plan',
      target: 'Small water plant / 1 Delivery Vehicle',
      features: [
        'Up to 300 Active Customers',
        'Daily Order & Delivery Route Tracker',
        'Customer Bottle Balance Ledger',
        'Basic Finished Stock Inventory',
        'Standard Daily Closing Reconciliation',
        'Helper Mobile Delivery Web View'
      ]
    },
    {
      plan: 'Growth',
      name: 'Growth Plan',
      popular: true,
      target: 'Growing Water Plant (2–6 Delivery Vans)',
      features: [
        'Unlimited Customers & Daily Orders',
        'Automated Recurring Subscriptions Engine',
        'Driver Mobile App with Offline Sync',
        'Live Bottle Holding Analytics & Leak Prevention',
        'RO Production Batches & TDS Quality Logs',
        'Automated WhatsApp Invoices & UPI QR',
        'Expense Tracking & Daily Day-Lock',
        'Up to 6 Delivery Routes / Helpers'
      ]
    },
    {
      plan: 'Business',
      name: 'Business Plant',
      target: 'High-Volume Bottling (7–20 Vans)',
      features: [
        'Everything in Growth Plan',
        'Multi-Route Zone Management & Live GPS',
        'Granular Staff Permissions (Owner/Helper/Accountant)',
        'Comprehensive Audit Trail & Cash Reconciliation',
        'Raw Materials (Caps, Labels, Preforms) Inventory',
        'Export to Excel / Tally Accounting Format',
        'Dedicated Phone & WhatsApp Priority Support'
      ]
    },
    {
      plan: 'Enterprise',
      name: 'Enterprise Hub',
      target: 'Multi-Branch Plants & Franchise Chains',
      features: [
        'Multi-Branch Plant Data Federation',
        'Dedicated Firebase Firestore Instance',
        'Custom IoT Flow Meter & Sensor Integration',
        'Custom SLA, Onboarding & Staff Training',
        'Custom Payment Gateway & Custom Domain'
      ]
    }
  ];

  const handleOpenCheckout = (plan: SubscriptionPlan, name: string) => {
    const pricing = getPlanPricing(plan);
    setCheckoutPlan({
      plan,
      name,
      price: pricing.finalTotal
    });
    setCompletedRecord(null);
    setPaymentReference(`UPI-APW-${Date.now().toString().slice(-6)}`);
  };

  const handleConfirmPayment = () => {
    if (!checkoutPlan) return;
    setIsProcessing(true);

    setTimeout(() => {
      const res = renewSubscription(
        checkoutPlan.plan,
        selectedDuration,
        paymentMethod,
        paymentReference
      );
      setIsProcessing(false);
      if (res.success) {
        setCompletedRecord(res.record);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-6 rounded-3xl border border-indigo-800/40 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-indigo-400" />
              SaaS Subscription & Billing Engine
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-900/80 text-indigo-300 border border-indigo-700">
              1, 6 & 12 Month Plans
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Manage your Water Plant SaaS subscription tier, unlock multi-driver route tracking, eliminate empty jar losses, and access real-time cloud data backup.
          </p>
        </div>

        {/* Current Active Plan Card */}
        <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700/80 text-xs flex items-center gap-4 shrink-0 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-lg shadow">
            {currentTenant.plan.charAt(0)}
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Current Active Plant</div>
            <div className="font-black text-white text-base flex items-center gap-2 mt-0.5">
              <span>{currentTenant.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                {currentTenant.plan}
              </span>
            </div>
            {currentTenant.trialDaysLeft > 0 ? (
              <span className="text-amber-300 text-xs font-bold flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" /> {currentTenant.trialDaysLeft} Days Remaining in Free Trial
              </span>
            ) : (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Valid Until: {currentTenant.subscriptionExpiryDate || 'Dec 2026'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'plans' 
              ? 'bg-cyan-500 text-slate-950 shadow-md' 
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          Subscription Plans & Pricing
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'history' 
              ? 'bg-cyan-500 text-slate-950 shadow-md' 
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Billing History & Invoices ({subscriptionHistory.length})
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'architecture' 
              ? 'bg-cyan-500 text-slate-950 shadow-md' 
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Cloud className="w-4 h-4" />
          Multi-Tenant Architecture & Security
        </button>
      </div>

      {/* TAB 1: PLANS & PRICING */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Duration Switcher (1 Month, 6 Months, 12 Months) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 w-fit mx-auto shadow-xl">
            <span className="text-xs font-bold text-slate-400 px-3 uppercase tracking-wider">Select Billing Cycle:</span>
            
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {/* 1 Month */}
              <button
                onClick={() => setSelectedDuration(1)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedDuration === 1
                    ? 'bg-slate-800 text-white shadow border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>1 Month</span>
              </button>

              {/* 6 Months (Save 15%) */}
              <button
                onClick={() => setSelectedDuration(6)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 relative ${
                  selectedDuration === 6
                    ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>6 Months</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 ml-1">
                  15% OFF
                </span>
              </button>

              {/* 12 Months (Save 25%) */}
              <button
                onClick={() => setSelectedDuration(12)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 relative ${
                  selectedDuration === 12
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-950" />
                <span>12 Months (Annual)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-950 text-amber-300 ml-1">
                  25% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plansConfig.map((item) => {
              const pricing = getPlanPricing(item.plan);
              const isCurrent = currentTenant.plan === item.plan;

              return (
                <div
                  key={item.plan}
                  className={`glass-card p-6 rounded-3xl border flex flex-col justify-between relative transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl ${
                    item.popular 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-900/95 shadow-indigo-950/50' 
                      : isCurrent 
                        ? 'border-cyan-500 bg-slate-900/90' 
                        : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  {item.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Most Recommended
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-lg text-white">{item.name}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.target}</p>
                      </div>
                      {isCurrent && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Price Calculation Box */}
                    <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-white">
                          ₹{pricing.finalTotal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          / {selectedDuration} Month{selectedDuration > 1 ? 's' : ''}
                        </span>
                      </div>

                      {selectedDuration > 1 && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[11px]">
                          <span className="text-slate-400">₹{pricing.effectiveMonthly}/mo</span>
                          <span className="font-bold text-emerald-400">{pricing.savingsBadge}</span>
                        </div>
                      )}
                    </div>

                    {/* Feature list */}
                    <div className="space-y-2.5 text-xs">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        What's Included:
                      </div>
                      {item.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-slate-300 leading-snug">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Action Button */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenCheckout(item.plan, item.name)}
                      className={`w-full py-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                        item.popular
                          ? 'bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white shadow-cyan-900/30'
                          : isCurrent
                            ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      <span>{isCurrent ? `Renew for ${selectedDuration} Mo` : `Upgrade to ${item.name}`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BILLING HISTORY & INVOICES */}
      {activeTab === 'history' && (
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-base text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                Subscription Payment Receipts & Invoices
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official GST-compliant tax invoices for your water plant business SaaS subscription.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Plan Tier</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Valid Range</th>
                  <th className="p-3.5">Amount Paid</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subscriptionHistory.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-mono font-bold text-cyan-400">{sub.invoiceNumber}</td>
                    <td className="p-3.5 font-bold text-white">{sub.plan}</td>
                    <td className="p-3.5 text-slate-300">{sub.durationMonths} Month(s)</td>
                    <td className="p-3.5 text-slate-400">
                      {sub.startDate} <span className="text-slate-600">→</span> {sub.expiryDate}
                    </td>
                    <td className="p-3.5 font-bold text-white">₹{sub.amountPaid.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px]">
                        {sub.paymentMethod} • {sub.paymentReference}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => alert(`Downloading Invoice ${sub.invoiceNumber} for ₹${sub.amountPaid}`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Download Invoice PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ARCHITECTURE & SECURITY */}
      {activeTab === 'architecture' && (
        <div className="space-y-5">
          {/* Multi-Tenant Switcher */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              Tenant Namespace Switcher (PRD Section 42)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    <div className="text-[11px] text-slate-400 mt-1">{t.city} • Plan: {t.plan}</div>
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
                      Switch
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Firestore Schema & Rules */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-sm text-white">Cloud Firestore Schema & Security Isolation</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">Real-time Multi-Tenant Sync</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                <div className="text-cyan-400 font-bold mb-2">📁 Subcollection Schema:</div>
                <div>tenants/&#123;tenantId&#125;/subscriptions/&#123;subId&#125;</div>
                <div>tenants/&#123;tenantId&#125;/customers/&#123;customerId&#125;</div>
                <div>tenants/&#123;tenantId&#125;/deliveries/&#123;deliveryId&#125;</div>
                <div>tenants/&#123;tenantId&#125;/bottleLedger/&#123;ledgerId&#125;</div>
                <div>tenants/&#123;tenantId&#125;/production/&#123;productionId&#125;</div>
                <div>tenants/&#123;tenantId&#125;/payments/&#123;paymentId&#125;</div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-slate-300">
                <div className="text-emerald-400 font-bold">🔒 Multi-Tenant Firestore Security Rules:</div>
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
      )}

      {/* CHECKOUT MODAL */}
      {checkoutPlan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {completedRecord ? (
              // Success Screen
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Payment Successful!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your {completedRecord.plan} Plan is active for {completedRecord.durationMonths} Month(s).
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoice Number:</span>
                    <span className="font-mono font-bold text-cyan-400">{completedRecord.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Paid:</span>
                    <span className="font-bold text-white">₹{completedRecord.amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valid Until:</span>
                    <span className="font-bold text-emerald-400">{completedRecord.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Reference:</span>
                    <span className="font-mono text-slate-300">{completedRecord.paymentReference}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCheckoutPlan(null);
                    setCompletedRecord(null);
                  }}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition"
                >
                  Done & Return to Dashboard
                </button>
              </div>
            ) : (
              // Payment Form
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-black text-white">Checkout & Activate Plan</h3>
                    <p className="text-xs text-slate-400">{checkoutPlan.name} • {selectedDuration} Month(s)</p>
                  </div>
                  <button
                    onClick={() => setCheckoutPlan(null)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount Summary */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Total Payable Amount:</div>
                    <div className="text-2xl font-black text-white">₹{checkoutPlan.price.toLocaleString('en-IN')}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {selectedDuration} Months Cycle
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">Choose Payment Method:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['UPI', 'Card', 'Bank Transfer'] as PaymentMethod[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                          paymentMethod === method
                            ? 'bg-cyan-950/80 border-cyan-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {method === 'UPI' && <QrCode className="w-5 h-5 text-cyan-400" />}
                        {method === 'Card' && <CreditCard className="w-5 h-5 text-indigo-400" />}
                        {method === 'Bank Transfer' && <Building2 className="w-5 h-5 text-emerald-400" />}
                        <span>{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Reference Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Payment Reference / Transaction ID:</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-cyan-500 focus:outline-hidden"
                    placeholder="e.g. UPI-RAZORPAY-992019"
                  />
                </div>

                {/* Confirm Button */}
                <div className="pt-2">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Verifying with Payment Gateway...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay ₹{checkoutPlan.price.toLocaleString('en-IN')} & Activate Now</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
