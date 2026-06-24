import { Product, Floor, Room, Table, POSOrder } from '../types';

export const POS_MENU_ITEMS: Product[] = [
  {
    id: 1,
    name: 'Kabsa Chicken',
    description: 'Traditional Saudi Kabsa with Chicken',
    price: 45,
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=500',
    category: 'Main',
    modifiers: [
      {
        id: 1,
        name: 'Rice Type',
        min: 1,
        max: 1,
        options: [
          { id: 101, name: 'Peshawar (White)', price: 0 },
          { id: 102, name: 'Shaabi (Red)', price: 0 },
        ],
      },
      {
        id: 2,
        name: 'Add-ons',
        min: 0,
        max: 5,
        options: [
          { id: 201, name: 'Extra Pine Nuts', price: 5 },
          { id: 202, name: 'Fried Onions', price: 3 },
          { id: 203, name: 'Raisins', price: 2 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Kabsa Lamb',
    description: 'Traditional Saudi Kabsa with Lamb',
    price: 65,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500',
    category: 'Main',
    modifiers: [
      {
        id: 1,
        name: 'Rice Type',
        min: 1,
        max: 1,
        options: [
          { id: 101, name: 'Peshawar (White)', price: 0 },
          { id: 102, name: 'Shaabi (Red)', price: 0 },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Jareesh',
    description: 'Crushed wheat cooked with milk',
    price: 30,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=500',
    category: 'Sides',
  },
  {
    id: 4,
    name: 'Green Salad',
    description: 'Fresh mixed vegetables',
    price: 15,
    image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&q=80&w=500',
    category: 'Salads',
  },
  {
    id: 5,
    name: 'Pepsi',
    description: 'Carbonated soft drink',
    price: 5,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500',
    category: 'Drinks',
  },
  {
    id: 6,
    name: 'Water',
    description: 'Mineral Water',
    price: 2,
    image: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&q=80&w=500',
    category: 'Drinks',
  },
];

export const FLOORS: Floor[] = [
  { id: 1, name: 'Ground Floor' },
  { id: 2, name: 'First Floor' },
  { id: 3, name: 'Roof' },
];

export const ROOMS: Room[] = [
  { id: 1, floorId: 1, name: 'Main Hall' },
  { id: 2, floorId: 1, name: 'Family Section' },
  { id: 3, floorId: 2, name: 'VIP Rooms' },
  { id: 4, floorId: 3, name: 'Open Air' },
];

export const TABLES: Table[] = [
  // Ground Floor - Main Hall
  { id: 101, roomId: 1, floorId: 1, name: 'T-101', status: 'AVAILABLE', x: 60, y: 60, width: 80, height: 80, shape: 'RECTANGLE' },
  { id: 102, roomId: 1, floorId: 1, name: 'T-102', status: 'OCCUPIED', currentOrderId: 'ord-123', x: 200, y: 60, width: 80, height: 80, shape: 'RECTANGLE' },
  { id: 103, roomId: 1, floorId: 1, name: 'T-103', status: 'AVAILABLE', x: 360, y: 60, width: 80, height: 80, shape: 'RECTANGLE' },
  { id: 104, roomId: 1, floorId: 1, name: 'T-104', status: 'RESERVED', x: 500, y: 60, width: 80, height: 80, shape: 'RECTANGLE' },
  
  // Ground Floor - Family Section
  { id: 105, roomId: 2, floorId: 1, name: 'F-101', status: 'AVAILABLE', x: 60, y: 200, width: 100, height: 100, shape: 'ROUND' },
  { id: 106, roomId: 2, floorId: 1, name: 'F-102', status: 'AVAILABLE', x: 200, y: 200, width: 100, height: 100, shape: 'ROUND' },

  // First Floor - VIP
  { id: 201, roomId: 3, floorId: 2, name: 'VIP-1', status: 'AVAILABLE', x: 100, y: 100, width: 120, height: 120, shape: 'RECTANGLE' },
  { id: 202, roomId: 3, floorId: 2, name: 'VIP-2', status: 'OCCUPIED', currentOrderId: 'ord-124', x: 300, y: 100, width: 120, height: 120, shape: 'RECTANGLE' },

  // Roof
  { id: 301, roomId: 4, floorId: 3, name: 'R-01', status: 'AVAILABLE', x: 160, y: 160, width: 100, height: 100, shape: 'ROUND' },
];

export const MOCK_INCOMING_ORDERS: POSOrder[] = [
  {
    id: 'ord-web-001',
    source: 'WEBSITE',
    type: 'DELIVERY',
    status: 'PENDING',
    items: [
      { cartId: 'c1', product: POS_MENU_ITEMS[0], quantity: 2, selectedModifiers: {} },
      { cartId: 'c2', product: POS_MENU_ITEMS[4], quantity: 2, selectedModifiers: {} },
    ],
    total: 100,
    createdAt: new Date(),
    customerName: 'Ahmed Ali'
  },
  {
    id: 'ord-app-002',
    source: 'APP',
    type: 'PICKUP',
    status: 'CONFIRMED',
    items: [
      { cartId: 'c3', product: POS_MENU_ITEMS[1], quantity: 1, selectedModifiers: {} },
    ],
    total: 65,
    createdAt: new Date(),
    customerName: 'Sara Smith'
  },
  {
    id: 'ord-talabat-003',
    source: 'TALABAT',
    type: 'DELIVERY',
    status: 'PENDING',
    items: [
      { cartId: 'c4', product: POS_MENU_ITEMS[0], quantity: 1, selectedModifiers: {} },
      { cartId: 'c5', product: POS_MENU_ITEMS[3], quantity: 1, selectedModifiers: {} },
    ],
    total: 60,
    createdAt: new Date(),
    customerName: 'Talabat User #992'
  },
  {
    id: 'ord-support-004',
    source: 'SUPPORT',
    type: 'DELIVERY',
    status: 'PENDING',
    items: [
      { cartId: 'c6', product: POS_MENU_ITEMS[1], quantity: 3, selectedModifiers: {} },
    ],
    total: 195,
    createdAt: new Date(),
    customerName: 'VIP Customer (via Phone)'
  }
];
