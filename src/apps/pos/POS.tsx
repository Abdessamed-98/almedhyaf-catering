import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutGrid,
  ShoppingBag,
  Clock,
  PauseCircle,
  ChefHat,
  Printer,
  Search,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Utensils,
  MapPin,
  Smartphone,
  Globe,
  Phone,
  User,
  CheckCircle,
  XCircle,
  X,
  Filter,
  Settings,
  LogOut,
  RotateCw
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Button,
  Card,
  SectionHeader,
  Ornament,
  Pill,
  Badge,
  PriceTag,
  Field,
  Input,
  Textarea,
  QtyStepper,
  Sheet,
  EmptyState,
  useToast,
} from '../../ui';
import { 
  POSOrder, 
  CartItem, 
  Product, 
  Table, 
  Floor, 
  Room, 
  OrderSource, 
  OrderType,
  OrderStatus,
  LayoutWall
} from '../../types';
import { 
  POS_MENU_ITEMS, 
  FLOORS, 
  ROOMS, 
  TABLES, 
  MOCK_INCOMING_ORDERS 
} from '../../data/posData';

interface POSProps {
  onBackToPortal: () => void;
}

type POSView = 'TABLES' | 'ORDER_ENTRY' | 'ORDER_LIST' | 'HELD_ORDERS' | 'SETTINGS' | 'TABLE_LAYOUT';

const GRID_SIZE = 20;

