import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Tag, LogOut, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stock', label: 'Stock Management', icon: Package },
    { id: 'billing', label: 'Billing / POS', icon: ShoppingCart },
    { id: 'brands', label: 'Brand Management', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white overflow-hidden">
      <nav className="bg-slate-800 text-white shadow-lg print:hidden z-10 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                <ShoppingBag className="w-8 h-8" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold">SHIVAM FOOTWEAR</h1>
                <p className="text-xs text-gray-300">Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex print:block">
        <aside className="w-64 bg-white shadow-lg min-h-[calc(100vh-4rem)] print:hidden z-0">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.li
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.id
                          ? 'bg-slate-800 text-white shadow-md transform scale-105'
                          : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6 print:p-0 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
