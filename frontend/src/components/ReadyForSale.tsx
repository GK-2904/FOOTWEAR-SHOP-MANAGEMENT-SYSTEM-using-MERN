import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Footwear } from '../types';
import { AlertTriangle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ReadyForSale() {
    const [footwear, setFootwear] = useState<Footwear[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await storageService.getFootwear();
        const readyStock = data.filter(item => {
            if (!item.expiryDate) return false;
            return new Date(item.expiryDate) <= new Date();
        });
        setFootwear(readyStock);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <h1 className="text-3xl font-bold text-gray-800">Ready for Sale (Death/Expiry Stock)</h1>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost (Pur)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selling</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <AnimatePresence>
                                {footwear.map((item, index) => (
                                    <motion.tr
                                        key={`${item.id}-${item.size}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-orange-50"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {item.brandName} {item.subBrand} {item.article} ({item.category})
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.size}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                {item.section}-{item.rack}-{item.shelf}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">₹{item.purchasePrice}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">₹{item.sellingPrice}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-red-600 font-medium">
                                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </motion.tr>
                                ))}
                                {footwear.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                            No matching records found.
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
