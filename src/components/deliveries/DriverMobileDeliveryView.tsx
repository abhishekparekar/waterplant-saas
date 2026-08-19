import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  IndianRupee, 
  QrCode, 
  FileText, 
  ArrowLeft, 
  Navigation, 
  WifiOff, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Delivery, PaymentMethod } from '../../types';

interface DriverMobileDeliveryViewProps {
  onBackToManagerView?: () => void;
}

export const DriverMobileDeliveryView: React.FC<DriverMobileDeliveryViewProps> = ({ onBackToManagerView }) => {
  const { 
    deliveries, 
    currentUser, 
    startDelivery, 
    completeDelivery, 
    recordFailedDelivery,
    isOfflineMode,
    currentTenant,
    customers
  } = useApp();

  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [showFailedModal, setShowFailedModal] = useState<boolean>(false);

  // Form states for completion
  const [deliveredQty, setDeliveredQty] = useState<number>(0);
  const [collectedBottles, setCollectedBottles] = useState<number>(0);
  const [collectedAmount, setCollectedAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [failedReason, setFailedReason] = useState<string>('Customer unavailable');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter deliveries assigned to current driver or show all if owner/manager testing
  const driverDeliveries = currentUser.role === 'delivery'
    ? deliveries.filter(d => d.assignedEmployeeId === currentUser.id || d.assignedEmployeeName.includes(currentUser.name.split(' ')[0]))
    : deliveries;

  const pendingDeliveries = driverDeliveries.filter(d => d.status === 'Pending' || d.status === 'In Transit');
  const completedDeliveries = driverDeliveries.filter(d => d.status === 'Delivered' || d.status === 'Partially Delivered' || d.status === 'Failed');

  const openCompletionModal = (del: Delivery) => {
    setActiveDelivery(del);
    setDeliveredQty(del.orderedQuantity);
    setCollectedBottles(del.expectedEmptyBottles || del.orderedQuantity);
    setCollectedAmount(del.amountToCollect);
    setPaymentMethod('Cash');
    setPaymentRef('');
    setDeliveryNotes('');
    setShowCompleteModal(true);
    setStatusMessage(null);
  };

  const handleStart = (delId: string) => {
    startDelivery(delId);
  };

  const handleSubmitComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery) return;

    const res = completeDelivery(
      activeDelivery.id,
      deliveredQty,
      collectedBottles,
      collectedAmount,
      paymentMethod,
      paymentRef,
      deliveryNotes
    );

    if (res.success) {
      setShowCompleteModal(false);
      setActiveDelivery(null);
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleSubmitFailed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery) return;

    recordFailedDelivery(activeDelivery.id, failedReason);
    setShowFailedModal(false);
    setActiveDelivery(null);
    setStatusMessage({ type: 'success', text: `Delivery marked as failed: ${failedReason}` });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-4 rounded-2xl border border-cyan-700/50 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Driver Delivery App (PRD Section 20)
              </div>
              <h2 className="font-extrabold text-base">{currentUser.name}</h2>
            </div>
          </div>

          {onBackToManagerView && (
            <button 
              onClick={onBackToManagerView}
              className="text-xs bg-black/40 hover:bg-black/60 px-2.5 py-1.5 rounded-lg border border-white/10"
            >
              Manager View
            </button>
          )}
        </div>

        {/* Route details & offline status */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-cyan-800/60 text-xs">
          <span className="text-cyan-200">
            Route: <strong className="text-white">{currentUser.assignedRoute || 'Zone 1: CIDCO Sector'}</strong>
          </span>
          {isOfflineMode ? (
            <span className="flex items-center gap-1 text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/50 text-[10px]">
              <WifiOff className="w-3 h-3" /> Offline Queue
            </span>
          ) : (
            <span className="text-emerald-300 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-600/50">
              ● Connected
            </span>
          )}
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
          statusMessage.type === 'success' ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-700' : 'bg-red-950/80 text-red-200 border border-red-700'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs / Deliveries Counts */}
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
        <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
          <span className="text-slate-300">Pending Deliveries</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/50">
            {pendingDeliveries.length}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
          <span className="text-slate-300">Completed Today</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/50">
            {completedDeliveries.length}
          </span>
        </div>
      </div>

      {/* Pending Deliveries List */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
          Today's Delivery Queue ({pendingDeliveries.length})
        </div>

        {pendingDeliveries.length === 0 ? (
          <div className="text-center p-8 rounded-2xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-200">All deliveries completed for today!</p>
            <p className="text-[11px] mt-1">Great job! All customer orders have been dispatched & recorded.</p>
          </div>
        ) : (
          pendingDeliveries.map((del, idx) => {
            const cust = customers.find(c => c.id === del.customerId);
            const isInTransit = del.status === 'In Transit';

            return (
              <div 
                key={del.id}
                className={`p-4 rounded-2xl border transition shadow-md ${
                  isInTransit 
                    ? 'bg-slate-800/90 border-cyan-500/80 shadow-cyan-500/10' 
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                {/* Header: Stop # & Customer */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/40">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-white">{del.customerName}</h3>
                      <p className="text-[11px] text-cyan-400 font-medium">Order: {del.orderNumber}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isInTransit ? 'bg-blue-900/80 text-blue-300 border border-blue-700' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {del.status}
                  </span>
                </div>

                {/* Address & Navigation */}
                <div className="mt-2.5 text-xs text-slate-300 flex items-start gap-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p>{del.customerAddress}</p>
                    <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-slate-800 text-[11px]">
                      <a 
                        href={`tel:${del.customerMobile}`} 
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Phone className="w-3 h-3" /> Call: {del.customerMobile}
                      </a>
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(del.customerAddress)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Navigation className="w-3 h-3" /> Navigate Map
                      </a>
                    </div>
                  </div>
                </div>

                {/* Product & Bottle Info */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">To Deliver</span>
                    <strong className="text-cyan-300 font-bold text-sm">{del.orderedQuantity} Jars</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Cust. Holds</span>
                    <strong className="text-amber-300 font-bold text-sm">{cust?.bottleBalance || 0} Jars</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">To Collect</span>
                    <strong className="text-emerald-300 font-bold text-sm">₹{del.amountToCollect}</strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3.5 flex items-center gap-2">
                  {!isInTransit ? (
                    <button
                      onClick={() => handleStart(del.id)}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition"
                    >
                      <Truck className="w-4 h-4" /> Start Delivery
                    </button>
                  ) : (
                    <button
                      onClick={() => openCompletionModal(del)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Complete Delivery
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveDelivery(del);
                      setShowFailedModal(true);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-slate-700/60 hover:bg-red-950 hover:text-red-300 text-slate-300 text-xs font-semibold border border-slate-600/50 transition"
                    title="Report Failure / Reschedule"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completed Deliveries History */}
      {completedDeliveries.length > 0 && (
        <div className="space-y-2 pt-4">
          <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Completed Today ({completedDeliveries.length})
          </div>
          {completedDeliveries.map(del => (
            <div 
              key={del.id}
              className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs text-slate-300"
            >
              <div>
                <div className="font-bold text-slate-200">{del.customerName}</div>
                <div className="text-[11px] text-slate-400">
                  Delivered: {del.deliveredQuantity} • Collected Empties: {del.collectedEmptyBottles} • ₹{del.collectedAmount} ({del.paymentMethod})
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                del.status === 'Delivered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
              }`}>
                {del.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Completion Modal (PRD Section 21) */}
      {showCompleteModal && activeDelivery && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">Record Delivery Completion</h3>
                <p className="text-xs text-cyan-400">{activeDelivery.customerName}</p>
              </div>
              <button 
                onClick={() => setShowCompleteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitComplete} className="mt-4 space-y-4 text-xs">
              {/* Delivered Quantity */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  1. Delivered Water Jars (Ordered: {activeDelivery.orderedQuantity})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={activeDelivery.orderedQuantity * 2}
                    value={deliveredQty}
                    onChange={(e) => setDeliveredQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-cyan-500 outline-none"
                    required
                  />
                  <span className="text-slate-400 font-medium">Jars</span>
                </div>
              </div>

              {/* Empty Bottles Collected */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  2. Empty Bottles Collected (Expected: {activeDelivery.expectedEmptyBottles})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={collectedBottles}
                    onChange={(e) => setCollectedBottles(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-cyan-500 outline-none"
                    required
                  />
                  <span className="text-slate-400 font-medium">Empties</span>
                </div>
                <span className="text-[10px] text-amber-400/90 mt-1 block">
                  * Customer holding balance will be updated automatically in Bottle Ledger.
                </span>
              </div>

              {/* Payment Collection */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">3. Payment Collection</span>
                  <span className="text-cyan-400 font-bold">Total: ₹{activeDelivery.amountToCollect}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Amount Collected</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={collectedAmount}
                        onChange={(e) => setCollectedAmount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-white font-bold text-sm focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white focus:border-cyan-500 outline-none"
                    >
                      <option value="Cash">Cash Handover</option>
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Card">Card Swipe</option>
                    </select>
                  </div>
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-cyan-200 block">UPI QR Scanner</span>
                      <span className="text-[10px] text-slate-400">upi@{currentTenant.invoicePrefix.toLowerCase()}plant</span>
                    </div>
                    <div className="p-1 rounded bg-white text-slate-900">
                      <QrCode className="w-5 h-5" />
                    </div>
                  </div>
                )}

                {paymentMethod !== 'Cash' && (
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Ref / UTR Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. UPI-998822 or Cheque #"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:border-cyan-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  4. Delivery Notes / Proof (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handed to security / Reception pantry"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-600/20"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Failed Delivery Modal (PRD Section 22) */}
      {showFailedModal && activeDelivery && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-rose-400 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Report Delivery Issue
              </h3>
              <button onClick={() => setShowFailedModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitFailed} className="mt-4 space-y-4 text-xs">
              <p className="text-slate-300">
                Please select the reason why delivery to <strong className="text-white">{activeDelivery.customerName}</strong> could not be completed:
              </p>

              <div className="space-y-2">
                {[
                  'Customer unavailable / Premises closed',
                  'Customer cancelled order',
                  'Wrong address / Unreachable phone',
                  'Vehicle breakdown / Route blocked',
                  'Plant stock shortage',
                  'Payment dispute at delivery point',
                  'Other reason'
                ].map(reason => (
                  <label 
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      failedReason === reason ? 'bg-rose-950/60 border-rose-600 text-rose-200' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="failedReason"
                      value={reason}
                      checked={failedReason === reason}
                      onChange={() => setFailedReason(reason)}
                      className="accent-rose-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFailedModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Mark as Failed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
