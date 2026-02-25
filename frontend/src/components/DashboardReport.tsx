import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Brand, Footwear, Bill } from '../types';
import { ArrowLeft, Search, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type ReportType = 'brands' | 'total-stock' | 'low-stock' | 'today-sales';

interface DashboardReportProps {
    type: ReportType;
    onBack: () => void;
}

export function DashboardReport({ type, onBack }: DashboardReportProps) {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [footwear, setFootwear] = useState<Footwear[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [type]);

    const loadData = async () => {
        if (type === 'brands') {
            const data = await storageService.getBrands();
            setBrands(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else if (type === 'total-stock' || type === 'low-stock') {
            const data = await storageService.getFootwear();
            if (type === 'low-stock') {
                setFootwear(data.filter(f => f.quantity <= 5));
            } else {
                setFootwear(data);
            }
        } else if (type === 'today-sales') {
            const data = await storageService.getBills();
            const todayStr = new Date().toISOString().split('T')[0];
            setBills(data.filter(b => b.createdAt.startsWith(todayStr)));
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'brands': return 'Brands Report';
            case 'total-stock': return 'Total Stock Report';
            case 'low-stock': return 'Low Stock Report';
            case 'today-sales': return 'Today\'s Sales Report';
            default: return 'Report';
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text(getTitle(), 14, 15);

        if (type === 'brands') {
            const data = brands.map(b => [b.name, new Date(b.createdAt).toLocaleDateString()]);
            (doc as any).autoTable({ head: [['Brand Name', 'Added Date']], body: data, startY: 20 });
        } else if (type === 'total-stock' || type === 'low-stock') {
            const data = footwear.map(f => [
                f.brandName, f.category, f.type, f.size, f.color,
                `${f.section}-${f.rack}-${f.shelf}`, f.quantity.toString()
            ]);
            (doc as any).autoTable({
                head: [['Brand', 'Category', 'Type', 'Size', 'Color', 'Location', 'Qty']],
                body: data,
                startY: 20
            });
        } else if (type === 'today-sales') {
            const data = bills.map(b => [
                b.billNumber,
                new Date(b.createdAt).toLocaleTimeString(),
                b.customerName || 'N/A',
                b.items.length.toString(),
                `Rs. ${b.finalAmount}`
            ]);
            (doc as any).autoTable({
                head: [['Bill Number', 'Time', 'Customer', 'Items', 'Total Amount']],
                body: data,
                startY: 20
            });
        }

        doc.save(`${type}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const exportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";

        if (type === 'brands') {
            csvContent += "Brand Name,Added Date\n";
            csvContent += brands.map(b => `"${b.name}","${new Date(b.createdAt).toLocaleDateString()}"`).join("\n");
        } else if (type === 'total-stock' || type === 'low-stock') {
            csvContent += "Brand,Category,Type,Size,Color,Location,Quantity,Purchase Price,Selling Price\n";
            csvContent += footwear.map(f =>
                `"${f.brandName}","${f.category}","${f.type}","${f.size}","${f.color}",` +
                `"${f.section}-${f.rack}-${f.shelf}","${f.quantity}","${f.purchasePrice}","${f.sellingPrice}"`
            ).join("\n");
        } else if (type === 'today-sales') {
            csvContent += "Bill Number,Time,Customer Name,Items Count,Total Amount,Payment Method\n";
            csvContent += bills.map(b =>
                `"${b.billNumber}","${new Date(b.createdAt).toLocaleTimeString()}","${b.customerName || ''}",` +
                `"${b.items.length}","${b.finalAmount}","${b.paymentMethod || 'Cash'}"`
            ).join("\n");
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${type}-report-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderTable = () => {
        if (type === 'brands') {
            const filtered = brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
            return (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filtered.map(brand => (
                            <tr key={brand.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{brand.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(brand.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={2} className="px-6 py-8 text-center text-gray-500">No brands found.</td></tr>
                        )}
                    </tbody>
                </table>
            );
        }

        if (type === 'total-stock' || type === 'low-stock') {
            const filtered = footwear.filter(item =>
                item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.size.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filtered.map(item => (
                            <tr key={`${item.id}-${item.size}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.brandName}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{item.type}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{item.size}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{item.section}-{item.rack}-{item.shelf}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                    <span className={`px-2 py-1 rounded-full text-xs ${item.quantity <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {item.quantity}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No stock records found.</td></tr>
                        )}
                    </tbody>
                </table>
            );
        }

        if (type === 'today-sales') {
            const filtered = bills.filter(bill => bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()));
            return (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filtered.map(bill => (
                            <tr key={bill.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{bill.billNumber}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(bill.createdAt).toLocaleTimeString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{bill.customerName || 'Walk-in'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{bill.items.length} items</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{bill.finalAmount}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No sales recorded today.</td></tr>
                        )}
                    </tbody>
                </table>
            );
        }

        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">{getTitle()}</h1>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={exportPDF} className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex justify-center items-center gap-2">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <button onClick={exportCSV} className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex justify-center items-center gap-2">
                        <Download className="w-4 h-4" /> Export Excel
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {renderTable()}
                </div>
            </div>
        </div>
    );
}
