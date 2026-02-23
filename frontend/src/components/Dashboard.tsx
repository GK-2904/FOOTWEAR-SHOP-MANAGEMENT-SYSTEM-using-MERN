import { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import { DashboardStats, Footwear } from '../types';
import { Package, Tag, AlertTriangle, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function Dashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalStock: 0,
    totalBrands: 0,
    lowStockItems: 0,
    todaySales: 0,
    monthlySales: 0,
    totalBills: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<Footwear[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [footwear, brands, bills] = await Promise.all([
      storageService.getFootwear(),
      storageService.getBrands(),
      storageService.getBills()
    ]);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const todayBills = bills.filter(b => b.createdAt.startsWith(todayStr));
    const todaySales = todayBills.reduce((sum, bill) => sum + bill.finalAmount, 0);

    const monthlyBills = bills.filter(b => {
      const billDate = new Date(b.createdAt);
      return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
    });
    const monthlySales = monthlyBills.reduce((sum, bill) => sum + bill.finalAmount, 0);

    const totalStock = footwear.reduce((sum, item) => sum + item.quantity, 0);
    const lowStock = footwear.filter(item => item.quantity <= 5);

    setStats({
      totalStock,
      totalBrands: brands.length,
      lowStockItems: lowStock.length,
      todaySales,
      monthlySales,
      totalBills: bills.length,
    });

    setLowStockItems(lowStock);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-800"
        >
          Dashboard
        </motion.h1>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        <motion.div variants={item} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stock</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStock}</p>
            </div>
            <Package className="w-10 h-10 text-blue-500" />
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Brands</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBrands}</p>
            </div>
            <Tag className="w-10 h-10 text-green-500" />
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.lowStockItems}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹{stats.todaySales}</p>
            </div>
            <DollarSign className="w-10 h-10 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div
          onClick={() => onNavigate?.('sales-analytics')}
          variants={item}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹{stats.monthlySales}</p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          onClick={() => onNavigate?.('bill-history')}
          variants={item}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-orange-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bill History</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBills}</p>
            </div>
            <FileText className="w-10 h-10 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          onClick={() => onNavigate?.('profit-reports')}
          variants={item}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit Reports</p>
              <p className="text-xl font-bold text-gray-900 mt-2">View</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500" />
          </div>
        </motion.div>
      </motion.div>

      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Low Stock Alerts</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockItems.map((item) => (
                    <tr key={`${item.id}-${item.size}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.brandName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.size}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.color}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.section}-{item.rack}-{item.shelf}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                          {item.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
