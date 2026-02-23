import { Bill } from '../types';
import { ArrowLeft, Printer } from 'lucide-react';

import { storageService } from '../services/storage';

interface BillDetailsProps {
    bill: Bill;
    onBack: () => void;
}

export function BillDetails({ bill, onBack }: BillDetailsProps) {
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

    const printInvoice = () => {
        window.print();
    };

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
                                        <button
                                            onClick={() => handleReturn(item.id)}
                                            className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                                        >
                                            Return
                                        </button>
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
                                <span className="text-gray-600">GST ({bill.gstPercent}%):</span>
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
        </div>
    );
}