const POS: React.FC<POSProps> = ({ onBackToPortal }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const toast = useToast();

  // Localized labels for enum values shown to the user.
  const statusLabel = (s: OrderStatus) => t('ord_status_' + s.toLowerCase());
  const tableStatusLabel = (s: Table['status']) => t('status_' + s.toLowerCase());
  const typeLabel = (ty: OrderType) => {
    const map: Record<OrderType, string> = {
      DELIVERY: 'ord_delivery', PICKUP: 'ord_pickup', CAR_PICKUP: 'ord_car', DINE_IN: 'ord_dinein',
    };
    return t(map[ty] || 'takeaway');
  };
  const sourceLabel = (s: OrderSource) => {
    const map: Partial<Record<OrderSource, string>> = {
      WEBSITE: 'source_website', APP: 'source_app', SUPPORT: 'source_support', POS: 'source_pos',
    };
    return map[s] ? t(map[s] as string) : s; // brand names (TALABAT, JAHEZ, HUNGERSTATION) stay as-is
  };

  const [activeView, setActiveView] = useState<POSView>('TABLES');
  const [previousView, setPreviousView] = useState<POSView | null>(null);
  
  // State for Order Entry
  const [currentOrder, setCurrentOrder] = useState<POSOrder | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // State for Tables
  const [selectedFloor, setSelectedFloor] = useState<number>(FLOORS[0].id);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [tables, setTables] = useState<Table[]>(TABLES);
  const [walls, setWalls] = useState<LayoutWall[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialResizeState, setInitialResizeState] = useState({ x: 0, y: 0, width: 0, height: 0, mouseX: 0, mouseY: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tableViewMode, setTableViewMode] = useState<'GRID' | 'LAYOUT'>('GRID');
  
  // State for Orders
  const [incomingOrders, setIncomingOrders] = useState<POSOrder[]>(MOCK_INCOMING_ORDERS);
  const [heldOrders, setHeldOrders] = useState<POSOrder[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderSource | 'ALL'>('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PENDING' | 'CANCELLED' | 'HISTORY'>('PENDING');
  const [heldOrderFilter, setHeldOrderFilter] = useState<OrderType | 'ALL'>('ALL');

  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempModifiers, setTempModifiers] = useState<Record<number, number[]>>({});
  const [tempQty, setTempQty] = useState(1);
  const [tempNotes, setTempNotes] = useState('');
  const [editingCartId, setEditingCartId] = useState<string | null>(null);

  // Customer & Note Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isOrderNoteModalOpen, setIsOrderNoteModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tempCustomerName, setTempCustomerName] = useState('');
  const [tempOrderNote, setTempOrderNote] = useState('');

  // --- Helper Functions ---

  const handleAddCustomer = () => {
    setTempCustomerName(currentOrder?.customerName || '');
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = () => {
    if (currentOrder) {
      setCurrentOrder({ ...currentOrder, customerName: tempCustomerName });
    }
    setIsCustomerModalOpen(false);
  };

  const handleAddOrderNote = () => {
    setTempOrderNote(currentOrder?.notes || '');
    setIsOrderNoteModalOpen(true);
  };

  const handleSaveOrderNote = () => {
    if (currentOrder) {
      setCurrentOrder({ ...currentOrder, notes: tempOrderNote });
    }
    setIsOrderNoteModalOpen(false);
  };

  const handleEditCartItem = (item: CartItem) => {
    setSelectedProduct(item.product);
    setTempModifiers(JSON.parse(JSON.stringify(item.selectedModifiers)));
    setTempQty(item.quantity);
    setTempNotes(item.notes || '');
    setEditingCartId(item.cartId);
  };

  const startNewOrder = (type: OrderType = 'TAKEAWAY', table?: Table) => {
    const newOrder: POSOrder = {
      id: `ord-${Date.now()}`,
      source: 'POS',
      type: type,
      status: 'PENDING',
      items: [],
      total: 0,
      createdAt: new Date(),
      tableId: table?.id,
      tableName: table?.name
    };
    setCurrentOrder(newOrder);
    setCartItems([]);
    setPreviousView('TABLES');
    setActiveView('ORDER_ENTRY');
  };

  const addItemToCart = (product: Product, quantity: number, modifiers: Record<number, number[]>, notes: string) => {
    setCartItems(prev => {
      // Check if same product with same modifiers exists
      const existingIndex = prev.findIndex(item => 
        item.product.id === product.id && 
        JSON.stringify(item.selectedModifiers) === JSON.stringify(modifiers) &&
        item.notes === notes
      );

      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

      return [...prev, { 
        cartId: `cart-${Date.now()}-${Math.random()}`, 
        product, 
        quantity, 
        selectedModifiers: modifiers,
        notes
      }];
    });
  };

  const handleProductClick = (product: Product) => {
    if (product.modifiers && product.modifiers.length > 0) {
      setSelectedProduct(product);
      setTempModifiers({});
      setTempQty(1);
      setTempNotes('');
    } else {
      addItemToCart(product, 1, {}, '');
    }
  };

  const removeFromCart = (cartId: string) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const calculateItemPrice = (item: CartItem) => {
    let price = item.product.price;
    Object.entries(item.selectedModifiers).forEach(([groupId, optionIds]) => {
        const group = item.product.modifiers?.find(g => g.id === Number(groupId));
        (optionIds as number[]).forEach(optId => {
            const opt = group?.options.find(o => o.id === optId);
            if (opt) price += opt.price;
        });
    });
    return price * item.quantity;
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  };

  const holdOrder = () => {
    if (!currentOrder || cartItems.length === 0) return;
    
    const orderToHold: POSOrder = {
      ...currentOrder,
      items: cartItems,
      total: calculateTotal(),
      status: 'PENDING',
      isHeld: true
    };
    
    setHeldOrders(prev => [...prev, orderToHold]);
    setCurrentOrder(null);
    setCartItems([]);
    setActiveView('TABLES'); // Or stay in ORDER_ENTRY but clear
  };

  const editOrder = (order: POSOrder) => {
    setCurrentOrder(order);
    setCartItems(JSON.parse(JSON.stringify(order.items))); // Deep copy items
    setPreviousView('ORDER_LIST');
    setActiveView('ORDER_ENTRY');
  };

  const resumeOrder = (order: POSOrder) => {
    // Load a held order back into the active cart and remove it from the held list.
    setCurrentOrder({ ...order, isHeld: false });
    setCartItems(JSON.parse(JSON.stringify(order.items))); // Deep copy items
    setHeldOrders(prev => prev.filter(o => o.id !== order.id));
    setPreviousView('HELD_ORDERS');
    setActiveView('ORDER_ENTRY');
  };

  const confirmOrder = () => {
    if (!currentOrder) return;
    
    const updatedOrder: POSOrder = {
      ...currentOrder,
      items: cartItems,
      total: calculateTotal(),
      status: currentOrder.status === 'PENDING' ? 'CONFIRMED' : currentOrder.status,
      isHeld: false
    };

    setIncomingOrders(prev => {
      const exists = prev.find(o => o.id === updatedOrder.id);
      if (exists) {
        return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
      }
      return [updatedOrder, ...prev];
    });

    toast(t('order_confirmed_kitchen'));
    setCurrentOrder(null);
    setCartItems([]);
    setActiveView('ORDER_LIST');
  };

  // --- Render Components ---

  const renderSidebar = () => {
    const navBtn = (active: boolean) =>
      `w-20 h-[88px] justify-center rounded-2xl transition-all flex flex-col items-center gap-1.5 ${
        active
          ? 'bg-secondary-500 text-ink shadow-lg shadow-black/30 ring-1 ring-secondary-300'
          : 'text-secondary-200/70 hover:bg-brand-700 hover:text-white'
      }`;
    const isTakeawayActive =
      activeView === 'ORDER_ENTRY' &&
      currentOrder?.type === 'TAKEAWAY' &&
      !currentOrder.id.startsWith('ord-web') &&
      !currentOrder.id.startsWith('ord-app') &&
      !currentOrder.id.startsWith('ord-talabat') &&
      !currentOrder.id.startsWith('ord-support');

    return (
      <div className="w-24 bg-brand-800 flex flex-col items-center py-6 gap-4 border-e border-brand-900/60">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-2">
          <span className="font-display text-2xl font-bold text-secondary-400 leading-none">ا</span>
          <span className="w-6 h-px bg-secondary-500/40 mt-1.5" />
        </div>

        <button onClick={() => setActiveView('TABLES')} className={navBtn(activeView === 'TABLES')}>
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-bold">{t('tables')}</span>
        </button>

        <button onClick={() => startNewOrder('TAKEAWAY')} className={navBtn(isTakeawayActive)}>
          <ShoppingBag className="w-6 h-6" />
          <span className="text-[10px] font-bold">{t('takeaway')}</span>
        </button>

        <button onClick={() => setActiveView('ORDER_LIST')} className={`relative ${navBtn(activeView === 'ORDER_LIST')}`}>
          <Clock className="w-6 h-6" />
          <span className="text-[10px] font-bold">{t('orders')}</span>
          {incomingOrders.length > 0 && (
            <span className="absolute top-1.5 end-2 w-3 h-3 bg-secondary-400 rounded-full border-2 border-brand-800"></span>
          )}
        </button>

        <button onClick={() => setActiveView('HELD_ORDERS')} className={`relative ${navBtn(activeView === 'HELD_ORDERS')}`}>
          <PauseCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold">{t('held')}</span>
          {heldOrders.length > 0 && (
            <span className="absolute top-1.5 end-2 w-4 h-4 bg-secondary-500 rounded-full text-[10px] text-ink flex items-center justify-center font-bold border border-brand-800">
              {heldOrders.length}
            </span>
          )}
        </button>

        <div className="flex-grow" />

        <button onClick={() => setActiveView('SETTINGS')} className={navBtn(activeView === 'SETTINGS')}>
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold">{t('settings')}</span>
        </button>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="flex-1 bg-parchment bg-pageBg p-8 overflow-auto">
      <SectionHeader title={t('settings')} align="start" className="mb-8" />

      <Card className="p-6 max-w-md space-y-3">
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center justify-between p-4 bg-pageBg hover:bg-brand-50 rounded-2xl transition-colors text-ink font-bold"
        >
          <span>{t('ord_language')}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{language === 'ar' ? 'العربية' : 'English'}</span>
            <Globe className="w-5 h-5 text-brand-600" />
          </div>
        </button>

        <button
          onClick={onBackToPortal}
          className="w-full flex items-center justify-between p-4 bg-pageBg hover:bg-brand-50 rounded-2xl transition-colors text-ink font-bold"
        >
          <span>{t('return_to_portal')}</span>
          <LogOut className="w-5 h-5 text-brand-600" />
        </button>
      </Card>
    </div>
  );

  const renderTables = () => {
    const filteredRooms = ROOMS.filter(r => r.floorId === selectedFloor);
    const filteredTables = tables.filter(t => 
      t.floorId === selectedFloor && (selectedRoom ? t.roomId === selectedRoom : true)
    );
    const filteredWalls = walls.filter(w => w.floorId === selectedFloor);

    const gridStatus = (s: Table['status']) =>
      s === 'OCCUPIED' ? 'bg-brand-50 border-2 border-brand-500 text-brand-700' :
      s === 'RESERVED' ? 'bg-secondary-50 border-2 border-secondary-500 text-secondary-700' :
      'bg-white border-2 border-success/60 text-green-700 hover:bg-green-50';

    return (
      <div className="flex-1 bg-parchment bg-pageBg p-8 overflow-auto flex flex-col">
        <div className="flex flex-col gap-6 mb-8">
          {/* Header Row */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <SectionHeader title={t('table_management')} align="start" />

            <div className="flex items-center gap-3 flex-wrap">
              {/* Edit Layout Button */}
              {tableViewMode === 'LAYOUT' && (
                <Button variant="outline" size="sm" onClick={() => setActiveView('TABLE_LAYOUT')}>
                  <Settings className="w-4 h-4" />
                  {t('edit_layout')}
                </Button>
              )}

              {/* View Toggle */}
              <div className="flex gap-2">
                <Pill active={tableViewMode === 'LAYOUT'} onClick={() => setTableViewMode('LAYOUT')}>
                  <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" />{t('view_layout')}</span>
                </Pill>
                <Pill active={tableViewMode === 'GRID'} onClick={() => setTableViewMode('GRID')}>
                  <span className="inline-flex items-center gap-2"><LayoutGrid className="w-4 h-4" />{t('view_grid')}</span>
                </Pill>
              </div>

              {/* Floor Toggle */}
              <div className="flex gap-2">
                {FLOORS.map(floor => (
                  <Pill
                    key={floor.id}
                    active={selectedFloor === floor.id}
                    onClick={() => { setSelectedFloor(floor.id); setSelectedRoom(null); }}
                  >
                    {floor.name}
                  </Pill>
                ))}
              </div>
            </div>
          </div>

          {/* Room Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Pill active={!selectedRoom} onClick={() => setSelectedRoom(null)}>{t('all_rooms')}</Pill>
            {filteredRooms.map(room => (
              <Pill key={room.id} active={selectedRoom === room.id} onClick={() => setSelectedRoom(room.id)}>
                {room.name}
              </Pill>
            ))}
          </div>
        </div>

        {tableViewMode === 'GRID' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredTables.map((table, i) => (
              <motion.button
                key={table.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4), type: 'spring', stiffness: 260, damping: 24 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startNewOrder('DINE_IN', table)}
                className={`aspect-square rounded-3xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm transition-colors hover:shadow-xl ${gridStatus(table.status)}`}
              >
                <div className="text-3xl font-display font-bold">{table.name}</div>
                <div className="text-xs font-bold uppercase tracking-widest">{tableStatusLabel(table.status)}</div>
                {table.status === 'OCCUPIED' && (
                  <Badge tone="maroon" className="mt-1">
                    {t('order_single')} #{table.currentOrderId}
                  </Badge>
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          <Card className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-5"
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Render Walls */}
            {filteredWalls.map(wall => (
              <div
                key={wall.id}
                style={{
                  position: 'absolute',
                  left: wall.x,
                  top: wall.y,
                  width: wall.length,
                  height: wall.thickness,
                  transform: `rotate(${wall.rotation}deg)`,
                  transformOrigin: 'center',
                  borderRadius: 9999,
                  zIndex: 0,
                  pointerEvents: 'none'
                }}
                className="bg-ink"
              />
            ))}

            {filteredTables.map(table => (
              <button
                key={table.id}
                onClick={() => startNewOrder('DINE_IN', table)}
                style={{
                  position: 'absolute',
                  left: table.x,
                  top: table.y,
                  width: table.width,
                  height: table.height,
                  borderRadius: table.shape === 'ROUND' ? '50%' : '12px',
                }}
                className={`flex flex-col items-center justify-center border-2 shadow-sm transition-all hover:scale-105 ${gridStatus(table.status)}`}
              >
                <span className="font-display font-bold text-lg">{table.name}</span>
                {table.status === 'OCCUPIED' && (
                  <span className="text-[10px] font-bold mt-1">#{table.currentOrderId}</span>
                )}
              </button>
            ))}
          </Card>
        )}
      </div>
    );
  };

  const renderProductModal = () => {
    if (!selectedProduct) return null;
    const basePrice = selectedProduct.price;
    // Calculate modal total
    let currentTotal = basePrice;
    Object.entries(tempModifiers).forEach(([groupId, optionIds]) => {
        const group = selectedProduct.modifiers?.find(g => g.id === Number(groupId));
        (optionIds as number[]).forEach(optId => {
            const opt = group?.options.find(o => o.id === optId);
            if(opt) currentTotal += opt.price;
        });
    });

    const confirmAddToCart = () => {
      if (!selectedProduct) return;
      
      if (editingCartId) {
        // Remove the old item first to allow merging if the updated item matches an existing one
        setCartItems(prev => prev.filter(item => item.cartId !== editingCartId));
        // Add the updated item (this will handle merging or creating a new item)
        addItemToCart(selectedProduct, tempQty, tempModifiers, tempNotes);
        setEditingCartId(null);
      } else {
        addItemToCart(selectedProduct, tempQty, tempModifiers, tempNotes);
      }

      setSelectedProduct(null);
      setTempModifiers({});
      setTempQty(1);
      setTempNotes('');
    };

    const closeSheet = () => {
      setSelectedProduct(null);
      setEditingCartId(null);
    };

    return (
      <Sheet open={!!selectedProduct} onClose={closeSheet} className="max-w-3xl">
        <div className="flex flex-col">
          {/* Header */}
          <div className="px-6 pt-2 pb-5">
            <div className="flex gap-5 items-center">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm bg-pageBg flex-shrink-0">
                <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-display font-bold text-ink mb-1 truncate">{selectedProduct.name}</h2>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{selectedProduct.description}</p>
                <PriceTag amount={basePrice} currency={t('sar')} className="text-xl mt-2 block" />
              </div>
              <button onClick={closeSheet} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors self-start">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <Ornament className="mt-5" />
          </div>

          {/* Scrollable Modifiers */}
          <div className="px-6 pb-4 space-y-7">
            {selectedProduct.modifiers?.map(group => (
              <div key={group.id}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-display font-bold text-lg text-ink">{group.name}</h3>
                  <Badge tone={group.min > 0 ? 'maroon' : 'muted'}>
                    {group.min > 0 ? t('required') : t('optional')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.options.map(option => {
                    const isSelected = tempModifiers[group.id]?.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          const current = tempModifiers[group.id] || [];
                          if (group.max === 1) {
                            // Single select
                            setTempModifiers({ ...tempModifiers, [group.id]: [option.id] });
                          } else {
                            // Multi select
                            if (isSelected) {
                              setTempModifiers({ ...tempModifiers, [group.id]: current.filter(id => id !== option.id) });
                            } else if (current.length < group.max) {
                              setTempModifiers({ ...tempModifiers, [group.id]: [...current, option.id] });
                            }
                          }
                        }}
                        className={`relative p-4 rounded-2xl border-2 text-start transition-all duration-200 flex flex-col justify-between h-full ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50 shadow-md'
                            : 'border-gray-100 bg-white hover:border-secondary-300 hover:bg-pageBg'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full mb-2">
                          <span className={`font-bold ${isSelected ? 'text-brand-900' : 'text-gray-700'}`}>{option.name}</span>
                          {isSelected && <CheckCircle className="w-5 h-5 text-brand-600 fill-brand-100" />}
                        </div>
                        {option.price > 0 ? (
                          <span className={`text-sm font-medium ${isSelected ? 'text-brand-700' : 'text-gray-500'}`}>+{option.price} {t('sar')}</span>
                        ) : (
                          <span className="text-sm text-gray-400">{t('free')}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity + Notes */}
            <div className="flex items-center justify-between pt-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t('quantity')}</label>
              <QtyStepper value={tempQty} onChange={setTempQty} min={1} />
            </div>

            <Field label={t('notes')} htmlFor="prod-notes" className="pt-2 border-t border-gray-100">
              <Textarea
                id="prod-notes"
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                rows={3}
                placeholder={t('special_instructions')}
              />
            </Field>
          </div>

          {/* Footer Action */}
          <div className="sticky bottom-0 p-5 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <Button variant="primary" size="lg" block onClick={confirmAddToCart} className="justify-between px-8">
              <span>{editingCartId ? t('update') : t('add_to_cart')}</span>
              <span>{(currentTotal * tempQty).toFixed(2)} {t('sar')}</span>
            </Button>
          </div>
        </div>
      </Sheet>
    );
  };

  const renderOrderEntry = () => {
    const categories = Array.from(new Set(POS_MENU_ITEMS.map(i => i.category)));
    const filteredItems = selectedCategory === 'All' 
      ? POS_MENU_ITEMS 
      : POS_MENU_ITEMS.filter(i => i.category === selectedCategory);

    return (
      <div className="flex-1 flex h-screen overflow-hidden">
        {/* Menu Grid */}
        <div className="flex-1 bg-parchment bg-pageBg flex flex-col h-full">
          {/* Categories */}
          <div className="p-4 bg-white shadow-sm border-b border-gray-100 overflow-x-auto flex gap-2 items-center">
            <button
              onClick={() => setActiveView(previousView || 'TABLES')}
              className="p-3 rounded-full bg-pageBg hover:bg-brand-50 text-brand-700 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
            <Pill active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')}>{t('all')}</Pill>
            {categories.map(cat => (
              <Pill key={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
                {cat}
              </Pill>
            ))}
          </div>

          {/* Items Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4), type: 'spring', stiffness: 260, damping: 24 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProductClick(item)}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col text-start group"
                >
                  <div className="h-32 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-ink mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                    </div>
                    <PriceTag amount={item.price} currency={t('sar')} className="mt-3 text-lg" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-96 bg-white border-s border-gray-200 flex flex-col h-full shadow-xl z-10">
          {/* Order Header */}
          <div className="p-4 border-b border-gray-100 bg-brand-800 text-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-display font-bold text-lg">
                {currentOrder?.type === 'DINE_IN' ? `${t('table_single')} ${currentOrder.tableName}` : t('order_single')}
              </h3>
              <Badge tone="gold">{currentOrder?.id}</Badge>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddCustomer}
                className={`flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${currentOrder?.customerName ? 'bg-secondary-500 text-ink' : 'bg-brand-700 text-secondary-100 hover:bg-brand-600'}`}
              >
                <User className="w-3.5 h-3.5" />
                {currentOrder?.customerName || t('add_customer')}
              </button>
              <button
                onClick={handleAddOrderNote}
                className={`flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${currentOrder?.notes ? 'bg-secondary-500 text-ink' : 'bg-brand-700 text-secondary-100 hover:bg-brand-600'}`}
              >
                <Utensils className="w-3.5 h-3.5" />
                {currentOrder?.notes ? t('edit_note') : t('add_note')}
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-pageBg">
            {cartItems.length === 0 ? (
              <EmptyState icon={ShoppingBag} title={t('cart_empty')} />
            ) : (
              cartItems.map(item => (
                <div
                  key={item.cartId}
                  className={`flex gap-3 bg-white p-3 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${editingCartId === item.cartId ? 'border-brand-500 ring-1 ring-brand-500 bg-brand-50' : 'border-gray-100'}`}
                  onClick={() => handleEditCartItem(item)}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1 gap-2">
                      <span className="font-bold text-sm text-ink truncate">{item.product.name}</span>
                      <span className="font-bold text-sm text-brand-700 whitespace-nowrap">{calculateItemPrice(item).toFixed(2)}</span>
                    </div>

                    {/* Modifiers Display */}
                    {(Object.keys(item.selectedModifiers).length > 0 || item.notes) && (
                      <div className="text-xs text-gray-500 mb-2 space-y-0.5 bg-pageBg p-2 rounded-xl border border-gray-100">
                        {Object.entries(item.selectedModifiers).map(([groupId, optionIds]) => {
                           const group = item.product.modifiers?.find(g => g.id === Number(groupId));
                           return (optionIds as number[]).map(optId => {
                             const opt = group?.options.find(o => o.id === optId);
                             return opt ? <div key={optId}>• {opt.name}</div> : null;
                           });
                        })}
                        {item.notes && <div className="italic text-gray-400 mt-1">"{item.notes}"</div>}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div onClick={(e) => e.stopPropagation()}>
                        <QtyStepper value={item.quantity} min={0} onChange={(next) => updateQuantity(item.cartId, next - item.quantity)} />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.cartId); }} className="text-gray-400 hover:text-brand-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Actions */}
          <div className="p-4 border-t border-gray-200 bg-white space-y-3">
            <div className="flex justify-between items-center text-lg font-bold text-ink">
              <span>{t('total')}</span>
              <PriceTag amount={calculateTotal().toFixed(2)} currency={t('sar')} className="text-xl" />
            </div>

            {currentOrder?.status === 'PENDING' ? (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" block onClick={() => currentOrder && rejectOrder(currentOrder.id)}>
                  {t('reject')}
                </Button>
                <Button variant="primary" block onClick={() => currentOrder && acceptOrder(currentOrder.id)}>
                  {t('accept')}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="gold" block onClick={holdOrder}>
                    <PauseCircle className="w-5 h-5" />
                    {t('hold')}
                  </Button>
                  <Button variant="outline" block onClick={() => toast(t('order_sent_to_kitchen'))}>
                    <ChefHat className="w-5 h-5" />
                    {t('kitchen')}
                  </Button>
                </div>

                <Button variant="primary" size="lg" block onClick={confirmOrder}>
                  {t('pay_confirm')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTableLayoutEditor = () => {
    const floorTables = tables.filter(t => t.floorId === selectedFloor);
    const floorWalls = walls.filter(w => w.floorId === selectedFloor);
    const selectedTable = tables.find(t => t.id === selectedTableId);
    const selectedWall = walls.find(w => w.id === selectedWallId);

    const snapWall = (x: number, y: number, length: number, rotation: number) => {
      const T = 10;
      const isVertical = rotation === 90 || rotation === 270;

      // Snap Length to 20k + 10 (ensure odd multiple of 10 for perfect grid fit with T=10)
      const k_L = Math.round((length - T) / GRID_SIZE);
      const snappedLength = Math.max(GRID_SIZE + T, k_L * GRID_SIZE + T);

      let snappedX, snappedY;

      if (isVertical) {
        // Vertical: Center X on Grid, Top Cap Y on Grid
        const centerX = x + snappedLength / 2;
        const k_X = Math.round(centerX / GRID_SIZE);
        snappedX = k_X * GRID_SIZE - snappedLength / 2;

        const topCapY = y + T - snappedLength / 2;
        const k_Y = Math.round(topCapY / GRID_SIZE);
        snappedY = k_Y * GRID_SIZE - T + snappedLength / 2;
      } else {
        // Horizontal: Left Cap X on Grid, Spine Y on Grid
        const leftCapX = x + T / 2;
        const k_X = Math.round(leftCapX / GRID_SIZE);
        snappedX = k_X * GRID_SIZE - T / 2;

        const spineY = y + T / 2;
        const k_Y = Math.round(spineY / GRID_SIZE);
        snappedY = k_Y * GRID_SIZE - T / 2;
      }

      return { x: snappedX, y: snappedY, length: snappedLength };
    };

    const handleMouseDown = (e: React.MouseEvent, type: 'TABLE' | 'WALL', id: number | string, x: number, y: number) => {
      if (e.button !== 0) return; // Only left click
      e.stopPropagation();
      
      if (type === 'TABLE') {
        setSelectedTableId(id as number);
        setSelectedWallId(null);
      } else {
        setSelectedWallId(id as string);
        setSelectedTableId(null);
      }
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - x,
        y: e.clientY - y
      });
    };

    const handleResizeStart = (e: React.MouseEvent, handle: string, item: Table | LayoutWall) => {
      e.stopPropagation();
      setIsResizing(true);
      setResizeHandle(handle);
      
      setInitialResizeState({
        x: item.x,
        y: item.y,
        width: 'length' in item ? item.length : item.width,
        height: 'thickness' in item ? item.thickness : item.height,
        mouseX: e.clientX,
        mouseY: e.clientY,
        rotation: 'rotation' in item ? item.rotation : 0
      });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (isResizing && resizeHandle) {
        const dx = e.clientX - initialResizeState.mouseX;
        const dy = e.clientY - initialResizeState.mouseY;
        
        let newWidth = initialResizeState.width;
        let newHeight = initialResizeState.height;
        let newX = initialResizeState.x;
        let newY = initialResizeState.y;

        if (selectedWallId) {
           const wall = walls.find(w => w.id === selectedWallId);
           if (!wall) return;

           const isVertical = wall.rotation === 90 || wall.rotation === 270;
           
           // Calculate new length based on drag
           let newLength = initialResizeState.width; // width stores length in initial state
           let dLength = 0;

           if (isVertical) {
             if (resizeHandle === 'e') {
                // Dragging Bottom: Increase length
                dLength = dy;
             } else if (resizeHandle === 'w') {
                // Dragging Top: Increase length (negative dy)
                dLength = -dy;
             }
           } else {
             // Horizontal
             if (resizeHandle === 'e') {
               dLength = dx;
             } else if (resizeHandle === 'w') {
               dLength = -dx;
             }
           }

           // Calculate raw new length
           let rawNewLength = newLength + dLength;
           
           // Snap length to 20k + 10
           const T = 10;
           const k_L = Math.round((rawNewLength - T) / GRID_SIZE);
           let snappedLength = Math.max(GRID_SIZE + T, k_L * GRID_SIZE + T);
           
           // Calculate effective delta length
           let effectiveDLength = snappedLength - newLength;

           // Apply position shifts based on handle to keep fixed end stationary
           if (isVertical) {
             if (resizeHandle === 'e') {
                // Bottom dragged: Top fixed
                newX -= effectiveDLength / 2;
                newY += effectiveDLength / 2;
             } else if (resizeHandle === 'w') {
                // Top dragged: Bottom fixed
                newX -= effectiveDLength / 2;
                newY -= effectiveDLength / 2;
             }
           } else {
             // Horizontal
             if (resizeHandle === 'e') {
               // Right dragged: Left fixed. 
               // x is unchanged for Horizontal Right Drag
             } else if (resizeHandle === 'w') {
               // Left dragged: Right fixed.
               newX -= effectiveDLength;
             }
           }
           
           // Snap position to half-grid (10px) to allow for center shifts
           // This is crucial for keeping edges aligned with the grid when length changes by odd multiples of grid size
           // newX = Math.round(newX / (GRID_SIZE / 2)) * (GRID_SIZE / 2);
           // newY = Math.round(newY / (GRID_SIZE / 2)) * (GRID_SIZE / 2);
           
           setWalls(prev => prev.map(w => 
             w.id === selectedWallId ? { ...w, x: newX, y: newY, length: snappedLength } : w
           ));
           return;
        }

        const isRound = selectedTableId && tables.find(t => t.id === selectedTableId)?.shape === 'ROUND';

        if (isRound) {
          // For round tables, resize proportionally based on the handle
          // We only support corner resizing for round tables to keep it simple
          const delta = Math.max(Math.abs(dx), Math.abs(dy)) * (dx > 0 || dy > 0 ? 1 : -1);
          
          if (resizeHandle.includes('e') || resizeHandle.includes('s')) {
             newWidth += delta;
             newHeight += delta;
          } else {
             newWidth -= delta;
             newHeight -= delta;
             newX -= delta;
             newY -= delta;
          }
        } else {
          // Rectangle resizing
          if (resizeHandle.includes('e')) newWidth += dx;
          if (resizeHandle.includes('w')) {
            newWidth -= dx;
            newX += dx;
          }
          if (resizeHandle.includes('s')) newHeight += dy;
          if (resizeHandle.includes('n')) {
            newHeight -= dy;
            newY += dy;
          }
        }

        // Snap to grid
        newWidth = Math.max(GRID_SIZE, Math.round(newWidth / GRID_SIZE) * GRID_SIZE);
        newHeight = Math.max(GRID_SIZE, Math.round(newHeight / GRID_SIZE) * GRID_SIZE);
        newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
        newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

        if (selectedTableId) {
          setTables(prev => prev.map(t => 
            t.id === selectedTableId ? { ...t, x: newX, y: newY, width: newWidth, height: isRound ? newWidth : newHeight } : t
          ));
        }
      } else if (isDragging) {
        const rawX = e.clientX - dragOffset.x;
        const rawY = e.clientY - dragOffset.y;
        
        // Snap to grid (20px)
        const newX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
        const newY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
        
        if (selectedTableId) {
          setTables(prev => prev.map(t => 
            t.id === selectedTableId ? { ...t, x: newX, y: newY } : t
          ));
        } else if (selectedWallId) {
          const wall = walls.find(w => w.id === selectedWallId);
          if (wall) {
            const snapped = snapWall(rawX, rawY, wall.length, wall.rotation);
            setWalls(prev => prev.map(w => 
              w.id === selectedWallId ? { ...w, x: snapped.x, y: snapped.y } : w
            ));
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    const addTable = () => {
      const newTable: Table = {
        id: Date.now(),
        roomId: ROOMS.find(r => r.floorId === selectedFloor)?.id || 1,
        floorId: selectedFloor,
        name: `T-${floorTables.length + 1}`,
        status: 'AVAILABLE',
        x: 100,
        y: 100,
        width: 80,
        height: 80,
        shape: 'RECTANGLE'
      };
      setTables([...tables, newTable]);
      setSelectedTableId(newTable.id);
      setSelectedWallId(null);
    };

    const addWall = () => {
      const newWall: LayoutWall = {
        id: `wall-${Date.now()}`,
        floorId: selectedFloor,
        x: 100,
        y: 100,
        length: 100,
        thickness: 10,
        rotation: 0
      };
      setWalls([...walls, newWall]);
      setSelectedWallId(newWall.id);
      setSelectedTableId(null);
    };

    const updateSelectedTable = (updates: Partial<Table>) => {
      if (!selectedTableId) return;
      setTables(prev => prev.map(t => 
        t.id === selectedTableId ? { ...t, ...updates } : t
      ));
    };

    const updateSelectedWall = (updates: Partial<LayoutWall>) => {
      if (!selectedWallId) return;
      setWalls(prev => prev.map(w => 
        w.id === selectedWallId ? { ...w, ...updates } : w
      ));
    };

    const deleteSelected = () => {
      if (selectedTableId) {
        if (window.confirm(t('confirm_delete_table'))) {
          setTables(prev => prev.filter(t => t.id !== selectedTableId));
          setSelectedTableId(null);
        }
      } else if (selectedWallId) {
        setWalls(prev => prev.filter(w => w.id !== selectedWallId));
        setSelectedWallId(null);
      }
    };

    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-pageBg" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        {/* Top Bar Controls */}
        <div className="w-full bg-white border-b border-gray-200 p-4 flex flex-col gap-4 z-10 shadow-md h-[180px] flex-none">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveView('TABLES')} className="p-2 hover:bg-brand-50 text-brand-700 rounded-full">
                <ArrowLeft className="w-6 h-6 rotate-180" />
              </button>
              <h2 className="text-xl font-display font-bold text-brand-800">{t('edit_layout')}</h2>
            </div>

            {/* Floor Selection */}
            <div className="flex flex-wrap gap-2">
              {FLOORS.map(floor => (
                <Pill key={floor.id} active={selectedFloor === floor.id} onClick={() => setSelectedFloor(floor.id)}>
                  {floor.name}
                </Pill>
              ))}
            </div>
          </div>

          <div className="flex gap-4 items-start flex-wrap content-start h-full">
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={addTable}>
                <Plus className="w-4 h-4" />
                {t('add_table')}
              </Button>
              <Button variant="gold" size="sm" onClick={addWall}>
                <Plus className="w-4 h-4" />
                {t('add_wall')}
              </Button>
            </div>

            <div className="w-px bg-gray-200 h-8 mx-2 hidden sm:block"></div>

            {selectedTable && (
              <div className="flex gap-4 items-end flex-1 overflow-x-auto pb-2 sm:pb-0">
                <Field label={t('table_name')} htmlFor="tbl-name" className="min-w-[150px]">
                  <Input
                    id="tbl-name"
                    type="text"
                    value={selectedTable.name}
                    onChange={(e) => updateSelectedTable({ name: e.target.value })}
                    className="py-2"
                  />
                </Field>

                {selectedTable.shape === 'ROUND' ? (
                  <Field label={t('width')} htmlFor="tbl-w" className="min-w-[100px]">
                    <Input
                      id="tbl-w"
                      type="number"
                      value={selectedTable.width / GRID_SIZE}
                      onChange={(e) => {
                        const size = parseInt(e.target.value) * GRID_SIZE;
                        updateSelectedTable({ width: size, height: size });
                      }}
                      className="py-2"
                    />
                  </Field>
                ) : (
                  <>
                    <Field label={t('width')} htmlFor="tbl-w" className="min-w-[100px]">
                      <Input
                        id="tbl-w"
                        type="number"
                        value={selectedTable.width / GRID_SIZE}
                        onChange={(e) => updateSelectedTable({ width: parseInt(e.target.value) * GRID_SIZE })}
                        className="py-2"
                      />
                    </Field>
                    <Field label={t('height')} htmlFor="tbl-h" className="min-w-[100px]">
                      <Input
                        id="tbl-h"
                        type="number"
                        value={selectedTable.height / GRID_SIZE}
                        onChange={(e) => updateSelectedTable({ height: parseInt(e.target.value) * GRID_SIZE })}
                        className="py-2"
                      />
                    </Field>
                  </>
                )}

                <div className="min-w-[150px]">
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('table_shape')}</label>
                  <div className="flex gap-2">
                    <Pill active={selectedTable.shape === 'RECTANGLE'} onClick={() => updateSelectedTable({ shape: 'RECTANGLE' })} className="flex-1 text-xs">
                      {t('shape_rectangle')}
                    </Pill>
                    <Pill active={selectedTable.shape === 'ROUND'} onClick={() => updateSelectedTable({ shape: 'ROUND' })} className="flex-1 text-xs">
                      {t('shape_round')}
                    </Pill>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={deleteSelected} aria-label={t('delete') || 'delete'}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            {selectedWall && (
              <div className="flex gap-4 items-end flex-1 overflow-x-auto pb-2 sm:pb-0">
                <Field label={t('wall_length')} htmlFor="wall-len" className="min-w-[100px]">
                  <Input
                    id="wall-len"
                    type="number"
                    value={selectedWall.length / GRID_SIZE}
                    onChange={(e) => updateSelectedWall({ length: parseInt(e.target.value) * GRID_SIZE })}
                    className="py-2"
                  />
                </Field>
                <div className="min-w-[150px]">
                  <label className="text-sm font-bold text-gray-700 mb-2 block">{t('wall_rotation')}</label>
                  <Button
                    variant="outline"
                    size="sm"
                    block
                    onClick={() => updateSelectedWall({ rotation: selectedWall.rotation === 0 ? 90 : 0 })}
                  >
                    <RotateCw className="w-4 h-4" />
                    {selectedWall.rotation === 0 ? t('horizontal') : t('vertical')}
                  </Button>
                </div>

                <Button variant="outline" size="sm" onClick={deleteSelected}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-white cursor-crosshair" onClick={() => { setSelectedTableId(null); setSelectedWallId(null); }}>
          <div className="absolute inset-0 pointer-events-none opacity-10" 
               style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>
          
          {floorWalls.map(wall => (
            <div
              key={wall.id}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => handleMouseDown(e, 'WALL', wall.id, wall.x, wall.y)}
              style={{
                position: 'absolute',
                left: wall.x,
                top: wall.y,
                width: wall.length,
                height: wall.thickness,
                transform: `rotate(${wall.rotation}deg)`,
                transformOrigin: 'center',
                borderRadius: 9999,
                cursor: isDragging && selectedWallId === wall.id ? 'grabbing' : 'grab',
                zIndex: selectedWallId === wall.id ? 5 : 0
              }}
              className={`bg-gray-800 transition-shadow ${
                selectedWallId === wall.id 
                  ? 'shadow-xl ring-2 ring-brand-400' 
                  : 'hover:bg-gray-700'
              }`}
            >
              {selectedWallId === wall.id && (
                <>
                  {/* Length Handles */}
                  {/* Horizontal Handles (for 0/180 deg) */}
                  {(wall.rotation === 0 || wall.rotation === 180) && (
                    <>
                      <div
                        onMouseDown={(e) => { e.preventDefault(); handleResizeStart(e, 'w', wall); }}
                        className="absolute w-3 h-3 bg-white border border-brand-600 rounded-full z-20 cursor-ew-resize"
                        style={{ top: '50%', left: -6, marginTop: -6 }}
                      />
                      <div
                        onMouseDown={(e) => { e.preventDefault(); handleResizeStart(e, 'e', wall); }}
                        className="absolute w-3 h-3 bg-white border border-brand-600 rounded-full z-20 cursor-ew-resize"
                        style={{ top: '50%', right: -6, marginTop: -6 }}
                      />
                    </>
                  )}
                  
                  {/* Vertical Handles (for 90/270 deg) */}
                  {(wall.rotation === 90 || wall.rotation === 270) && (
                    <>
                      <div
                        onMouseDown={(e) => { e.preventDefault(); handleResizeStart(e, 'w', wall); }}
                        className="absolute w-3 h-3 bg-white border border-brand-600 rounded-full z-20 cursor-ns-resize"
                        style={{ top: '50%', left: -6, marginTop: -6 }}
                      />
                      <div
                        onMouseDown={(e) => { e.preventDefault(); handleResizeStart(e, 'e', wall); }}
                        className="absolute w-3 h-3 bg-white border border-brand-600 rounded-full z-20 cursor-ns-resize"
                        style={{ top: '50%', right: -6, marginTop: -6 }}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          ))}

          {floorTables.map(table => (
            <div
              key={table.id}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => handleMouseDown(e, 'TABLE', table.id, table.x, table.y)}
              style={{
                position: 'absolute',
                left: table.x,
                top: table.y,
                width: table.width,
                height: table.height,
                borderRadius: table.shape === 'ROUND' ? '50%' : '12px',
                cursor: isDragging && selectedTableId === table.id ? 'grabbing' : 'grab',
                zIndex: selectedTableId === table.id ? 10 : 1
              }}
              className={`flex items-center justify-center border-2 shadow-sm transition-shadow ${
                selectedTableId === table.id 
                  ? 'border-brand-600 bg-brand-50 shadow-xl ring-2 ring-brand-200' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <span className="font-bold text-gray-700 select-none pointer-events-none">{table.name}</span>
              
              {selectedTableId === table.id && (
                <>
                  {/* Resize Handles */}
                  {table.shape === 'ROUND' ? (
                    <>
                      {['nw', 'ne', 'sw', 'se'].map(handle => (
                        <div
                          key={handle}
                          onMouseDown={(e) => handleResizeStart(e, handle, table)}
                          className="absolute w-3 h-3 bg-white border border-brand-600 rounded-full z-20"
                          style={{
                            top: handle.includes('n') ? -6 : undefined,
                            bottom: handle.includes('s') ? -6 : undefined,
                            left: handle.includes('w') ? -6 : undefined,
                            right: handle.includes('e') ? -6 : undefined,
                            cursor: 'nwse-resize' // Simplified cursor for round
                          }}
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      {['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'].map(handle => (
                        <div
                          key={handle}
                          onMouseDown={(e) => handleResizeStart(e, handle, table)}
                          className="absolute w-3 h-3 bg-white border border-brand-600 rounded-full z-20"
                          style={{
                            top: handle.includes('n') ? -6 : handle.includes('s') ? undefined : '50%',
                            bottom: handle.includes('s') ? -6 : undefined,
                            left: handle.includes('w') ? -6 : handle.includes('e') ? undefined : '50%',
                            right: handle.includes('e') ? -6 : undefined,
                            marginTop: !handle.includes('n') && !handle.includes('s') ? -6 : undefined,
                            marginLeft: !handle.includes('w') && !handle.includes('e') ? -6 : undefined,
                            cursor: `${handle}-resize`
                          }}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const acceptOrder = (orderId: string) => {
    setIncomingOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'PREPARING' } 
        : order
    ));
    
    if (currentOrder?.id === orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status: 'PREPARING' } : null);
    }

    // In a real app, this would trigger a kitchen print
    toast(t('order_sent_to_kitchen'));
  };

  const rejectOrder = (orderId: string) => {
    if (window.confirm(t('confirm_reject_order'))) {
      setIncomingOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'CANCELLED' } 
          : order
      ));
      
      if (currentOrder?.id === orderId) {
        setCurrentOrder(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
        setActiveView('ORDER_LIST');
      }
    }
  };

  const renderOrderList = () => {
    const sources: OrderSource[] = ['WEBSITE', 'APP', 'TALABAT', 'HUNGERSTATION', 'JAHEZ', 'SUPPORT'];
    
    const filteredOrders = incomingOrders.filter(order => {
      const matchesSource = orderFilter === 'ALL' ? true : order.source === orderFilter;
      let matchesStatus = true;
      
      switch (orderStatusFilter) {
        case 'ALL':
          matchesStatus = true;
          break;
        case 'PENDING':
          matchesStatus = order.status === 'PENDING';
          break;
        case 'CANCELLED':
          matchesStatus = order.status === 'CANCELLED';
          break;
        case 'HISTORY':
          matchesStatus = order.status !== 'PENDING' && order.status !== 'CANCELLED';
          break;
      }
      
      return matchesSource && matchesStatus;
    });
    
    // Sort: Pending first, then by date
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const getSourceIcon = (source: OrderSource) => {
      switch (source) {
        case 'WEBSITE': return <Globe className="w-4 h-4" />;
        case 'APP': return <Smartphone className="w-4 h-4" />;
        case 'SUPPORT': return <Phone className="w-4 h-4" />;
        default: return <ShoppingBag className="w-4 h-4" />;
      }
    };

    const getSourceColor = (source: OrderSource) => {
      switch (source) {
        case 'WEBSITE': return 'bg-info/15 text-info';
        case 'APP': return 'bg-brand-100 text-brand-700';
        case 'TALABAT': return 'bg-warning/15 text-warning';
        case 'HUNGERSTATION': return 'bg-secondary-100 text-secondary-700';
        case 'SUPPORT': return 'bg-brand-50 text-brand-600';
        default: return 'bg-gray-100 text-gray-700';
      }
    };

    const statusTone = (s: OrderStatus): React.ComponentProps<typeof Badge>['tone'] =>
      s === 'PENDING' ? 'gold' : s === 'CANCELLED' ? 'maroon' : 'success';

    return (
      <div className="flex-1 bg-parchment bg-pageBg p-8 overflow-auto">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <SectionHeader title={t('incoming_orders')} align="start" />

            {/* Status Toggle */}
            <div className="flex gap-2 flex-wrap">
              <Pill active={orderStatusFilter === 'ALL'} onClick={() => setOrderStatusFilter('ALL')}>{t('ord_status_all')}</Pill>
              <Pill active={orderStatusFilter === 'PENDING'} onClick={() => setOrderStatusFilter('PENDING')}>{t('ord_status_pending')}</Pill>
              <Pill active={orderStatusFilter === 'CANCELLED'} onClick={() => setOrderStatusFilter('CANCELLED')}>{t('ord_status_canceled')}</Pill>
              <Pill active={orderStatusFilter === 'HISTORY'} onClick={() => setOrderStatusFilter('HISTORY')}>{t('ord_status_history')}</Pill>
            </div>
          </div>

          {/* Source Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Pill active={orderFilter === 'ALL'} onClick={() => setOrderFilter('ALL')}>{t('all')}</Pill>
            {sources.map(source => (
              <Pill key={source} active={orderFilter === source} onClick={() => setOrderFilter(source)}>
                <span className="inline-flex items-center gap-2">{getSourceIcon(source)}{sourceLabel(source)}</span>
              </Pill>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <Card
                interactive
                onClick={() => editOrder(order)}
                className={`p-6 ${order.status === 'CANCELLED' ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${getSourceColor(order.source)}`}>
                      {getSourceIcon(order.source)}
                    </div>
                    <div>
                      <div className="font-bold text-ink">#{order.id}</div>
                      <div className="text-xs text-gray-500">{order.createdAt.toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
                </div>

                <div className="mb-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-brand-400" />
                    {order.customerName || t('guest')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-brand-400" />
                    {typeLabel(order.type)}
                  </div>
                </div>

                <div className="border-t border-b border-gray-100 py-3 mb-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.quantity}x {item.product.name}</span>
                      <span className="font-bold text-ink">{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-500">{t('total')}</span>
                  <PriceTag amount={order.total} currency={t('sar')} className="text-xl" />
                </div>

                {order.status === 'PENDING' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" block onClick={(e) => { e.stopPropagation(); rejectOrder(order.id); }}>
                      {t('reject')}
                    </Button>
                    <Button variant="primary" size="sm" block onClick={(e) => { e.stopPropagation(); acceptOrder(order.id); }}>
                      {t('accept')}
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderHeldOrders = () => {
    const orderTypes: OrderType[] = ['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'PICKUP'];
    
    const filteredHeldOrders = heldOrders.filter(order => 
      heldOrderFilter === 'ALL' ? true : order.type === heldOrderFilter
    );

    return (
    <div className="flex-1 bg-parchment bg-pageBg p-8 overflow-auto">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <SectionHeader title={t('held_orders')} align="start" />
        <div className="flex gap-2 flex-wrap">
          <Pill active={heldOrderFilter === 'ALL'} onClick={() => setHeldOrderFilter('ALL')}>{t('all')}</Pill>
          {orderTypes.map(type => (
            <Pill key={type} active={heldOrderFilter === type} onClick={() => setHeldOrderFilter(type)}>
              {typeLabel(type)}
            </Pill>
          ))}
        </div>
      </div>

      {filteredHeldOrders.length === 0 ? (
        <EmptyState icon={PauseCircle} title={t('no_held_orders')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHeldOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <Card interactive className="p-6 border-s-4 border-s-secondary-500" onClick={() => resumeOrder(order)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-display font-bold text-ink text-lg">
                      {order.type === 'DINE_IN' ? `${t('table_single')} ${order.tableName}` : typeLabel(order.type)}
                    </div>
                    <div className="text-xs text-gray-500">#{order.id}</div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {order.createdAt.toLocaleTimeString()}
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <PriceTag amount={order.total} currency={t('sar')} className="text-xl" />
                  <span className="text-brand-700 font-bold text-sm flex items-center gap-1">
                    {t('resume')} <ArrowLeft className="w-4 h-4 rotate-180" />
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
  };

  return (
    <div className="flex h-screen bg-pageBg font-sans text-ink" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {renderSidebar()}
      {activeView === 'TABLES' && renderTables()}
      {activeView === 'TABLE_LAYOUT' && renderTableLayoutEditor()}
      {activeView === 'ORDER_ENTRY' && renderOrderEntry()}
      {activeView === 'ORDER_LIST' && renderOrderList()}
      {activeView === 'HELD_ORDERS' && renderHeldOrders()}
      {activeView === 'SETTINGS' && renderSettings()}

      {/* Product Sheet */}
      {selectedProduct && renderProductModal()}

      {/* Customer Sheet */}
      <Sheet open={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} className="max-w-md">
        <div className="p-6">
          <SectionHeader title={t('add_customer')} align="start" className="mb-5" />
          <Field label={t('customer_name')} htmlFor="cust-name">
            <Input
              id="cust-name"
              type="text"
              value={tempCustomerName}
              onChange={(e) => setTempCustomerName(e.target.value)}
              placeholder={t('customer_name')}
              autoFocus
            />
          </Field>
          <div className="flex gap-3 mt-6">
            <Button variant="ghost" block onClick={() => setIsCustomerModalOpen(false)}>{t('cancel')}</Button>
            <Button variant="primary" block onClick={handleSaveCustomer}>{t('save')}</Button>
          </div>
        </div>
      </Sheet>

      {/* Order Note Sheet */}
      <Sheet open={isOrderNoteModalOpen} onClose={() => setIsOrderNoteModalOpen(false)} className="max-w-md">
        <div className="p-6">
          <SectionHeader title={t('add_note')} align="start" className="mb-5" />
          <Field label={t('order_note')} htmlFor="ord-note">
            <Textarea
              id="ord-note"
              value={tempOrderNote}
              onChange={(e) => setTempOrderNote(e.target.value)}
              placeholder={t('order_note')}
              rows={4}
              autoFocus
            />
          </Field>
          <div className="flex gap-3 mt-6">
            <Button variant="ghost" block onClick={() => setIsOrderNoteModalOpen(false)}>{t('cancel')}</Button>
            <Button variant="primary" block onClick={handleSaveOrderNote}>{t('save')}</Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
};

export default POS;
