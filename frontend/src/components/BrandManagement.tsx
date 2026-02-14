import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Brand } from '../types';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

export function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState('');

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    const brandsData = await storageService.getBrands();
    setBrands(brandsData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandName.trim()) {
      alert('Please enter a brand name');
      return;
    }

    if (editingId) {
      await storageService.updateBrand(editingId, brandName);
    } else {
      const newBrand: Brand = {
        id: Date.now().toString(),
        name: brandName,
        createdAt: new Date().toISOString(),
      };
      await storageService.addBrand(newBrand);
    }

    resetForm();
    await loadBrands();
  };

  const handleEdit = (brand: Brand) => {
    setBrandName(brand.name);
    setEditingId(brand.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const footwear = await storageService.getFootwear();
    const hasFootwear = footwear.some(f => f.brandId === id);

    if (hasFootwear) {
      alert('Cannot delete brand. It has associated footwear items.');
      return;
    }

    if (confirm('Are you sure you want to delete this brand?')) {
      await storageService.deleteBrand(id);
      await loadBrands();
    }
  };

  const resetForm = () => {
    setBrandName('');
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Brand Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Brand' : 'Add New Brand'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800"
                placeholder="Enter brand name"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editingId ? 'Update' : 'Add'} Brand
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

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Tag className="w-6 h-6 text-slate-800" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Added: {new Date(brand.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {brands.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No brands added yet</p>
              <p className="text-sm mt-2">Click "Add Brand" to get started</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Categories & Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Categories:</h4>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Men</li>
              <li>Women</li>
              <li>Kids</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Types:</h4>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Sports</li>
              <li>Casual</li>
              <li>Formal</li>
              <li>Sandals</li>
              <li>Slippers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
