import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';

interface DailySales {
    date: string;
    count: number;
    total: number;
}

export function SalesAnalytics({ onBack }: { onBack: () => void }) {
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [dailySales, setDailySales] = useState<DailySales[]>([]);
    const [totalPeriodSales, setTotalPeriodSales] = useState(0);

    useEffect(() => {
        loadData();
    }, [dateRange]);

    const loadData = async () => {
        if (!dateRange.start || !dateRange.end) return;

        const bills = await storageService.getBills();
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);

        const periodBills = bills.filter(b => {
            const billDate = new Date(b.createdAt);
            return billDate >= start && billDate <= end;
        });

        const salesMap = new Map<string, { count: number, total: number }>();

        periodBills.forEach(bill => {
            const date = bill.createdAt.split('T')[0];
            const current = salesMap.get(date) || { count: 0, total: 0 };
            salesMap.set(date, {
                count: current.count + 1,
                total: current.total + bill.finalAmount
            });
        });

        const salesArray: DailySales[] = Array.from(salesMap.entries()).map(([date, data]) => ({
            date,
            count: data.count,
            total: data.total
        })).sort((a, b) => b.date.localeCompare(a.date));

        setDailySales(salesArray);
        setTotalPeriodSales(periodBills.reduce((sum, bill) => sum + bill.finalAmount, 0));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Sales Analytics</h1>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-md"
            >
                <div className="flex flex-wrap gap-4 items-end mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-blue-800 font-medium">Total Sales for Period</p>
                        <p className="text-2xl font-bold text-blue-900">₹{totalPeriodSales.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-500" />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bills Count</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dailySales.map((day) => (
                                <tr key={day.date} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(day.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {day.count}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ₹{day.total.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {dailySales.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        No sales data found for the selected period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
