import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StockManagement } from './components/StockManagement';
import { Billing } from './components/Billing';
import { BrandManagement } from './components/BrandManagement';
import { ReadyForSale } from './components/ReadyForSale';
import { ProfitReports } from './components/ProfitReports';

import { SalesAnalytics } from './components/SalesAnalytics';
import { BillHistory } from './components/BillHistory';
import { DashboardReport } from './components/DashboardReport';

import { Bill } from './types';
import { BillDetails } from './components/BillDetails';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'stock':
        return <StockManagement />;
      case 'billing':
        return <Billing />;
      case 'brands':
        return <BrandManagement />;
      case 'ready-for-sale':
        return <ReadyForSale />;
      case 'profit-reports':
        return <ProfitReports />;
      case 'brands-report':
        return <DashboardReport type="brands" onBack={() => setCurrentPage('dashboard')} />;
      case 'total-stock-report':
        return <DashboardReport type="total-stock" onBack={() => setCurrentPage('dashboard')} />;
      case 'low-stock-report':
        return <DashboardReport type="low-stock" onBack={() => setCurrentPage('dashboard')} />;
      case 'today-sales-report':
        return <DashboardReport type="today-sales" onBack={() => setCurrentPage('dashboard')} />;
      case 'sales-analytics':
        return <SalesAnalytics onBack={() => setCurrentPage('dashboard')} />;
      case 'bill-history':
        return <BillHistory
          onBack={() => setCurrentPage('dashboard')}
          onViewBill={(bill) => {
            setSelectedBill(bill);
            setCurrentPage('bill-details');
          }}
        />;
      case 'bill-details':
        return selectedBill ? (
          <BillDetails
            bill={selectedBill}
            onBack={() => setCurrentPage('bill-history')}
          />
        ) : (
          <Dashboard onNavigate={setCurrentPage} />
        );
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
