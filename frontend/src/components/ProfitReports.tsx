import { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, Calendar, BarChart3, List } from 'lucide-react';
import { storageService } from '../services/storage';

export function ProfitReports() {
    const [activeTab, setActiveTab] = useState('daily');
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        let result = [];
        try {
            if (activeTab === 'customer') result = await storageService.getCustomerProfit();
            else if (activeTab === 'product') result = await storageService.getProductProfit();
            else if (activeTab === 'monthly') result = await storageService.getMonthlyProfit();
            else if (activeTab === 'daily') result = await storageService.getDailyProfit();
            else if (activeTab === 'category') result = await storageService.getCategoryProfit();
            setData(result);
        } catch (err) {
            console.error(err);
        }
    };

    const tabs = [
        { id: 'daily', label: 'Daily Profit', icon: Calendar },
        { id: 'monthly', label: 'Monthly Profit', icon: BarChart3 },
        { id: 'product', label: 'Product-wise', icon: Package },
        { id: 'category', label: 'Category Summary', icon: List },
        { id: 'customer', label: 'Customer Profit', icon: Users },
    ];

    const renderTable = () => {
        if (data.length === 0) return <div className="p-6 text-center text-gray-500">No data available</div>;

        switch (activeTab) {
            case 'daily':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bills</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Profit</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.total_bills}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">₹{parseFloat(row.total_revenue).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{parseFloat(row.total_profit).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'monthly':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bills</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Profit</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {new Date(`${row.month}-01`).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.total_bills}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">₹{parseFloat(row.total_revenue).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{parseFloat(row.total_profit).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'product':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub Brand</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items Sold</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Profit</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.product_name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.sub_brand || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.items_sold}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">₹{parseFloat(row.total_revenue).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{parseFloat(row.total_profit).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'category':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items Sold</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Profit</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.category_name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.items_sold}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">₹{parseFloat(row.total_revenue).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{parseFloat(row.total_profit).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'customer':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bills</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items Bought</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Profit</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.customer_name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.total_bills}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.total_items}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">₹{parseFloat(row.total_revenue).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{parseFloat(row.total_profit).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Profit Reports</h1>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 p-2">
                <div className="flex overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all ${isActive ? 'bg-slate-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">{tabs.find(t => t.id === activeTab)?.label}</h2>
                </div>
                <div className="overflow-x-auto">
                    {renderTable()}
                </div>
            </div>
        </div>
    );
}
