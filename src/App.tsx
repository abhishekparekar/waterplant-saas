import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { DeliveryManagementView } from './components/deliveries/DeliveryManagementView';
import { BottleIntelligenceView } from './components/bottles/BottleIntelligenceView';
import { CustomerListView } from './components/customers/CustomerListView';
import { OrderManagementView } from './components/orders/OrderManagementView';
import { ProductionView } from './components/production/ProductionView';
import { StockManagementView } from './components/stock/StockManagementView';
import { InvoiceView } from './components/invoices/InvoiceView';
import { PaymentManagementView } from './components/payments/PaymentManagementView';
import { ExpenseManagementView } from './components/expenses/ExpenseManagementView';
import { DailyClosingView } from './components/closing/DailyClosingView';
import { ReportsView } from './components/reports/ReportsView';
import { EmployeeManagementView } from './components/employees/EmployeeManagementView';
import { ProductManagementView } from './components/products/ProductManagementView';
import { SubscriptionView } from './components/subscription/SubscriptionView';
import { Smartphone, Monitor } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, isMobileSimulator, setIsMobileSimulator } = useApp();

  const handleOpenQuickAction = (action: string) => {
    switch (action) {
      case 'customer':
        setActiveTab('customers');
        break;
      case 'order':
        setActiveTab('orders');
        break;
      case 'production':
        setActiveTab('production');
        break;
      case 'payment':
        setActiveTab('payments');
        break;
      case 'expense':
        setActiveTab('expenses');
        break;
      case 'stock':
        setActiveTab('stock');
        break;
      default:
        setActiveTab('dashboard');
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onOpenQuickAction={handleOpenQuickAction} />;
      case 'deliveries':
        return <DeliveryManagementView />;
      case 'bottles':
        return <BottleIntelligenceView />;
      case 'customers':
        return <CustomerListView />;
      case 'orders':
        return <OrderManagementView />;
      case 'production':
        return <ProductionView />;
      case 'stock':
        return <StockManagementView />;
      case 'invoices':
        return <InvoiceView />;
      case 'payments':
        return <PaymentManagementView />;
      case 'expenses':
        return <ExpenseManagementView />;
      case 'closing':
        return <DailyClosingView />;
      case 'reports':
        return <ReportsView />;
      case 'employees':
        return <EmployeeManagementView />;
      case 'products':
        return <ProductManagementView />;
      case 'subscription':
        return <SubscriptionView />;
      default:
        return <DashboardView onOpenQuickAction={handleOpenQuickAction} />;
    }
  };

  // Mobile App Frame Simulator Mode
  if (isMobileSimulator) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        {/* Top Control Bar for Simulator */}
        <div className="mb-4 flex items-center justify-between w-[390px] px-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-bold">React Native Mobile Simulator</span>
          </div>
          <button
            onClick={() => setIsMobileSimulator(false)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-cyan-400 font-semibold border border-slate-700"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Exit to Desktop</span>
          </button>
        </div>

        {/* Device Frame */}
        <div className="mobile-device-frame bg-slate-900 flex flex-col text-slate-100 shadow-2xl">
          <div className="mobile-notch"></div>
          
          {/* Mobile Top Status Bar Simulation */}
          <div className="pt-2 px-6 pb-1 flex justify-between items-center text-[11px] font-bold text-slate-300 bg-slate-900 select-none z-40">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-4 h-2 border border-slate-400 rounded-sm p-0.5 flex items-center">
                <div className="h-full w-2.5 bg-cyan-400 rounded-xs"></div>
              </div>
            </div>
          </div>

          {/* Internal Navbar */}
          <div className="overflow-x-hidden">
            <Navbar onOpenQuickAction={handleOpenQuickAction} />
          </div>

          {/* Scrollable View Area */}
          <div className="flex-1 overflow-y-auto p-3.5 pb-20">
            {renderActiveView()}
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </div>
    );
  }

  // Full Desktop & Responsive Mode
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenQuickAction={handleOpenQuickAction} />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-57px)]">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Responsive Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
