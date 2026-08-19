import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { 
  Receipt, 
  Search, 
  Printer, 
  Share2, 
  Eye, 
  IndianRupee, 
  Download, 
  CheckCircle2, 
  Clock, 
  FileText,
  X,
  Droplets
} from 'lucide-react';

export const InvoiceView: React.FC = () => {
  const { invoices, currentTenant, customers } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    return inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
           inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = (inv: Invoice) => {
    const text = `*Tax Invoice from ${currentTenant.name}*\n\nInvoice No: ${inv.invoiceNumber}\nDate: ${inv.invoiceDate}\nCustomer: ${inv.customerName}\nTotal Amount: ₹${inv.total}\nPaid: ₹${inv.paidAmount}\nBalance Due: ₹${inv.balanceAmount}\n\nThank you for choosing ${currentTenant.name}!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Receipt className="w-6 h-6 text-cyan-400" />
              Tax Invoices & Billing Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              PRD Section 31
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate, print and share GST compliant packaged water invoices and receipts
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice # or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date & Due</th>
                <th className="px-4 py-3">Subtotal & Tax</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white text-sm">{inv.invoiceNumber}</div>
                    <span className="text-[10px] text-cyan-400 font-medium">GST Invoice</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-100">{inv.customerName}</div>
                    <div className="text-[10px] text-slate-400">{inv.customerMobile}</div>
                  </td>

                  <td className="px-4 py-3.5 text-slate-300">
                    <div>{inv.invoiceDate}</div>
                    <div className="text-[10px] text-slate-400">Due: {inv.dueDate}</div>
                  </td>

                  <td className="px-4 py-3.5 text-slate-300">
                    <div>Sub: ₹{inv.subtotal}</div>
                    <div className="text-[10px] text-cyan-400">GST (18%): ₹{inv.taxAmount}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-extrabold text-white text-sm">₹{inv.total}</div>
                    <div className="text-[10px] text-emerald-400">Paid: ₹{inv.paidAmount}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`font-extrabold ${inv.balanceAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      ₹{inv.balanceAmount}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      inv.status === 'Paid' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      inv.status === 'Partial' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                      'bg-rose-950 text-rose-300 border-rose-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-semibold border border-cyan-800/60 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => handleShareWhatsApp(inv)}
                        title="Share on WhatsApp"
                        className="p-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Full Printable Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden">
            {/* Modal Top Control Bar */}
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between no-print">
              <span className="font-bold text-sm text-white">Invoice Preview - {selectedInvoice.invoiceNumber}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={() => handleShareWhatsApp(selectedInvoice)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share WhatsApp
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Standard Tax Invoice (PRD Section 31) */}
            <div className="p-6 overflow-y-auto flex-1 bg-white text-slate-900 font-sans text-xs printable-area">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
                    <Droplets className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="font-black text-xl text-slate-900 tracking-tight">{currentTenant.name}</h2>
                    <p className="text-[11px] text-slate-600">{currentTenant.address}, {currentTenant.city}, {currentTenant.pincode}</p>
                    <p className="text-[11px] text-slate-600">
                      Mobile: {currentTenant.mobile} • Email: {currentTenant.email}
                    </p>
                    <p className="text-[11px] font-bold text-cyan-800">GSTIN: {currentTenant.gstin || '27AABCA1234F1Z8'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <h1 className="text-lg font-black uppercase text-slate-900 tracking-wider">TAX INVOICE</h1>
                  <p className="text-xs font-bold text-slate-700">Invoice #: {selectedInvoice.invoiceNumber}</p>
                  <p className="text-[11px] text-slate-600">Date: {selectedInvoice.invoiceDate}</p>
                  <p className="text-[11px] text-slate-600">Due Date: {selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Billed To Section */}
              <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Billed To (Customer):</span>
                  <h3 className="font-bold text-sm text-slate-900">{selectedInvoice.customerName}</h3>
                  <p className="text-[11px] text-slate-600">{selectedInvoice.customerAddress}</p>
                  <p className="text-[11px] text-slate-600">Phone: {selectedInvoice.customerMobile}</p>
                  {selectedInvoice.customerGst && (
                    <p className="text-[11px] font-semibold text-slate-700">GSTIN: {selectedInvoice.customerGst}</p>
                  )}
                </div>

                <div className="text-right flex flex-col justify-end">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Payment Status</span>
                  <span className="text-base font-black text-emerald-700 uppercase">{selectedInvoice.status}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left border-collapse my-4">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase">
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Item & Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Rate (₹)</th>
                    <th className="p-2.5 text-right">Tax (18%)</th>
                    <th className="p-2.5 text-right">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2.5 font-bold">{index + 1}</td>
                      <td className="p-2.5">
                        <strong className="text-slate-900">{item.productName}</strong>
                      </td>
                      <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="p-2.5 text-right">₹{item.unitPrice}</td>
                      <td className="p-2.5 text-right font-mono">18% GST</td>
                      <td className="p-2.5 text-right font-black">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="flex justify-end my-4">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span>₹{selectedInvoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%) + SGST (9%):</span>
                    <span>₹{selectedInvoice.taxAmount}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm border-t-2 border-slate-900 pt-1.5 text-slate-900">
                    <span>Grand Total:</span>
                    <span>₹{selectedInvoice.total}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Amount Paid:</span>
                    <span>₹{selectedInvoice.paidAmount}</span>
                  </div>
                  <div className="flex justify-between font-black text-rose-700 border-t pt-1">
                    <span>Balance Due:</span>
                    <span>₹{selectedInvoice.balanceAmount}</span>
                  </div>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-end">
                <div>
                  <h4 className="font-bold text-slate-700">Terms & Conditions:</h4>
                  <p>1. 20L empty jars remain property of {currentTenant.name} and must be returned on subsequent delivery.</p>
                  <p>2. Unreturned or broken bottles will be charged at standard deposit rate.</p>
                  <p>3. This is a computer-generated tax invoice.</p>
                </div>
                <div className="text-right">
                  <div className="h-10"></div>
                  <p className="font-bold text-slate-800 border-t border-slate-400 pt-1">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
