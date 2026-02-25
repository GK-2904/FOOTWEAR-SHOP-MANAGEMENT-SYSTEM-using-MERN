import { Footwear, Brand, Bill, User } from '../types';
import { api } from './api';

export const storageService = {
  // Footwear / Products
  async getFootwear(): Promise<Footwear[]> {
    const data = await api.get('/products');
    return data.map((item: {
      id: number, brand_id: number, brand_name: string, category_name: 'Men' | 'Women' | 'Kids',
      type: string, color: string, section: string, rack: string, shelf: string,
      purchase_price: string, selling_price: string, size: string, quantity: number,
      sub_brand?: string, article?: string, gst_percent?: string, gender?: string, mfg_date?: string, expiry_date?: string,
      created_at: string, updated_at: string
    }) => ({
      id: item.id.toString(),
      brandId: item.brand_id.toString(),
      brandName: item.brand_name,
      category: item.category_name,
      type: item.type as 'Sports' | 'Casual' | 'Formal' | 'Sandals' | 'Slippers',
      size: item.size || '',
      color: item.color,
      section: item.section,
      rack: item.rack,
      shelf: item.shelf,
      subBrand: item.sub_brand || '',
      article: item.article || '',
      purchasePrice: parseFloat(item.purchase_price),
      sellingPrice: parseFloat(item.selling_price),
      quantity: item.quantity || 0,
      gstPercent: item.gst_percent ? parseFloat(item.gst_percent) : 0,
      gender: item.gender || '',
      mfgDate: item.mfg_date ? new Date(item.mfg_date).toISOString().split('T')[0] : undefined,
      expiryDate: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  async addFootwear(footwear: Footwear): Promise<void> {
    const backendData = {
      brand_id: parseInt(footwear.brandId),
      category_id: footwear.category === 'Men' ? 1 : footwear.category === 'Women' ? 2 : 3,
      name: `${footwear.brandName} ${footwear.type}`,
      type: footwear.type,
      color: footwear.color,
      section: footwear.section,
      rack: footwear.rack,
      shelf: footwear.shelf,
      sub_brand: footwear.subBrand,
      article: footwear.article,
      purchase_price: footwear.purchasePrice,
      selling_price: footwear.sellingPrice,
      gst_percent: footwear.gstPercent,
      gender: footwear.gender,
      mfg_date: footwear.mfgDate,
      expiry_date: footwear.expiryDate,
      stock: [{ size: footwear.size, quantity: footwear.quantity }]
    };
    await api.post('/products', backendData);
  },

  async updateFootwear(id: string, updates: Partial<Footwear>, originalSize?: string): Promise<void> {
    const backendData: Record<string, unknown> = {};

    // Calculate name if brandName and type are available, otherwise we might need to fetch them
    // But assuming updates has them if coming from edit form
    if (updates.brandName && updates.type) {
      backendData.name = `${updates.brandName} ${updates.type}`;
    }

    if (updates.brandId) backendData.brand_id = parseInt(updates.brandId);
    if (updates.category) backendData.category_id = updates.category === 'Men' ? 1 : updates.category === 'Women' ? 2 : 3;
    if (updates.type) backendData.type = updates.type;
    if (updates.color) backendData.color = updates.color;
    if (updates.section) backendData.section = updates.section;
    if (updates.rack) backendData.rack = updates.rack;
    if (updates.shelf) backendData.shelf = updates.shelf;
    if (updates.subBrand !== undefined) backendData.sub_brand = updates.subBrand;
    if (updates.article !== undefined) backendData.article = updates.article;
    if (updates.purchasePrice !== undefined) backendData.purchase_price = updates.purchasePrice;
    if (updates.sellingPrice !== undefined) backendData.selling_price = updates.sellingPrice;
    if (updates.gstPercent !== undefined) backendData.gst_percent = updates.gstPercent;
    if (updates.gender !== undefined) backendData.gender = updates.gender;
    if (updates.mfgDate !== undefined) backendData.mfg_date = updates.mfgDate;
    if (updates.expiryDate !== undefined) backendData.expiry_date = updates.expiryDate;

    await api.put(`/products/${id}`, backendData);

    // Only hit the stock updater if size changed or we genuinely want to update the quantity
    if (updates.size !== undefined && updates.quantity !== undefined && (originalSize || updates.quantity >= 0)) {
      await api.put('/stock/update', {
        productId: parseInt(id),
        size: updates.size,
        quantity: updates.quantity,
        oldSize: originalSize
      });
    }
  },

  async deleteFootwear(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async deleteStockFromProduct(id: string, size: string): Promise<void> {
    await api.delete(`/stock/${id}/${size}`);
  },

  // Brands
  async getBrands(): Promise<Brand[]> {
    const data = await api.get('/brands');
    return data.map((b: { id: number, name: string, created_at: string }) => ({
      id: b.id.toString(),
      name: b.name,
      createdAt: b.created_at,
    }));
  },

  async addBrand(brand: Brand): Promise<void> {
    await api.post('/brands', { name: brand.name });
  },

  async updateBrand(id: string, name: string): Promise<void> {
    await api.put(`/brands/${id}`, { name });
  },

  async deleteBrand(id: string): Promise<void> {
    await api.delete(`/brands/${id}`);
  },

  // Bills
  async getBills(): Promise<Bill[]> {
    const data = await api.get('/bills');
    const bills = await Promise.all(data.map(async (b: {
      id: number, bill_number: string, subtotal: string, gst_percent: string,
      gst_amount: string, discount_percent: string, discount_amount: string,
      total_amount: string, payment_method: string, customer_name: string,
      bill_date: string, created_by: number
    }) => {
      // Fetch items for each bill
      const billDetails = await api.get(`/bills/${b.id}`);
      return {
        id: b.id.toString(),
        billNumber: b.bill_number,
        items: billDetails.items.map((item: {
          id: number,
          product_id: number,
          brand_name: string,
          category_name: string,
          type: string,
          product_type?: string,
          size: string,
          color: string,
          sub_brand?: string,
          article?: string,
          gender?: string,
          quantity: number,
          mrp?: string,
          purchase_price?: string,
          price: string,
          total: string,
          status: string
        }) => ({
          id: item.id?.toString(),
          footwearId: item.product_id.toString(),
          brandName: item.brand_name,
          category: item.category_name,
          type: item.product_type || item.type || '',
          size: item.size || '',
          color: item.color || '',
          subBrand: item.sub_brand || '',
          article: item.article || '',
          gender: item.gender || '',
          quantity: item.quantity || 0,
          mrp: parseFloat(item.mrp || item.price || '0'),
          purchasePrice: parseFloat(item.purchase_price || '0'),
          price: parseFloat(item.price || '0'),
          total: parseFloat(item.total),
          status: item.status,
        })),
        subtotal: parseFloat(b.subtotal),
        gstPercent: parseFloat(b.gst_percent),
        gstAmount: parseFloat(b.gst_amount),
        discountPercent: parseFloat(b.discount_percent),
        discountAmount: parseFloat(b.discount_amount),
        finalAmount: parseFloat(b.total_amount),
        paymentMethod: b.payment_method || 'Cash',
        customerName: b.customer_name || '',
        createdAt: b.bill_date,
        createdBy: b.created_by?.toString() || '',
      };
    }));
    return bills;
  },

  async addBill(bill: Bill): Promise<void> {
    const backendData = {
      bill_number: bill.billNumber,
      subtotal: bill.subtotal,
      gst_percent: bill.gstPercent,
      gst_amount: bill.gstAmount,
      discount_percent: bill.discountPercent,
      discount_amount: bill.discountAmount,
      total_amount: bill.finalAmount,
      payment_method: bill.paymentMethod || 'Cash',
      customer_name: bill.customerName || '',
      items: bill.items.map(item => ({
        product_id: parseInt(item.footwearId),
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        mrp: item.mrp || item.price,
        purchase_price: item.purchasePrice || 0,
        total: item.total
      }))
    };
    await api.post('/bills', backendData);
  },

  async returnItem(billId: string, itemId: string): Promise<void> {
    await api.post(`/bills/${billId}/items/${itemId}/return`, {});
  },

  async replaceItem(billId: string, itemId: string, newItem: BillItem): Promise<void> {
    const backendData = {
      newItem: {
        product_id: parseInt(newItem.footwearId),
        size: newItem.size,
        quantity: newItem.quantity,
        price: newItem.price,
        mrp: newItem.mrp || newItem.price,
        purchase_price: newItem.purchasePrice || 0,
        total: newItem.total
      }
    };
    await api.post(`/bills/${billId}/items/${itemId}/replace`, backendData);
  },

  // Reports
  async getCustomerProfit(): Promise<any[]> {
    return api.get('/reports/customer-profit');
  },
  async getProductProfit(): Promise<any[]> {
    return api.get('/reports/product-profit');
  },
  async getMonthlyProfit(): Promise<any[]> {
    return api.get('/reports/monthly-profit');
  },
  async getDailyProfit(): Promise<any[]> {
    return api.get('/reports/daily-profit');
  },
  async getCategoryProfit(): Promise<any[]> {
    return api.get('/reports/category-profit');
  },

  // Auth
  async login(username: string, password: string): Promise<{ token: string, user: User }> {
    const data = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('current_user', JSON.stringify(data.user));
    return data;
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem('current_user');
    const token = localStorage.getItem('token');
    if (!data || !token) return null;
    return JSON.parse(data);
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_user');
      localStorage.removeItem('token');
    }
  },

  initializeDefaultData(): void {
    // No longer needed as DB is initialized on backend
  },
};
