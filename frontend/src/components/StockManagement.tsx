import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Footwear, Brand } from '../types';
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StockManagement() {
  const [footwear, setFootwear] = useState<Footwear[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<string | null>(null);
  const [originalProduct, setOriginalProduct] = useState<Partial<Footwear> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
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
    expiryDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [footwearData, brandsData] = await Promise.all([
      storageService.getFootwear(),
      storageService.getBrands()
    ]);
    setFootwear(footwearData);
    setBrands(brandsData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId && originalProduct) {
        // Check if generic non-size fields were altered to see if we need to detach this variant
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
          // If they changed the color or brand, create a NEW standalone product so old sizes aren't affected
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
          // Add the new mutated clone
          await storageService.addFootwear(detachedFootwear);
          // And delete the old variant size from the original product mapping
          if (originalSize) {
            // We can't use deleteFootwear directly as it drops the whole product. Need a specific deleteStock call.
            // By updating the old product stock to quantity 0 or deleting the size row, we sever it.
            await storageService.deleteStockFromProduct(editingId, originalSize);
          }
        } else {
          // Just updating the size/quantity, perfectly fine to patch the existing footprint natively
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

      resetForm();
      await loadData();
    } catch (err: any) {
      alert(`Validation Failed: ${err.message}`);
    }
  };

  const handleEdit = (item: Footwear) => {
    setFormData(item);
    setEditingId(item.id);
    setOriginalSize(item.size);
    setOriginalProduct(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
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
      expiryDate: '',
    });
    setEditingId(null);
    setOriginalSize(null);
    setOriginalProduct(null);
    setShowForm(false);
  };

  const handleBrandChange = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    setFormData({
      ...formData,
      brandId,
      brandName: brand?.name || '',
    });
  };

  const filteredFootwear = footwear.filter(item => {
    const matchesSearch =
      item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subBrand && item.subBrand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.article && item.article.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${item.section}-${item.rack}-${item.shelf}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !filterCategory || item.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Stock Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Stock
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Stock' : 'Add New Stock'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select
                value={formData.brandId}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              <input
                type="text"
                value={formData.subBrand || ''}
                onChange={(e) => setFormData({ ...formData, subBrand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
              <input
                type="text"
                value={formData.article || ''}
                onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            {formData.category === 'Kids' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Gender</option>
                  <option value="Boy">Boy</option>
                  <option value="Girl">Girl</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rack</label>
              <input
                type="text"
                value={formData.rack}
                onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shelf (Optional)</label>
              <input
                type="text"
                value={formData.shelf}
                onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
              <input
                type="number"
                value={formData.purchasePrice || ''}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
              <input
                type="number"
                value={formData.sellingPrice || ''}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST (%) (Optional)</label>
              <input
                type="number"
                value={formData.gstPercent || ''}
                onChange={(e) => setFormData({ ...formData, gstPercent: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacture Date (Optional)</label>
              <input
                type="date"
                value={formData.mfgDate || ''}
                onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={formData.expiryDate || ''}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Optional"
              />
            </div>

            <div className="md:col-span-3 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editingId ? 'Update' : 'Add'} Stock
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by brand, size, color, or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Categories</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost (Pur)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selling</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {filteredFootwear.filter(item => {
                  if (!item.expiryDate) return true;
                  return new Date(item.expiryDate) > new Date();
                }).map((item, index) => (
                  <motion.tr
                    key={`${item.id}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.brandName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.size}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.color}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {item.section}-{item.rack}-{item.shelf}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">₹{item.purchasePrice}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">₹{item.sellingPrice}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.quantity <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
