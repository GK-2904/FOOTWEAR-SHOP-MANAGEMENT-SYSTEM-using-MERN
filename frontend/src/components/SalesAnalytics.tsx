import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';

interface DailySales {
    date: string;
    count: number;
    total: number;
    margin: number;
}

export function SalesAnalytics({ onBack }: { onBack: () => void }) {
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [dailySales, setDailySales] = useState<DailySales[]>([]);
    const [totalPeriodSales, setTotalPeriodSales] = useState(0);
    const [totalPeriodMargin, setTotalPeriodMargin] = useState(0);
    const [periodBillsData, setPeriodBillsData] = useState<any[]>([]);

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

        const salesMap = new Map<string, { count: number, total: number, margin: number }>();
        let overallMargin = 0;

        periodBills.forEach(bill => {
            const date = bill.createdAt.split('T')[0];
            const current = salesMap.get(date) || { count: 0, total: 0, margin: 0 };

            let billMargin = 0;
            bill.items.forEach(item => {
                if (item.status !== 'returned') {
                    billMargin += item.total - ((item.purchasePrice || 0) * item.quantity);
                }
            });

            overallMargin += billMargin;

            salesMap.set(date, {
                count: current.count + 1,
                total: current.total + bill.finalAmount,
                margin: current.margin + billMargin
            });
        });

        const salesArray: DailySales[] = Array.from(salesMap.entries()).map(([date, data]) => ({
            date,
            count: data.count,
            total: data.total,
            margin: data.margin
        })).sort((a, b) => b.date.localeCompare(a.date));

        setDailySales(salesArray);
        setTotalPeriodSales(periodBills.reduce((sum, bill) => sum + bill.finalAmount, 0));
        setTotalPeriodMargin(overallMargin);
        setPeriodBillsData(periodBills);
    };

    const exportToCSV = () => {
        const rows = [
            ['Date', 'Bill Number', 'Customer Name', 'Payment Method', 'Item Brand', 'Item Type', 'Quantity', 'Purchase Price', 'Selling Price', 'Total', 'Margin', 'Status']
        ];

        periodBillsData.forEach(b => {
            b.items.forEach((i: any) => {
                const margin = i.status === 'returned' ? 0 : (i.price - (i.purchasePrice || 0)) * i.quantity;
                const formattedDate = new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                rows.push([
                    `"${formattedDate}"`,
                    b.billNumber,
                    `"${b.customerName || ''}"`,
                    b.paymentMethod || 'Cash',
                    `"${i.brandName}"`,
                    `"${i.type}"`,
                    i.quantity.toString(),
                    (i.purchasePrice || 0).toString(),
                    i.price.toString(),
                    (i.status === 'returned' ? 0 : i.total).toString(),
                    margin.toString(),
                    i.status || 'sold'
                ]);
            });
        });

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_report_${dateRange.start}_to_${dateRange.end}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors print:hidden"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Sales Analytics</h1>
                <div className="ml-auto flex gap-2 print:hidden">
                    <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700">
                        Print PDF
                    </button>
                    <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        Download Excel (CSV)
                    </button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-md"
            >
                <div className="flex flex-wrap gap-4 items-end mb-6 print:hidden">
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

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-800 font-medium">Total Sales for Period</p>
                            <p className="text-2xl font-bold text-blue-900">₹{totalPeriodSales.toLocaleString()}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-800 font-medium">Est. Margin for Period</p>
                            <p className="text-2xl font-bold text-green-900">₹{totalPeriodMargin.toLocaleString()}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bills Count</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dailySales.map((day) => (
                                <tr key={day.date} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                        ₹{day.margin.toLocaleString()}
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
