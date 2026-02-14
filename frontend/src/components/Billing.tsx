import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Footwear, BillItem, Bill } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Trash2, Printer, ShoppingCart } from 'lucide-react';

export function Billing() {
  const { user } = useAuth();
  const [footwear, setFootwear] = useState<Footwear[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<BillItem[]>([]);
  const [gstPercent, setGstPercent] = useState(5);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);

  useEffect(() => {
    loadFootwear();
  }, []);

  const loadFootwear = async () => {
    const data = await storageService.getFootwear();
    setFootwear(data.filter(f => f.quantity > 0));
  };

  const addToCart = (item: Footwear) => {
    const existingItem = cartItems.find(ci => ci.footwearId === item.id && ci.size === item.size);

    if (existingItem) {
      if (existingItem.quantity >= item.quantity) {
        alert('Not enough stock available');
        return;
      }
      setCartItems(
        cartItems.map(ci =>
          (ci.footwearId === item.id && ci.size === item.size)
            ? { ...ci, quantity: ci.quantity + 1, total: (ci.quantity + 1) * ci.price }
            : ci
        )
      );
    } else {
      const newItem: BillItem = {
        footwearId: item.id,
        brandName: item.brandName,
        category: item.category,
        type: item.type,
        size: item.size,
        color: item.color,
        quantity: 1,
        price: item.sellingPrice,
        total: item.sellingPrice,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const updateQuantity = (footwearId: string, size: string, quantity: number) => {
    const footwearItem = footwear.find(f => f.id === footwearId && f.size === size);
    if (!footwearItem) return;

    if (quantity > footwearItem.quantity) {
      alert('Not enough stock available');
      return;
    }

    if (quantity <= 0) {
      removeFromCart(footwearId, size);
      return;
    }

    setCartItems(
      cartItems.map(item =>
        (item.footwearId === footwearId && item.size === size)
          ? { ...item, quantity, total: quantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (footwearId: string, size: string) => {
    setCartItems(cartItems.filter(item => !(item.footwearId === footwearId && item.size === size)));
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const gstAmount = (subtotal * gstPercent) / 100;
    const discountAmount = (subtotal * discountPercent) / 100;
    const finalAmount = subtotal + gstAmount - discountAmount;

    return { subtotal, gstAmount, discountAmount, finalAmount };
  };

  const generateBill = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    const { subtotal, gstAmount, discountAmount, finalAmount } = calculateTotals();

    const billNumber = `BILL-${Date.now()}`;
    const bill: Bill = {
      id: Date.now().toString(),
      billNumber,
      items: cartItems,
      subtotal,
      gstPercent,
      gstAmount,
      discountPercent,
      discountAmount,
      finalAmount,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Admin',
    };

    await storageService.addBill(bill);
    setCurrentBill(bill);
    setShowInvoice(true);
    setCartItems([]);
    await loadFootwear();
  };

  const printInvoice = () => {
    window.print();
  };

  const closeInvoice = () => {
    setShowInvoice(false);
    setCurrentBill(null);
  };

  const filteredFootwear = footwear.filter(
    item =>
      item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { subtotal, gstAmount, discountAmount, finalAmount } = calculateTotals();

  if (showInvoice && currentBill) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-3xl font-bold text-gray-800">Invoice</h1>
          <div className="flex gap-2">
            <button
              onClick={printInvoice}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={closeInvoice}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
          <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
            <h2 className="text-3xl font-bold text-gray-800">SHIVAM FOOTWEAR</h2>
            <p className="text-gray-600 mt-2">Management System</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Bill Number:</p>
              <p className="font-semibold">{currentBill.billNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Date:</p>
              <p className="font-semibold">
                {new Date(currentBill.createdAt).toLocaleString()}
              </p>
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
              </tr>
            </thead>
            <tbody>
              {currentBill.items.map((item, index) => (
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
                  <td className="px-4 py-3 text-right font-medium">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{currentBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST ({currentBill.gstPercent}%):</span>
                  <span className="font-medium">₹{currentBill.gstAmount.toFixed(2)}</span>
                </div>
                {currentBill.discountPercent > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({currentBill.discountPercent}%):</span>
                    <span className="font-medium">-₹{currentBill.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-2">
                  <span>Final Amount:</span>
                  <span>₹{currentBill.finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Thank you for your purchase!</p>
            <p className="mt-2 text-lg font-semibold">Ramchandra Waghmare</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Billing / POS</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Select Items</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search footwear by brand, size, type, color..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredFootwear.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="border border-gray-200 rounded-lg p-4 hover:border-slate-800 cursor-pointer transition-colors"
                  onClick={() => addToCart(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.brandName}</h3>
                      <p className="text-sm text-gray-600">
                        {item.category} - {item.type}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      {item.quantity} in stock
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">
                      Size {item.size} - {item.color}
                    </span>
                    <span className="text-lg font-bold text-gray-900">₹{item.sellingPrice}</span>
                  </div>
                  <button className="w-full mt-3 bg-slate-800 text-white py-2 rounded hover:bg-slate-700 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-6 h-6 text-slate-800" />
              <h2 className="text-xl font-semibold">Cart</h2>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={`${item.footwearId}-${item.size}`} className="border-b border-gray-200 pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.brandName}</h3>
                        <p className="text-xs text-gray-600">
                          {item.category} - {item.type} - Size {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.footwearId, item.size)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.footwearId, item.size, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.footwearId, item.size, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold">₹{item.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bill Summary</h2>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST (%)</label>
                <input
                  type="number"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST ({gstPercent}%):</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-2">
                <span>Final Amount:</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={generateBill}
              disabled={cartItems.length === 0}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Generate Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
