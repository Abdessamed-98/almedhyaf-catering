import React, { useState, useEffect } from 'react';
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
  RotateCw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
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

interface MiniPOSProps {
  onBackToPortal: () => void;
}

type POSView = 'TABLES' | 'ORDER_ENTRY' | 'ORDER_LIST' | 'HELD_ORDERS' | 'SETTINGS';

const MiniPOS: React.FC<MiniPOSProps> = ({ onBackToPortal }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const toast = useToast();

  // Localized labels for enum values shown to the user.
  const statusLabel = (s: OrderStatus) => t('ord_status_' + s.toLowerCase());
  const tableStatusLabel = (s: Table['status']) => t('status_' + s.toLowerCase());
  const [activeView, setActiveView] = useState<POSView>('TABLES');
  const [previousView, setPreviousView] = useState<POSView | null>(null);

  // State for Order Entry
  const [currentOrder, setCurrentOrder] = useState<POSOrder | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // State for Tables
  const [selectedFloor, setSelectedFloor] = useState<number>(FLOORS[0].id);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [tables, setTables] = useState<Table[]>(TABLES);

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
    setIsCartOpen(false);
  };

  const addItemToCart = (product: Product, quantity: number, modifiers: Record<number, number[]>, notes: string) => {
    setCartItems(prev => {
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
    if (cartItems.length <= 1) setIsCartOpen(false);
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
    setActiveView('TABLES');
  };

  const editOrder = (order: POSOrder) => {
    setCurrentOrder(order);
    setCartItems(JSON.parse(JSON.stringify(order.items)));
    setPreviousView('ORDER_LIST');
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

  const acceptOrder = (orderId: string) => {
    setIncomingOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: 'PREPARING' }
        : order
    ));

    if (currentOrder?.id === orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status: 'PREPARING' } : null);
    }
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

  // --- Render Components ---

  const navItems: { view: POSView; icon: typeof LayoutGrid; label: string; onClick: () => void; dot?: boolean }[] = [
    { view: 'TABLES', icon: LayoutGrid, label: t('tables'), onClick: () => setActiveView('TABLES') },
    { view: 'ORDER_ENTRY', icon: ShoppingBag, label: t('takeaway'), onClick: () => startNewOrder('TAKEAWAY') },
    { view: 'ORDER_LIST', icon: Clock, label: t('orders'), onClick: () => setActiveView('ORDER_LIST'), dot: incomingOrders.length > 0 },
    { view: 'SETTINGS', icon: Settings, label: t('settings'), onClick: () => setActiveView('SETTINGS') },
  ];

  const renderBottomNav = () => (
    <div className="fixed bottom-0 inset-x-0 z-40 px-3 pb-safe">
      <div className="mx-auto max-w-2xl mb-3 bg-ink/95 backdrop-blur-md rounded-full shadow-2xl shadow-ink/30 border border-white/10 flex justify-around items-center h-16 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={item.onClick}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              {active && (
                <motion.span
                  layoutId="miniPosNavGlow"
                  className="absolute inset-x-2 inset-y-2 rounded-full bg-brand-600"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative z-10 flex flex-col items-center transition-colors ${active ? 'text-white' : 'text-white/55'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
                {item.dot && !active && (
                  <span className="absolute -top-1 end-2 w-2 h-2 bg-secondary-500 rounded-full ring-2 ring-ink" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex-1 bg-parchment p-5 pb-32 overflow-y-auto">
      <SectionHeader title={t('settings')} align="start" className="mb-6" />

      <Card className="overflow-hidden divide-y divide-gray-100">
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center justify-between p-5 hover:bg-brand-50/40 transition-colors text-ink font-bold"
        >
          <span className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </span>
            {t('ord_language')}
          </span>
          <Badge tone="muted">{language === 'ar' ? 'العربية' : 'English'}</Badge>
        </button>

        <button
          onClick={onBackToPortal}
          className="w-full flex items-center justify-between p-5 hover:bg-brand-50/40 transition-colors text-brand-700 font-bold"
        >
          <span className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </span>
            {t('return_to_portal')}
          </span>
          <span className="text-gray-300">›</span>
        </button>
      </Card>

      <div className="mt-10">
        <Ornament />
        <p className="text-center text-xs text-gray-400 font-display mt-3 tracking-wide">
          {language === 'ar' ? 'المضياف العربي' : 'Almedhyaf Alarabi'}
        </p>
      </div>
    </div>
  );

  const tableTone = (status: Table['status']) => {
    switch (status) {
      case 'OCCUPIED':
        return { ring: 'border-brand-300 bg-brand-50', text: 'text-brand-800', badge: 'maroon' as const };
      case 'RESERVED':
        return { ring: 'border-secondary-300 bg-secondary-50', text: 'text-secondary-800', badge: 'gold' as const };
      default:
        return { ring: 'border-gray-200 bg-white', text: 'text-ink', badge: 'success' as const };
    }
  };

  const renderTables = () => {
    const filteredRooms = ROOMS.filter(r => r.floorId === selectedFloor);
    const filteredTables = tables.filter(t =>
      t.floorId === selectedFloor && (selectedRoom ? t.roomId === selectedRoom : true)
    );

    return (
      <div className="flex-1 bg-parchment p-5 pb-32 overflow-y-auto flex flex-col">
        <div className="flex flex-col gap-4 mb-6">
          <SectionHeader title={t('table_management')} align="start" />

          {/* Floor Toggle */}
          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
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

          {/* Room Filters */}
          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
            <Pill active={!selectedRoom} onClick={() => setSelectedRoom(null)}>
              {t('all_rooms')}
            </Pill>
            {filteredRooms.map(room => (
              <Pill
                key={room.id}
                active={selectedRoom === room.id}
                onClick={() => setSelectedRoom(room.id)}
              >
                {room.name}
              </Pill>
            ))}
          </div>
        </div>

        <motion.div
          className="grid grid-cols-2 gap-4"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
        >
          {filteredTables.map(table => {
            const tone = tableTone(table.status);
            return (
              <motion.button
                key={table.id}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startNewOrder('DINE_IN', table)}
                className={`aspect-square rounded-3xl p-4 flex flex-col items-center justify-center gap-2 border-2 shadow-sm transition-all ${tone.ring}`}
              >
                <div className={`text-3xl font-display font-bold ${tone.text}`}>{table.name}</div>
                <Badge tone={tone.badge}>{tableStatusLabel(table.status)}</Badge>
                {table.status === 'OCCUPIED' && (
                  <div className="text-[10px] font-bold text-brand-600 mt-1">
                    #{table.currentOrderId}
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    );
  };

  const renderProductSheet = () => {
    if (!selectedProduct) return null;
    const basePrice = selectedProduct.price;
    let currentTotal = basePrice;
    Object.entries(tempModifiers).forEach(([groupId, optionIds]) => {
        const group = selectedProduct.modifiers?.find(g => g.id === Number(groupId));
        (optionIds as number[]).forEach(optId => {
            const opt = group?.options.find(o => o.id === optId);
            if(opt) currentTotal += opt.price;
        });
    });

    const closeSheet = () => {
      setSelectedProduct(null);
      setEditingCartId(null);
    };

    const confirmAddToCart = () => {
      if (!selectedProduct) return;
      if (editingCartId) {
        setCartItems(prev => prev.filter(item => item.cartId !== editingCartId));
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

    return (
      <Sheet open={!!selectedProduct} onClose={closeSheet}>
        {/* Image header */}
        <div className="relative h-56 -mt-1">
          <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
          <button
            onClick={closeSheet}
            className="absolute top-3 end-3 p-2 bg-ink/40 rounded-full text-white backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 start-5 end-5 flex justify-between items-end">
            <h2 className="text-2xl font-display font-bold text-white drop-shadow">{selectedProduct.name}</h2>
            <span className="bg-secondary-500 text-ink font-black px-3 py-1 rounded-full text-sm shadow">
              {basePrice} {t('sar')}
            </span>
          </div>
        </div>

        <div className="p-5 pb-32">
          {selectedProduct.description && (
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">{selectedProduct.description}</p>
          )}

          {/* Quantity */}
          <div className="bg-parchment p-4 rounded-2xl border border-gray-100 mb-6 flex justify-between items-center">
            <span className="font-bold text-ink">{t('quantity')}</span>
            <QtyStepper value={tempQty} onChange={setTempQty} min={1} />
          </div>

          {/* Modifiers */}
          <div className="space-y-6">
            {selectedProduct.modifiers?.map(group => (
              <div key={group.id}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-display font-bold text-lg text-ink">{group.name}</h3>
                  <Badge tone={group.min > 0 ? 'maroon' : 'muted'}>
                    {group.min > 0 ? t('required') : t('optional')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {group.options.map(option => {
                    const isSelected = tempModifiers[group.id]?.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          const current = tempModifiers[group.id] || [];
                          if (group.max === 1) {
                            setTempModifiers({...tempModifiers, [group.id]: [option.id]});
                          } else {
                            if (isSelected) {
                              setTempModifiers({...tempModifiers, [group.id]: current.filter(id => id !== option.id)});
                            } else if (current.length < group.max) {
                              setTempModifiers({...tempModifiers, [group.id]: [...current, option.id]});
                            }
                          }
                        }}
                        className={`w-full p-3.5 rounded-2xl border-2 text-start flex justify-between items-center transition-all ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`}
                      >
                        <span className={`font-bold ${isSelected ? 'text-brand-800' : 'text-gray-700'}`}>{option.name}</span>
                        <div className="flex items-center gap-2">
                          {option.price > 0 && <span className="text-sm text-secondary-700 font-bold">+{option.price}</span>}
                          {isSelected && <CheckCircle className="w-5 h-5 text-brand-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <Field label={t('notes')} htmlFor="product-notes" className="mt-6">
            <Textarea
              id="product-notes"
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              rows={3}
              placeholder={t('special_instructions')}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <Button variant="primary" block size="lg" onClick={confirmAddToCart} className="justify-between px-6">
            <span>{editingCartId ? t('update') : t('add_to_cart')}</span>
            <span>{(currentTotal * tempQty).toFixed(2)} {t('sar')}</span>
          </Button>
        </div>
      </Sheet>
    );
  };

  const renderCartSheet = () => {
    return (
      <Sheet open={isCartOpen} onClose={() => setIsCartOpen(false)} className="max-h-[92vh]">
        {/* Header */}
        <div className="px-5 pt-2 pb-4 flex justify-between items-center">
          <h2 className="text-xl font-display font-bold text-ink">{t('current_order')}</h2>
          <Badge tone="gold">{currentOrder?.id}</Badge>
        </div>

        {/* Customer & Notes */}
        <div className="px-5 grid grid-cols-2 gap-3 pb-4 border-b border-gray-100">
          <button
            onClick={handleAddCustomer}
            className={`border-2 py-2.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${currentOrder?.customerName ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-200 text-gray-600'}`}
          >
            <User className="w-4 h-4" />
            {currentOrder?.customerName || t('add_customer')}
          </button>
          <button
            onClick={handleAddOrderNote}
            className={`border-2 py-2.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${currentOrder?.notes ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-200 text-gray-600'}`}
          >
            <Utensils className="w-4 h-4" />
            {currentOrder?.notes ? t('edit_note') : t('add_note')}
          </button>
        </div>

        {/* Items */}
        <div className="p-5 space-y-3 min-h-[30vh]">
          {cartItems.length === 0 ? (
            <EmptyState icon={ShoppingBag} title={t('cart_empty')} />
          ) : (
            cartItems.map(item => (
              <div
                key={item.cartId}
                className="flex gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm"
                onClick={() => {
                    setIsCartOpen(false);
                    handleEditCartItem(item);
                }}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-ink">{item.product.name}</span>
                    <PriceTag amount={calculateItemPrice(item).toFixed(2)} currency={t('sar')} />
                  </div>
                  {(Object.keys(item.selectedModifiers).length > 0 || item.notes) && (
                      <div className="text-xs text-gray-500 mb-2">
                        {Object.entries(item.selectedModifiers).map(([groupId, optionIds]) => {
                           const group = item.product.modifiers?.find(g => g.id === Number(groupId));
                           return (optionIds as number[]).map(optId => {
                             const opt = group?.options.find(o => o.id === optId);
                             return opt ? <span key={optId} className="me-1">{opt.name},</span> : null;
                           });
                        })}
                        {item.notes && <div className="italic mt-1">"{item.notes}"</div>}
                      </div>
                  )}
                  <div className="flex items-center justify-between mt-2" onClick={(e) => e.stopPropagation()}>
                    <QtyStepper
                      value={item.quantity}
                      min={0}
                      onChange={(next) => updateQuantity(item.cartId, next - item.quantity)}
                    />
                    <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.cartId); }} className="text-brand-600 p-1.5 rounded-full hover:bg-brand-50">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex justify-between items-center text-xl mb-4">
            <span className="font-display font-bold text-ink">{t('total')}</span>
            <PriceTag amount={calculateTotal().toFixed(2)} currency={t('sar')} className="text-2xl" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={holdOrder}
              className="col-span-1 bg-secondary-500 hover:bg-secondary-600 text-ink rounded-2xl font-bold flex flex-col items-center justify-center py-3 transition-colors active:scale-[0.98]"
            >
              <PauseCircle className="w-6 h-6 mb-1" />
              <span className="text-[10px]">{t('hold')}</span>
            </button>
            <Button variant="primary" size="lg" onClick={confirmOrder} className="col-span-3 rounded-2xl">
              {t('pay_confirm')}
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
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-parchment pb-32">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm p-4 shadow-sm z-10 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setActiveView('TABLES')} className="p-2 -ms-2 text-brand-700 rtl:rotate-180">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="font-display font-bold text-lg text-ink">
              {currentOrder?.type === 'DINE_IN' ? `${t('table_single')} ${currentOrder.tableName}` : t('takeaway')}
            </h2>
            <div className="w-8" /> {/* Spacer */}
          </div>

          {/* Categories */}
          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
            <Pill active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')}>
              {t('all')}
            </Pill>
            {categories.map(cat => (
              <Pill key={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
                {cat}
              </Pill>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <motion.div
            className="grid grid-cols-2 gap-4"
            key={selectedCategory}
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.03 } } }}
          >
            {filteredItems.map(item => (
              <motion.button
                key={item.id}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleProductClick(item)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col text-start"
              >
                <div className="h-28 overflow-hidden bg-gray-100 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-ink text-sm mb-1 leading-tight">{item.name}</h3>
                  <div className="mt-2">
                    <PriceTag amount={item.price} currency={t('sar')} />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Floating Cart Bar */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-24 inset-x-4 z-30">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-ink text-white p-4 rounded-full shadow-2xl shadow-ink/30 flex justify-between items-center animate-fade-in-up border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="bg-secondary-500 text-ink w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">
                  {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                </div>
                <span className="font-bold">{t('view_cart')}</span>
              </div>
              <span className="font-black text-lg text-secondary-400">{calculateTotal().toFixed(2)} {t('sar')}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderOrderList = () => {
    return (
      <div className="flex-1 bg-parchment p-5 pb-32 overflow-y-auto">
        <SectionHeader title={t('incoming_orders')} align="start" className="mb-6" />
        {incomingOrders.length === 0 ? (
          <EmptyState icon={Clock} title={t('incoming_orders')} />
        ) : (
          <div className="space-y-4">
            {incomingOrders.map(order => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-display font-bold text-ink">#{order.id}</span>
                    <div className="text-xs text-gray-500">{order.createdAt.toLocaleTimeString()}</div>
                  </div>
                  <Badge tone={order.status === 'PENDING' ? 'gold' : 'success'}>
                    {statusLabel(order.status)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <PriceTag amount={order.total} currency={t('sar')} className="text-lg" />
                  {order.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => rejectOrder(order.id)}>{t('reject')}</Button>
                      <Button variant="primary" size="sm" onClick={() => acceptOrder(order.id)}>{t('accept')}</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-parchment font-sans overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {activeView === 'TABLES' && renderTables()}
      {activeView === 'ORDER_ENTRY' && renderOrderEntry()}
      {activeView === 'ORDER_LIST' && renderOrderList()}
      {activeView === 'SETTINGS' && renderSettings()}

      {renderBottomNav()}
      {renderCartSheet()}
      {renderProductSheet()}

      {/* Customer Sheet */}
      <Sheet open={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-xl font-display font-bold mb-5 text-ink">{t('add_customer')}</h3>
          <Field label={t('customer_name')} htmlFor="customer-name">
            <Input
              id="customer-name"
              type="text"
              value={tempCustomerName}
              onChange={(e) => setTempCustomerName(e.target.value)}
              placeholder={t('customer_name')}
              autoFocus
            />
          </Field>
          <div className="flex gap-3 mt-6">
            <Button variant="ghost" block onClick={() => setIsCustomerModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" block onClick={handleSaveCustomer}>
              {t('save')}
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Order Note Sheet */}
      <Sheet open={isOrderNoteModalOpen} onClose={() => setIsOrderNoteModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-xl font-display font-bold mb-5 text-ink">{t('add_note')}</h3>
          <Field label={t('order_note')} htmlFor="order-note">
            <Textarea
              id="order-note"
              value={tempOrderNote}
              onChange={(e) => setTempOrderNote(e.target.value)}
              placeholder={t('order_note')}
              className="h-32"
              autoFocus
            />
          </Field>
          <div className="flex gap-3 mt-6">
            <Button variant="ghost" block onClick={() => setIsOrderNoteModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" block onClick={handleSaveOrderNote}>
              {t('save')}
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
};

export default MiniPOS;
