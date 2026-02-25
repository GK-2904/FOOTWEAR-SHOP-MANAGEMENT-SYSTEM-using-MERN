import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Footwear, Brand } from '../types';
import { AlertTriangle, MapPin, Plus, X, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ReadyForSale() {
    const [footwear, setFootwear] = useState<Footwear[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState<string | null>(null);
    const [originalProduct, setOriginalProduct] = useState<Partial<Footwear> | null>(null);
    const [formData, setFormData] = useState<Partial<Footwear>>({
        brandId: '',
        brandName: '',
        category: 'Men',
        type: 'Casual',
        size: '',
        color: '',
        section: '',
        rack: '',
        shelf: '',
        subBrand: '',
        article: '',
        gender: '',
        purchasePrice: 0,
        sellingPrice: 0,
        gstPercent: 0,
        quantity: 0,
        mfgDate: '',
        expiryDate: new Date().toISOString().split('T')[0], // Default to today so it's instantly expired
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [footwearData, brandsData] = await Promise.all([
            storageService.getFootwear(),
            storageService.getBrands()
        ]);
        const readyStock = footwearData.filter(item => {
            if (!item.expiryDate) return false;
            return new Date(item.expiryDate) <= new Date();
        });
        setFootwear(readyStock);
        setBrands(brandsData);
    };

    const handleBrandChange = (brandId: string) => {
        const brand = brands.find(b => b.id === brandId);
        setFormData({
            ...formData,
            brandId,
            brandName: brand?.name || '',
        });
    };

    const handleEdit = (item: Footwear) => {
        setFormData(item);
        setEditingId(item.id);
        setOriginalSize(item.size);
        setOriginalProduct(item);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this expiry item?')) {
            await storageService.deleteFootwear(id);
            await loadData();
        }
    };

    const resetForm = () => {
        setFormData({
            brandId: '',
            brandName: '',
            category: 'Men',
            type: 'Casual',
            size: '',
            color: '',
            section: '',
            rack: '',
            shelf: '',
            subBrand: '',
            article: '',
            gender: '',
            purchasePrice: 0,
            sellingPrice: 0,
            gstPercent: 0,
            quantity: 0,
            mfgDate: '',
            expiryDate: new Date().toISOString().split('T')[0],
        });
        setEditingId(null);
        setOriginalSize(null);
        setOriginalProduct(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId && originalProduct) {
                const isGenericChange =
                    originalProduct.brandId !== formData.brandId ||
                    originalProduct.category !== formData.category ||
                    originalProduct.type !== formData.type ||
                    originalProduct.color !== formData.color ||
                    originalProduct.section !== formData.section ||
                    originalProduct.rack !== formData.rack ||
                    originalProduct.shelf !== formData.shelf ||
                    originalProduct.subBrand !== formData.subBrand ||
                    originalProduct.article !== formData.article ||
                    originalProduct.purchasePrice !== formData.purchasePrice ||
                    originalProduct.sellingPrice !== formData.sellingPrice ||
                    originalProduct.gstPercent !== formData.gstPercent ||
                    originalProduct.gender !== formData.gender;

                if (isGenericChange) {
                    const detachedFootwear: Footwear = {
                        id: Date.now().toString(),
                        brandId: formData.brandId || '',
                        brandName: formData.brandName || '',
                        category: formData.category || 'Men',
                        type: formData.type || 'Casual',
                        size: formData.size || '',
                        color: formData.color || '',
                        section: formData.section || '',
                        rack: formData.rack || '',
                        shelf: formData.shelf || '',
                        subBrand: formData.subBrand || '',
                        article: formData.article || '',
                        gender: formData.gender || '',
                        purchasePrice: formData.purchasePrice || 0,
                        sellingPrice: formData.sellingPrice || 0,
                        gstPercent: formData.gstPercent || 0,
                        quantity: formData.quantity || 0,
                        mfgDate: formData.mfgDate || undefined,
                        expiryDate: formData.expiryDate || undefined,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    await storageService.addFootwear(detachedFootwear);
                    if (originalSize) {
                        await storageService.deleteStockFromProduct(editingId, originalSize);
                    }
                } else {
                    await storageService.updateFootwear(editingId, formData, originalSize || undefined);
                }
            } else {
                const newFootwear: Footwear = {
                    id: Date.now().toString(),
                    brandId: formData.brandId || '',
                    brandName: formData.brandName || '',
                    category: formData.category || 'Men',
                    type: formData.type || 'Casual',
                    size: formData.size || '',
                    color: formData.color || '',
                    section: formData.section || '',
                    rack: formData.rack || '',
                    shelf: formData.shelf || '',
                    subBrand: formData.subBrand || '',
                    article: formData.article || '',
                    gender: formData.gender || '',
                    purchasePrice: formData.purchasePrice || 0,
                    sellingPrice: formData.sellingPrice || 0,
                    gstPercent: formData.gstPercent || 0,
                    quantity: formData.quantity || 0,
                    mfgDate: formData.mfgDate || undefined,
                    expiryDate: formData.expiryDate || undefined,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                await storageService.addFootwear(newFootwear);
            }
            alert(editingId ? "Expiry Stock updated successfully!" : "Expiry Stock added successfully!");
            resetForm();
            await loadData();
        } catch (err: any) {
            alert(`Failed to save stock: ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                    <h1 className="text-3xl font-bold text-gray-800">Ready for Sale (Death/Expiry Stock)</h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="w-full sm:w-auto bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Expiry Stock
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-lg shadow-lg border border-orange-100 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                                    Insert Expiry Stock
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                    <select
                                        value={formData.brandId}
                                        onChange={(e) => handleBrandChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        required
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(brand => (
                                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Men' | 'Women' | 'Kids' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        required
                                    >
                                        <option value="Men">Men</option>
                                        <option value="Women">Women</option>
                                        <option value="Kids">Kids</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        required
                                    >
                                        <option value="Sports">Sports</option>
                                        <option value="Casual">Casual</option>
                                        <option value="Formal">Formal</option>
                                        <option value="Sandals">Sandals</option>
                                        <option value="Slippers">Slippers</option>
                                        <option value="Chappal">Chappal</option>
                                        <option value="Shoes">Shoes</option>
                                        <option value="Croks">Croks</option>
                                        <option value="Yuva">Yuva</option>
                                        <option value="Flipflop">Flipflop</option>
                                        <option value="Shocks">Shocks</option>
                                        <option value="Lose">Lose</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Brand</label>
                                    <input type="text" value={formData.subBrand || ''} onChange={(e) => setFormData({ ...formData, subBrand: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
                                    <input type="text" value={formData.article || ''} onChange={(e) => setFormData({ ...formData, article: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500" required />
                                </div>
                                {formData.category === 'Kids' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                        <select value={formData.gender || ''} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500">
                                            <option value="">Select Gender</option>
                                            <option value="Boy">Boy</option>
                                            <option value="Girl">Girl</option>
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                    <input type="text" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                    <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                    <input type="text" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rack</label>
                                    <input type="text" value={formData.rack} onChange={(e) => setFormData({ ...formData, rack: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shelf</label>
                                    <input type="text" value={formData.shelf} onChange={(e) => setFormData({ ...formData, shelf: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                                    <input type="number" value={formData.purchasePrice || ''} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value === '' ? 0 : parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                                    <input type="number" value={formData.sellingPrice || ''} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value === '' ? 0 : parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Stock)</label>
                                    <input type="number" value={formData.quantity || ''} onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GST (%)</label>
                                    <input type="number" value={formData.gstPercent || ''} onChange={(e) => setFormData({ ...formData, gstPercent: e.target.value === '' ? 0 : parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500" />
                                </div>
                                <div className="md:col-span-3 flex justify-end gap-3 mt-4 border-t pt-6">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 font-medium">
                                        Cancel
                                    </button>
                                    <button type="submit" className="bg-orange-600 text-white px-8 py-2 rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 font-medium shadow-sm transition-colors">
                                        Add to Expiry Stock
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                                        <td className="px-4 py-3 text-sm text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                {footwear.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
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
