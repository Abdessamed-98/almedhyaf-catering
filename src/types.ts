export type ViewState = 'PORTAL' | 'WEBSITE' | 'ORDERING' | 'MINI_POS' | 'POS' | 'DELIVERY_APP';

export type WebsitePage =
  | 'HOME'
  | 'MENU'
  | 'DISHES'
  | 'BRANCHES'
  | 'ABOUT'
  | 'NEWS'
  | 'CONTACT'
  | 'CAREERS';

export interface MenuItem {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  image: string;
}

export interface Branch {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

// --- Ordering System Types ---

export type OrderType = 'DELIVERY' | 'PICKUP' | 'CAR_PICKUP' | 'DINE_IN';

export interface ModifierOption {
  id: number;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: number;
  name: string;
  min: number; // 0 for optional, 1 for required
  max: number; // 1 for single select, >1 for multiselect
  options: ModifierOption[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  calories?: number;
  modifiers?: ModifierGroup[];
}

export interface CartItem {
  cartId: string; // unique id for cart entry
  product: Product;
  quantity: number;
  selectedModifiers: Record<number, number[]>; // GroupID -> OptionID[]
  notes?: string;
}

// --- Mini POS Types ---

export type OrderSource = 'WEBSITE' | 'APP' | 'TALABAT' | 'HUNGERSTATION' | 'JAHEZ' | 'SUPPORT' | 'POS';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface POSOrder {
  id: string;
  source: OrderSource;
  type: OrderType;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  createdAt: Date;
  customerName?: string;
  tableId?: number;
  tableName?: string;
  isHeld?: boolean; // If the order is suspended/held
  notes?: string;
}

export interface Floor {
  id: number;
  name: string;
}

export interface Room {
  id: number;
  floorId: number;
  name: string;
}

export interface Table {
  id: number;
  roomId: number;
  floorId: number;
  name: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  currentOrderId?: string; // If occupied, link to the order
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'RECTANGLE' | 'ROUND';
}

export interface LayoutWall {
  id: string;
  floorId: number;
  x: number;
  y: number;
  length: number;
  thickness: number;
  rotation: number;
}
