import { useState, useEffect } from 'react';
import { Bill } from '../types';
import { ArrowLeft, Printer, X, Search } from 'lucide-react';

import { storageService } from '../services/storage';

interface BillDetailsProps {
    bill: Bill;
    onBack: () => void;
}

export function BillDetails({ bill, onBack }: BillDetailsProps) {
    const [showReplaceModal, setShowReplaceModal] = useState(false);
    const [currentItemToReplace, setCurrentItemToReplace] = useState<string | null>(null);
    const [footwear, setFootwear] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadFootwear();
    }, []);

    const loadFootwear = async () => {
        const data = await storageService.getFootwear();
        setFootwear(data.filter((f: any) => f.quantity > 0));
    };

    const handleReturn = async (itemId?: string) => {
        if (!itemId) return;
        if (confirm('Are you sure you want to return this item?')) {
            try {
                await storageService.returnItem(bill.id, itemId);
                alert('Item returned successfully!');
                onBack(); // Refresh by going back
            } catch (err: any) {
                alert('Failed to return item: ' + (err.message || 'Server error'));
            }
        }
    };

    const handleReplaceClick = (itemId: string) => {
        setCurrentItemToReplace(itemId);
        setShowReplaceModal(true);
    };

    const handleReplaceConfirm = async (newItem: any) => {
        if (!currentItemToReplace) return;

        try {
            await storageService.replaceItem(bill.id, currentItemToReplace, {
                footwearId: newItem.id.toString(),
                brandName: newItem.brandName,
                category: newItem.category,
                type: newItem.type,
                size: newItem.size,
                color: newItem.color,
                subBrand: newItem.subBrand,
                article: newItem.article,
                gender: newItem.gender,
                quantity: 1, // Only replacing 1 qty at a time for simplicity
                price: newItem.sellingPrice,
                mrp: newItem.sellingPrice,
                purchasePrice: newItem.purchasePrice,
                gstPercent: newItem.gstPercent || 0,
                total: newItem.sellingPrice
            });
            alert('Item replaced successfully!');
            setShowReplaceModal(false);
            onBack();
        } catch (err: any) {
            alert('Failed to replace item: ' + (err.message || 'Server error'));
        }
    };

    const printInvoice = () => {
        window.print();
    };

    const filteredFootwear = footwear.filter(item => {
        return (
            item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Bill Details</h1>
                </div>
                <button
                    onClick={printInvoice}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Printer className="w-5 h-5" />
                    Print
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
                    <h2 className="text-3xl font-bold text-gray-800">SHIVAM FOOTWEAR</h2>
                    <p className="text-gray-600 mt-2">Management System</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-gray-600">Bill Number:</p>
                        <p className="font-semibold">{bill.billNumber}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Date:</p>
                        <p className="font-semibold">
                            {new Date(bill.createdAt).toLocaleString()}
                        </p>
                        {bill.paymentMethod && (
                            <p className="text-sm text-gray-800 mt-1">Payment: <span className="font-medium">{bill.paymentMethod}</span></p>
                        )}
                        {bill.customerName && (
                            <p className="text-sm text-gray-800 mt-1">Customer: <span className="font-medium">{bill.customerName}</span></p>
                        )}
                    </div>
                </div>

                <table className="w-full mb-6">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Item</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold">Size</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold">Qty</th>
                            <th className="px-4 py-2 text-right text-sm font-semibold">MRP</th>
                            <th className="px-4 py-2 text-right text-sm font-semibold">Price</th>
                            <th className="px-4 py-2 text-right text-sm font-semibold">Total</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold print:hidden">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map((item, index) => (
                            <tr key={index} className="border-b">
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="font-medium">{item.brandName}</p>
                                        <p className="text-sm text-gray-600">
                                            {item.category} - {item.type} - {item.color}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">{item.size}</td>
                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                <td className="px-4 py-3 text-right">₹{item.mrp || item.price}</td>
                                <td className="px-4 py-3 text-right">₹{item.price}</td>
                                <td className="px-4 py-3 text-right font-medium">
                                    <span className={item.status === 'returned' ? 'line-through text-gray-400' : ''}>
                                        ₹{item.total}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center print:hidden">
                                    {item.status === 'returned' ? (
                                        <span className="text-sm text-red-500 font-medium bg-red-50 px-2 py-1 rounded">Returned</span>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleReturn(item.id)}
                                                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                                            >
                                                Return
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                onClick={() => handleReplaceClick(item.id!)}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Replace
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">₹{bill.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total GST:</span>
                                <span className="font-medium">₹{bill.gstAmount.toFixed(2)}</span>
                            </div>
                            {bill.discountPercent > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({bill.discountPercent}%):</span>
                                    <span className="font-medium">-₹{bill.discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-2">
                                <span>Final Amount:</span>
                                <span>₹{bill.finalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-600">
                    <p className="text-lg font-semibold mb-2">Thank you for your purchase!</p>
                    <p>Visit Again</p>
                </div>
            </div>

            {/* Replace Item Modal */}
            {showReplaceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">Select Replacement Item</h2>
                            <button
                                onClick={() => setShowReplaceModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-auto">
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search replacement footwear by brand, size, color, or type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredFootwear.map(item => (
                                    <div
                                        key={item.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border-gray-200"
                                        onClick={() => handleReplaceConfirm(item)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{item.brandName}</h3>
                                                <p className="text-sm text-gray-600">{item.article}</p>
                                            </div>
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                                Size {item.size}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                                            <p>Color: {item.color}</p>
                                            <p>Type: {item.type}</p>
                                            <p>Category: {item.category}</p>
                                            <p className={`font-semibold ${item.quantity <= 5 ? 'text-red-500' : 'text-green-600'}`}>
                                                Stock: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                            <span className="text-gray-500 line-through text-sm">₹{item.mrp}</span>
                                            <span className="font-bold text-gray-900 text-lg">₹{item.sellingPrice}</span>
                                        </div>
                                    </div>
                                ))}
                                {filteredFootwear.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-gray-500">
                                        No footprint found matching your search.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
