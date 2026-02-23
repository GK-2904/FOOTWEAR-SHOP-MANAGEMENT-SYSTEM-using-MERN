export interface Footwear {
  id: string;
  brandId: string;
  brandName: string;
  category: 'Men' | 'Women' | 'Kids';
  type: string;
  size: string;
  color: string;
  section: string;
  rack: string;
  shelf: string;
  subBrand?: string;
  article?: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  gstPercent?: number;
  gender?: string;
  isReadyForSale?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  createdAt: string;
}

export interface BillItem {
  id?: string;
  footwearId: string;
  brandName: string;
  category: string;
  type: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  purchasePrice?: number;
  total: number;
  status?: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  items: BillItem[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  discountPercent: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod?: string;
  customerName?: string;
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
}

export interface DashboardStats {
  totalStock: number;
  totalBrands: number;
  lowStockItems: number;
  todaySales: number;
  monthlySales: number;
  totalBills: number;
}
