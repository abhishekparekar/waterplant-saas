import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  PlusCircle, 
  Search, 
  Calendar, 
  Clock, 
  RotateCw, 
  CheckCircle2, 
  Truck, 
  Users,
  Repeat
} from 'lucide-react';
import { RecurringFrequency } from '../../types';

export const OrderManagementView: React.FC = () => {
  const { 
    orders, 
    recurringSchedules, 
    customers, 
    products, 
    users, 
    createOrder, 
    createRecurringSchedule, 
    toggleRecurringSchedule,
    generateDailyDeliveriesFromRecurring
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'recurring'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);

  // New Order Form
  const [orderCustomerId, setOrderCustomerId] = useState('');
  const [orderProductId, setOrderProductId] = useState('prod_20l_jar');
  const [orderQty, setOrderQty] = useState(10);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedDriverId, setAssignedDriverId] = useState('user_delivery_01');

  // New Recurring Form
  const [recCustomerId, setRecCustomerId] = useState('');
  const [recProductId, setRecProductId] = useState('prod_20l_jar');
  const [recQty, setRecQty] = useState(10);
  const [recFrequency, setRecFrequency] = useState<RecurringFrequency>('Daily');
  const [recTimeSlot, setRecTimeSlot] = useState('08:00 AM - 10:00 AM');
  const [recNotes, setRecNotes] = useState('');

  const deliveryDrivers = users.filter(u => u.role === 'delivery');

  const filteredOrders = orders.filter(o => {
    return o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredRecurring = recurringSchedules.filter(r => {
    return r.customerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === orderCustomerId);
    const prod = products.find(p => p.id === orderProductId);
    const driver = users.find(u => u.id === assignedDriverId);

    if (!cust || !prod) {
      alert('Please select valid customer and product.');
      return;
    }

    const price = cust.defaultPrice || prod.sellingPrice;
    const total = orderQty * price;

    createOrder({
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      customerAddress: cust.address,
      items: [{
        productId: prod.id,
        productName: prod.name,
        quantity: orderQty,
        unitPrice: price,
        bottleDeposit: 0,
        taxRate: prod.taxRate,
        total
      }],
      totalAmount: total,
      bottleDepositAmount: 0,
      grandTotal: total,
      status: 'Pending',
      orderType: 'One-Time',
      scheduledDate: orderDate,
      assignedEmployeeId: driver?.id,
      assignedEmployeeName: driver?.name
    });

    setShowOrderModal(false);
  };

  const handleCreateRecurringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === recCustomerId);
    const prod = products.find(p => p.id === recProductId);

    if (!cust || !prod) {
      alert('Please select valid customer and product.');
      return;
    }

    createRecurringSchedule({
      customerId: cust.id,
      customerName: cust.name,
      productId: prod.id,
      productName: prod.name,
      quantity: recQty,
      frequency: recFrequency,
      preferredTimeSlot: recTimeSlot,
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      notes: recNotes
    });

    setShowRecurringModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-cyan-400" />
              Order & Recurring Subscription Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            PRD Section 16, 17, 18: One-time customer bookings & automated recurring delivery schedules
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const count = generateDailyDeliveriesFromRecurring();
              alert(count > 0 ? `Generated ${count} recurring deliveries for today!` : 'All recurring orders for today are already generated.');
            }}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-cyan-300 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-600 transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Generate Today's Deliveries</span>
          </button>

          {activeTab === 'orders' ? (
            <button
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New One-Time Order</span>
            </button>
          ) : (
            <button
              onClick={() => setShowRecurringModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Recurring Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 pb-2.5 px-4 border-b-2 transition ${
            activeTab === 'orders' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>All Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recurring')}
          className={`flex items-center gap-1.5 pb-2.5 px-4 border-b-2 transition ${
            activeTab === 'recurring' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Recurring Delivery Schedules ({recurringSchedules.length})</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search by customer name or order number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 outline-none"
        />
      </div>

      {/* TAB 1: ALL ORDERS TABLE */}
      {activeTab === 'orders' && (
        <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Order Details</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items & Quantity</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Scheduled Date</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white text-sm">{ord.orderNumber}</div>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ord.orderType === 'Recurring' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {ord.orderType}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-100">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-400">{ord.customerMobile}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-white">{ord.items[0]?.quantity} × {ord.items[0]?.productName}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-white text-sm">₹{ord.grandTotal}</div>
                      <div className="text-[10px] text-emerald-400">Paid: ₹{ord.paidAmount}</div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300">
                      {ord.scheduledDate}
                    </td>

                    <td className="px-4 py-3.5 text-cyan-300">
                      {ord.assignedEmployeeName || 'Unassigned'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        ord.status === 'Delivered' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                        ord.status === 'Out for Delivery' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                        ord.status === 'Failed' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RECURRING SCHEDULES */}
      {activeTab === 'recurring' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecurring.map(sched => (
            <div key={sched.id} className="glass-card p-4 rounded-2xl border border-slate-700/70 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white">{sched.customerName}</h3>
                  <div className="text-xs text-cyan-400 font-semibold mt-0.5">
                    {sched.quantity} × {sched.productName}
                  </div>
                </div>

                <button
                  onClick={() => toggleRecurringSchedule(sched.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                    sched.active ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {sched.active ? 'Active Schedule' : 'Paused'}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Frequency:</span>
                  <strong className="text-slate-200">{sched.frequency}</strong>
                </div>
                {sched.selectedDays && (
                  <div className="flex justify-between text-slate-400">
                    <span>Days:</span>
                    <strong className="text-cyan-300">{sched.selectedDays.join(', ')}</strong>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Time Slot:</span>
                  <strong className="text-slate-200">{sched.preferredTimeSlot || 'Morning'}</strong>
                </div>
              </div>

              {sched.notes && (
                <p className="text-[11px] text-slate-400 italic bg-slate-800/40 p-2 rounded-lg">
                  "{sched.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Create One-Time Delivery Order</h3>
              <button onClick={() => setShowOrderModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Customer</label>
                <select
                  required
                  value={orderCustomerId}
                  onChange={(e) => setOrderCustomerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.customerType})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Product</label>
                  <select
                    value={orderProductId}
                    onChange={(e) => setOrderProductId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.sellingPrice})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={orderQty}
                    onChange={(e) => setOrderQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assign Driver</label>
                  <select
                    value={assignedDriverId}
                    onChange={(e) => setAssignedDriverId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {deliveryDrivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold"
                >
                  Create & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Recurring Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Create Recurring Delivery Subscription</h3>
              <button onClick={() => setShowRecurringModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateRecurringSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Customer</label>
                <select
                  required
                  value={recCustomerId}
                  onChange={(e) => setRecCustomerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.customerType})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Product</label>
                  <select
                    value={recProductId}
                    onChange={(e) => setRecProductId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jars per Delivery</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={recQty}
                    onChange={(e) => setRecQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Frequency</label>
                  <select
                    value={recFrequency}
                    onChange={(e) => setRecFrequency(e.target.value as RecurringFrequency)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Alternate Days">Alternate Days</option>
                    <option value="Weekdays">Monday to Saturday</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Preferred Time</label>
                  <input
                    type="text"
                    value={recTimeSlot}
                    onChange={(e) => setRecTimeSlot(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Delivery Instruction / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Leave at reception pantry, 3rd floor"
                  value={recNotes}
                  onChange={(e) => setRecNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRecurringModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold"
                >
                  Activate Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
