import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, ChevronLeft, Search, Plus, Minus, X, 
  ShoppingBag, Home, User, Heart, MapPin, Navigation, 
  Bike, Car, Utensils, Clock, Star, ArrowLeft, ArrowRight,
  CreditCard, Banknote, ShieldCheck, Flame, Smartphone,
  Package, CheckCircle, RefreshCw, AlertCircle, UtensilsCrossed, ChevronDown,
  Trash2, Edit2, Bell, Shield, LogOut, Check, Globe, HelpCircle, FileText,
  Save, Loader, Wallet, Calendar, TicketPercent, Crosshair, Gift
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { OrderType, Product, CartItem, Branch } from '../../types';
import Logo from '../../components/Logo';
import L from 'leaflet';
import { BRAND } from '../../theme/tokens';
import { useToast } from '../../ui';
import { motion } from 'motion/react';

// Mock Data — menu aligned with an Arab/Saudi catering kitchen (Makkah).
// Reusable modifier groups
const RICE_CHOICE = { id: 1, name: 'نوع الرز', min: 1, max: 1, options: [
  { id: 101, name: 'بشاور (أبيض)', price: 0 },
  { id: 102, name: 'شعبي (أحمر)', price: 0 },
  { id: 103, name: 'أرز بخاري', price: 4 },
] };
const PORTION = { id: 4, name: 'الحجم', min: 1, max: 1, options: [
  { id: 401, name: 'فردي', price: 0 },
  { id: 402, name: 'عائلي (يكفي 4)', price: 95 },
  { id: 403, name: 'وليمة (يكفي 8)', price: 210 },
] };
const TOPPINGS = { id: 2, name: 'إضافات', min: 0, max: 5, options: [
  { id: 201, name: 'صنوبر زيادة', price: 6 },
  { id: 202, name: 'مكسرات محمّصة', price: 5 },
  { id: 203, name: 'بصل مقلي', price: 3 },
  { id: 204, name: 'زبيب', price: 2 },
] };
const SPICE = { id: 3, name: 'درجة الحرارة', min: 1, max: 1, options: [
  { id: 301, name: 'عادي', price: 0 },
  { id: 302, name: 'حار', price: 0 },
] };
const GRILL_SIDES = { id: 5, name: 'الإضافات الجانبية', min: 0, max: 3, options: [
  { id: 501, name: 'كمّاج زيادة', price: 3 },
  { id: 502, name: 'صلصة ثوم', price: 3 },
  { id: 503, name: 'حمص جانبي', price: 6 },
] };

const MOCK_PRODUCTS: Product[] = [
  // ── كبسة ومندي ──────────────────────────────
  { id: 1, name: 'كبسة لحم نعيمي', description: 'لحم نعيمي بلدي طازج على رز بشاور فاخر ومكسرات محمّصة', price: 65, category: 'كبسة ومندي', calories: 1200, image: 'dishes/main-1.jpg', modifiers: [RICE_CHOICE, PORTION, TOPPINGS] },
  { id: 2, name: 'كبسة دجاج', description: 'دجاج محمّر بالبهارات السعودية على رز متبّل', price: 38, category: 'كبسة ومندي', calories: 950, image: 'dishes/main-5.jpg', modifiers: [RICE_CHOICE, PORTION, TOPPINGS] },
  { id: 3, name: 'مندي لحم', description: 'لحم مدخّن في التنّور حتى الطراوة على أرز مندي معطّر', price: 72, category: 'كبسة ومندي', calories: 1250, image: 'dishes/main-4.jpg', modifiers: [PORTION, TOPPINGS] },
  { id: 4, name: 'مندي دجاج', description: 'ربع دجاج مدخّن بنكهة الفحم الأصيلة على أرز مندي', price: 40, category: 'كبسة ومندي', calories: 900, image: 'dishes/main-6.jpg', modifiers: [PORTION, TOPPINGS] },
  { id: 5, name: 'أرز بخاري باللحم', description: 'أرز بخاري بالجزر والزبيب يُقدّم مع قطع اللحم', price: 60, category: 'كبسة ومندي', calories: 1100, image: 'dishes/main-6.jpg', modifiers: [PORTION, TOPPINGS] },
  { id: 6, name: 'برياني دجاج', description: 'أرز هندي بالبهارات الحارّة مع الدجاج الطري', price: 42, category: 'كبسة ومندي', calories: 980, image: 'dishes/main-2.jpg', modifiers: [SPICE, PORTION] },
  { id: 7, name: 'مظبي دجاج', description: 'دجاج مشوي على الحجر بنكهة الفحم على أرز شعبي', price: 45, category: 'كبسة ومندي', calories: 1000, image: 'dishes/main-5.jpg', modifiers: [RICE_CHOICE, PORTION] },
  { id: 8, name: 'مفطّح خروف كامل', description: 'خروف كامل على أرز بخاري — طبق الولائم الكبرى (يكفي ١٠–١٢ ضيف)', price: 850, category: 'كبسة ومندي', calories: 0, image: 'services/banquets.jpg', modifiers: [TOPPINGS] },

  // ── مشويات ──────────────────────────────────
  { id: 9, name: 'مشاوي مشكّلة', description: 'تشكيلة كباب وتكة وأوصال مشوية على الفحم', price: 88, category: 'مشويات', calories: 1150, image: 'dishes/grill-2.jpg', modifiers: [SPICE, GRILL_SIDES] },
  { id: 10, name: 'شيش طاووق', description: 'قطع دجاج متبّلة مشوية على الأسياخ', price: 36, category: 'مشويات', calories: 700, image: 'dishes/grill-1.jpg', modifiers: [GRILL_SIDES] },
  { id: 11, name: 'كباب لحم', description: 'لحم مفروم متبّل بالبهارات والأعشاب مشوي على الفحم', price: 48, category: 'مشويات', calories: 820, image: 'dishes/grill-3.jpg', modifiers: [SPICE, GRILL_SIDES] },
  { id: 12, name: 'أرياش لحم', description: 'ريش خروف مشوية على الفحم بتتبيلة خاصة', price: 95, category: 'مشويات', calories: 900, image: 'dishes/grill-4.jpg', modifiers: [GRILL_SIDES] },
  { id: 13, name: 'تكة دجاج', description: 'مكعبات دجاج متبّلة بالزعفران واللبن', price: 34, category: 'مشويات', calories: 680, image: 'dishes/grill-1.jpg', modifiers: [GRILL_SIDES] },

  // ── شعبيات ──────────────────────────────────
  { id: 14, name: 'جريش أحمر', description: 'جريش قصيمي مطبوخ باللبن واللحم على نار هادئة', price: 28, category: 'شعبيات', calories: 520, image: 'dishes/main-6.jpg' },
  { id: 15, name: 'مرقوق باللحم', description: 'عجين رقيق مع مرق اللحم والخضار', price: 30, category: 'شعبيات', calories: 600, image: 'dishes/main-4.jpg' },
  { id: 16, name: 'قرصان', description: 'رقائق عجين بمرق الدجاج والخضار', price: 26, category: 'شعبيات', calories: 560, image: 'dishes/main-2.jpg' },
  { id: 17, name: 'صالونة لحم', description: 'يخنة لحم وخضار بالبهارات الخليجية', price: 32, category: 'شعبيات', calories: 540, image: 'dishes/main-5.jpg' },
  { id: 18, name: 'مطازيز', description: 'كبيبات عجين مع مرق اللحم الغني', price: 29, category: 'شعبيات', calories: 580, image: 'dishes/main-1.jpg' },

  // ── مقبلات وسلطات ───────────────────────────
  { id: 19, name: 'حمص بالطحينة', description: 'معجون الحمّص بزيت الزيتون والكمون', price: 14, category: 'مقبلات', calories: 220, image: 'dishes/mezze-1.jpg' },
  { id: 20, name: 'متبّل باذنجان', description: 'باذنجان مدخّن مهروس بالطحينة', price: 14, category: 'مقبلات', calories: 200, image: 'dishes/mezze-1.jpg' },
  { id: 21, name: 'تبّولة', description: 'بقدونس وبرغل وطماطم بزيت الزيتون والليمون', price: 16, category: 'مقبلات', calories: 180, image: 'dishes/mezze-2.jpg' },
  { id: 22, name: 'فتّوش', description: 'خضار طازجة مع خبز محمّص ودبس الرمان', price: 16, category: 'مقبلات', calories: 210, image: 'dishes/mezze-2.jpg' },
  { id: 23, name: 'سمبوسك لحم', description: 'معجّنات مقرمشة محشوة باللحم المتبّل (٦ حبات)', price: 18, category: 'مقبلات', calories: 360, image: 'dishes/samosa-1.jpg' },
  { id: 24, name: 'ورق عنب', description: 'محشي بالأرز والبهارات والأعشاب', price: 20, category: 'مقبلات', calories: 300, image: 'dishes/dolma-1.jpg' },
  { id: 25, name: 'سلطة خضراء', description: 'خضروات موسمية طازجة مع زيت الزيتون', price: 12, category: 'مقبلات', calories: 120, image: 'dishes/mezze-2.jpg' },

  // ── حلويات ──────────────────────────────────
  { id: 26, name: 'لقيمات', description: 'كرات مقرمشة بالعسل والسمسم (١٢ حبة)', price: 18, category: 'حلويات', calories: 420, image: 'dishes/luqaimat-1.jpg' },
  { id: 27, name: 'كنافة', description: 'عجينة وجبن وقطر بماء الورد', price: 22, category: 'حلويات', calories: 480, image: 'dishes/kunafa-1.jpg' },
  { id: 28, name: 'بقلاوة', description: 'طبقات رقيقة بالفستق والعسل (٦ قطع)', price: 24, category: 'حلويات', calories: 450, image: 'dishes/sweet-1.jpg' },
  { id: 29, name: 'أم علي', description: 'حلى دافئ بالحليب والمكسرات', price: 20, category: 'حلويات', calories: 400, image: 'dishes/sweet-2.jpg' },

  // ── مشروبات ─────────────────────────────────
  { id: 30, name: 'قهوة عربية وتمر', description: 'ضيافة أصيلة لاستقبال الضيوف (دلّة + تمر)', price: 18, category: 'مشروبات', calories: 60, image: 'dishes/drink-1.jpg' },
  { id: 31, name: 'شاي بالنعناع', description: 'شاي ساخن بالنعناع الطازج', price: 8, category: 'مشروبات', calories: 40, image: 'dishes/tea-1.jpg' },
  { id: 32, name: 'عصير برتقال طازج', description: 'برتقال معصور طازج بدون سكر مضاف', price: 14, category: 'مشروبات', calories: 110, image: 'dishes/juice-1.jpg' },
  { id: 33, name: 'لبن وعيران', description: 'مشروب لبن منعش يقدّم بارداً', price: 7, category: 'مشروبات', calories: 90, image: 'dishes/laban-1.jpg' },
];

const BRANCHES: Branch[] = [
    { id: 1, name: 'مكة - الشرائع', city: 'مكة المكرمة', address: 'حي الشرائع', phone: '', lat: 21.43, lng: 39.86 },
    { id: 2, name: 'مكة - العوالي', city: 'مكة المكرمة', address: 'حي العوالي', phone: '', lat: 21.36, lng: 39.85 },
    { id: 3, name: 'مكة - الشوقية', city: 'مكة المكرمة', address: 'حي الشوقية', phone: '', lat: 21.41, lng: 39.79 },
];

interface MockOrder {
    id: string;
    date: string;
    status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
    total: number;
    items: { name: string; quantity: number; price: number }[];
    type: OrderType;
    payment: 'CASH' | 'CARD' | 'APPLE';
}

const INITIAL_ORDERS: MockOrder[] = [
    {
        id: '#ORD-9821',
        date: '2023-11-20 14:30',
        status: 'preparing',
        total: 145,
        items: [{ name: 'كبسة لحم نعيمي', quantity: 2, price: 65 }, { name: 'سلطة خضراء', quantity: 1, price: 15 }],
        type: 'DELIVERY',
        payment: 'APPLE'
    },
    {
        id: '#ORD-9820',
        date: '2023-11-18 19:15',
        status: 'completed',
        total: 87,
        items: [{ name: 'نصف دجاجة شواية', quantity: 3, price: 22 }, { name: 'بيبسي', quantity: 3, price: 5 }],
        type: 'PICKUP',
        payment: 'CARD'
    },
    {
        id: '#ORD-9755',
        date: '2023-11-10 13:00',
        status: 'completed',
        total: 210,
        items: [{ name: 'بوكس الجمعات', quantity: 1, price: 210 }],
        type: 'DELIVERY',
        payment: 'CASH'
    },
     {
        id: '#ORD-9100',
        date: '2023-10-05 20:00',
        status: 'cancelled',
        total: 45,
        items: [{ name: 'جريش أحمر', quantity: 2, price: 18 }],
        type: 'DINE_IN',
        payment: 'CARD'
    }
];

interface SavedAddress {
    id: number;
    type: string;
    label: string;
    address: string;
    isDefault: boolean;
    lat: number;
    lng: number;
}

interface SavedCard {
    id: number;
    type: string; // 'VISA', 'MASTERCARD'
    number: string; // Masked or partial
    expiry: string;
}

interface OrderingProps {
  onBackToPortal: () => void;
}

const Ordering: React.FC<OrderingProps> = ({ onBackToPortal }) => {
  const { t, language, toggleLanguage, dir } = useLanguage();
  const toast = useToast();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // menu search (header)
  const [scrolled, setScrolled] = useState(false); // scroll-aware header
  const [activeCat, setActiveCat] = useState('الكل'); // menu category filter (lifted out of MenuScreen)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // App State
  // Added POINTS to activeTab type
  const [activeTab, setActiveTab] = useState<'HOME' | 'CART' | 'CHECKOUT' | 'PROFILE' | 'FAVORITES' | 'ORDERS' | 'ADDRESSES' | 'MAP_ADDRESS' | 'PAYMENTS' | 'SETTINGS' | 'ORDER_DETAILS' | 'POINTS'>('HOME');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(true);
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]); // Product IDs
  const [points, setPoints] = useState(1250); // Loyalty points

  // Orders State
  const [orders, setOrders] = useState<MockOrder[]>(INITIAL_ORDERS);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Address State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
      { id: 1, type: 'Home', label: 'المنزل', address: 'حي العزيزية، مكة المكرمة', isDefault: true, lat: 21.42, lng: 39.83 },
      { id: 2, type: 'Work', label: 'العمل', address: 'حي الشوقية، مكة المكرمة', isDefault: false, lat: 21.41, lng: 39.79 },
  ]);
  // No longer using showAddressModal, using activeTab === 'MAP_ADDRESS'
  const [tempAddress, setTempAddress] = useState<SavedAddress>({ id: 0, type: '', label: '', address: '', isDefault: false, lat: 24.7136, lng: 46.6753 });
  const [selectedAddressId, setSelectedAddressId] = useState<number>(1);

  // Cards State
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
      { id: 1, type: 'VISA', number: '•••• 4242', expiry: '12/25' },
  ]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [tempCard, setTempCard] = useState({ number: '', expiry: '', cvv: '', holder: '' });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'CARD' | 'APPLE'>('CASH');

  // Checkout State
  const [deliveryTime, setDeliveryTime] = useState<'ASAP' | 'LATER'>('ASAP');

  // Order Details State
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);

  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempModifiers, setTempModifiers] = useState<Record<number, number[]>>({});
  const [tempQty, setTempQty] = useState(1);
  const [tempNotes, setTempNotes] = useState('');

  // Cart/Checkout logic
  const cartTotal = cart.reduce((sum, item) => {
    let price = item.product.price;
    // Add modifiers price
    Object.entries(item.selectedModifiers).forEach(([groupId, optionIds]) => {
        const group = item.product.modifiers?.find(g => g.id === Number(groupId));
        (optionIds as number[]).forEach(optId => {
            const opt = group?.options.find(o => o.id === optId);
            if (opt) price += opt.price;
        });
    });
    return sum + (price * item.quantity);
  }, 0);

  // --- Handlers ---

  const addToCart = () => {
    if (!selectedProduct) return;
    const newItem: CartItem = {
      cartId: Math.random().toString(36).substr(2, 9),
      product: selectedProduct,
      quantity: tempQty,
      selectedModifiers: tempModifiers,
      notes: tempNotes
    };
    setCart([...cart, newItem]);
    toast(t('ord_added_to_cart'));
    setSelectedProduct(null);
    setTempModifiers({});
    setTempQty(1);
    setTempNotes('');
  };

  const handlePlaceOrder = () => {
      setIsPlacingOrder(true);
      
      // Simulate API call delay
      setTimeout(() => {
          const newOrder: MockOrder = {
              id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
              status: 'pending',
              total: cartTotal + 15, // Adding delivery fee
              items: cart.map(item => ({
                  name: item.product.name,
                  quantity: item.quantity,
                  price: item.product.price // Simplified logic
              })),
              type: orderType,
              payment: selectedPaymentMethod
          };

          setOrders([newOrder, ...orders]);
          setCart([]);
          setIsPlacingOrder(false);
          setActiveTab('ORDERS');
      }, 2000);
  };

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
        setFavorites(prev => prev.filter(fid => fid !== id));
    } else {
        setFavorites(prev => [...prev, id]);
    }
  };

  const locateUser = () => {
    if (navigator.geolocation) {
        // Mocking GPS success for demo
        setTimeout(() => {
            setSelectedBranch(BRANCHES[0]); // Auto select nearest
            setShowBranchModal(false);
        }, 1000);
    }
  };

  const handleSaveAddress = () => {
      if (!tempAddress.label || !tempAddress.address) return;

      let updatedAddresses = [...savedAddresses];

      if (tempAddress.isDefault) {
          updatedAddresses = updatedAddresses.map(addr => ({...addr, isDefault: false}));
      }

      if (tempAddress.id === 0) {
          // New Address
          const newId = Math.max(...savedAddresses.map(a => a.id), 0) + 1;
          const newAddress = { ...tempAddress, id: newId, type: tempAddress.label }; // Simple logic for type
          updatedAddresses.push(newAddress);
      } else {
          // Update Address
          updatedAddresses = updatedAddresses.map(addr => 
              addr.id === tempAddress.id ? { ...tempAddress, type: tempAddress.label } : addr
          );
      }
      
      setSavedAddresses(updatedAddresses);
      setActiveTab('ADDRESSES'); // Return to list
  };

  const handleDeleteAddress = (id: number) => {
      setSavedAddresses(prev => prev.filter(a => a.id !== id));
      if (selectedAddressId === id) {
          setSelectedAddressId(savedAddresses.length > 1 ? savedAddresses[0].id : 0);
      }
  };

  const handleSaveCard = () => {
      if (!tempCard.number || !tempCard.expiry) return;

      // Basic validation mock
      const lastFour = tempCard.number.slice(-4);
      const newCard: SavedCard = {
          id: Math.random(),
          type: tempCard.number.startsWith('5') ? 'MASTERCARD' : 'VISA',
          number: `•••• ${lastFour}`,
          expiry: tempCard.expiry
      };

      setSavedCards([...savedCards, newCard]);
      setTempCard({ number: '', expiry: '', cvv: '', holder: '' });
      setShowCardModal(false);
  };

  const handleDeleteCard = (id: number) => {
      setSavedCards(prev => prev.filter(c => c.id !== id));
  };


  const getStatusColor = (status: string) => {
      switch(status) {
          case 'pending': return 'bg-secondary-100 text-secondary-800';      // awaiting — gold
          case 'preparing': return 'bg-brand-50 text-brand-700';             // cooking — maroon
          case 'ready': return 'bg-success/15 text-green-700';               // ready — green
          case 'delivering': return 'bg-brand-100 text-brand-800';           // on the way — deep maroon
          case 'completed': return 'bg-success/15 text-green-700';           // done — green
          case 'cancelled': return 'bg-gray-100 text-gray-500';              // cancelled — muted
          default: return 'bg-gray-100 text-gray-600';
      }
  };

  const getStatusText = (status: string) => {
      return t(`ord_status_${status}`);
  };

  const getOrderTypeIcon = (type: OrderType) => {
      switch (type) {
          case 'DELIVERY': return Bike;
          case 'PICKUP': return ShoppingBag;
          case 'CAR_PICKUP': return Car;
          case 'DINE_IN': return UtensilsCrossed;
          default: return Bike;
      }
  }

  const getOrderTypeLabel = (type: OrderType) => {
      switch (type) {
          case 'DELIVERY': return t('ord_delivery');
          case 'PICKUP': return t('ord_pickup');
          case 'CAR_PICKUP': return t('ord_car');
          case 'DINE_IN': return t('ord_dinein');
          default: return t('ord_delivery');
      }
  }

  // --- Map Address Screen Component ---
  const AddressMapScreen = () => {
      const mapRef = useRef<HTMLDivElement>(null);
      const mapInstance = useRef<L.Map | null>(null);
      const markerRef = useRef<L.Marker | null>(null);
      const [searchQuery, setSearchQuery] = useState('');
      const [isLocating, setIsLocating] = useState(false);

      useEffect(() => {
          if (!mapRef.current || mapInstance.current) return;

          // Initialize Map
          const initialLat = tempAddress.lat || 24.7136;
          const initialLng = tempAddress.lng || 46.6753;
          
          const map = L.map(mapRef.current, { zoomControl: false }).setView([initialLat, initialLng], 15);
          mapInstance.current = map;

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: 'OpenStreetMap'
          }).addTo(map);

          // Add draggable marker
          const customIcon = L.divIcon({
              className: 'custom-pin',
              html: `<div style="background-color:${BRAND};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.4);"></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
          });

          const marker = L.marker([initialLat, initialLng], { 
              icon: customIcon,
              draggable: true 
          }).addTo(map);
          markerRef.current = marker;

          // Handle Marker Drag End
          marker.on('dragend', (e) => {
              const pos = e.target.getLatLng();
              updateLocation(pos.lat, pos.lng);
          });

          // Handle Map Click
          map.on('click', (e) => {
              marker.setLatLng(e.latlng);
              updateLocation(e.latlng.lat, e.latlng.lng);
              map.flyTo(e.latlng, map.getZoom());
          });

          // Initial Mock Reverse Geocode if empty
          if (!tempAddress.address) {
             updateLocation(initialLat, initialLng);
          }

          return () => {
              if (mapInstance.current) {
                  mapInstance.current.remove();
                  mapInstance.current = null;
              }
          };
      }, []);

      const updateLocation = (lat: number, lng: number) => {
          // Mock Reverse Geocoding
          const mockDistrict = `حي ${['الشرائع', 'العوالي', 'العزيزية', 'النسيم'][Math.floor(Math.random()*4)]}`;
          const mockStreet = `شارع ${Math.floor(Math.random()*100) + 1}`;
          const newAddress = `${mockDistrict}، ${mockStreet}`;
          
          setTempAddress(prev => ({
              ...prev,
              lat,
              lng,
              address: newAddress
          }));
      };

      const handleSearch = (e: React.FormEvent) => {
          e.preventDefault();
          // Mock Search - Moves map slightly to simulate finding a place
          if (mapInstance.current && markerRef.current) {
              const newLat = tempAddress.lat + (Math.random() * 0.01 - 0.005);
              const newLng = tempAddress.lng + (Math.random() * 0.01 - 0.005);
              const newPos = new L.LatLng(newLat, newLng);
              
              mapInstance.current.flyTo(newPos, 16);
              markerRef.current.setLatLng(newPos);
              updateLocation(newLat, newLng);
          }
      };

      const getCurrentLocation = () => {
          setIsLocating(true);
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                  const { latitude, longitude } = pos.coords;
                  if (mapInstance.current && markerRef.current) {
                      const newPos = new L.LatLng(latitude, longitude);
                      mapInstance.current.flyTo(newPos, 17);
                      markerRef.current.setLatLng(newPos);
                      updateLocation(latitude, longitude);
                  }
                  setIsLocating(false);
              }, () => setIsLocating(false));
          } else {
              setIsLocating(false);
          }
      };

      return (
          <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
              {/* Floating Top Bar */}
              <div className="absolute top-4 left-4 right-4 z-[400] flex gap-3 pointer-events-none">
                  <button 
                    onClick={() => setActiveTab('ADDRESSES')} 
                    className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-brand-600 pointer-events-auto transition-transform active:scale-95"
                  >
                      <ArrowRight className={`w-6 h-6 ${language === 'en' ? 'rotate-180' : ''}`} />
                  </button>
                  <form onSubmit={handleSearch} className="flex-1 pointer-events-auto shadow-lg rounded-full">
                      <div className="relative">
                        <input 
                            type="text" 
                            placeholder={t('ord_search') + '...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white h-12 rounded-full ps-12 pe-4 focus:outline-none text-sm font-bold text-gray-700 placeholder-gray-400"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute top-3.5 start-4" />
                      </div>
                  </form>
              </div>

              {/* Map Container */}
              <div className="flex-1 relative h-full w-full">
                  <div ref={mapRef} className="absolute inset-0 z-0 h-full w-full" />
                  
                  {/* Locate Me Button - Repositioned */}
                  <button 
                      onClick={getCurrentLocation}
                      className="absolute bottom-[340px] right-4 bg-white w-12 h-12 rounded-full shadow-xl z-[400] flex items-center justify-center text-gray-700 hover:text-brand-600 transition-colors active:scale-95"
                  >
                      {isLocating ? <Loader className="w-6 h-6 animate-spin" /> : <Crosshair className="w-6 h-6" />}
                  </button>
              </div>

              {/* Bottom Sheet - Cleaner Design */}
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-10 animate-fade-in-up max-h-[45vh] overflow-y-auto">
                  <div className="p-6 pb-8">
                      {/* Drag Handle */}
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                      
                      {/* Address Display */}
                      <div className="flex items-start gap-4 mb-6">
                          <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center shrink-0 text-brand-600">
                              <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                              <h3 className="text-gray-900 font-bold text-lg leading-tight mb-1">{t('ord_address_details')}</h3>
                              <p className="text-gray-500 text-sm leading-relaxed">{tempAddress.address || t('ord_locating')}</p>
                          </div>
                      </div>

                      <div className="h-px bg-gray-100 w-full mb-6"></div>

                      {/* Inputs */}
                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('ord_label_name')}</label>
                              <div className="flex gap-3">
                                  {['Home', 'Work', 'Other'].map(type => (
                                      <button
                                          key={type}
                                          onClick={() => setTempAddress({...tempAddress, label: type === 'Home' ? t('ord_home') : type === 'Work' ? t('ord_work') : '', type: type})}
                                          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${tempAddress.type === type ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                      >
                                          {type === 'Home' ? t('ord_home') : type === 'Work' ? t('ord_work') : t('ord_address')}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <div className="relative">
                              <input 
                                  type="text" 
                                  value={tempAddress.label}
                                  onChange={(e) => setTempAddress({...tempAddress, label: e.target.value})}
                                  placeholder={t('ord_label_name')}
                                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium"
                              />
                          </div>

                          <label className="flex items-center gap-3 py-1 cursor-pointer group">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${tempAddress.isDefault ? 'bg-brand-600 border-brand-600' : 'border-gray-300 bg-white'}`}>
                                  {tempAddress.isDefault && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <input 
                                  type="checkbox"
                                  checked={tempAddress.isDefault}
                                  onChange={(e) => setTempAddress({...tempAddress, isDefault: e.target.checked})}
                                  className="hidden"
                              />
                              <span className="text-gray-600 font-medium text-sm group-hover:text-gray-800 transition-colors">{t('ord_set_default')}</span>
                          </label>

                          <button 
                              onClick={handleSaveAddress}
                              disabled={!tempAddress.label || !tempAddress.address}
                              className="w-full bg-brand-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-700 active:scale-[0.98] mt-2"
                          >
                              {t('ord_save')}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  // --- Sub-Components ---

  const OrderTypeSelectorModal = () => (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl px-6 pb-6 pt-3 animate-slide-up">
              <div className="flex justify-center mb-4 md:hidden"><span className="w-12 h-1.5 bg-gray-300 rounded-full"></span></div>
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{t('ord_welcome')}</h2>
                  <button onClick={() => setShowOrderTypeModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5 text-gray-500" />
                  </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  {[
                      { id: 'DELIVERY', label: t('ord_delivery'), icon: Bike, color: 'bg-secondary-50 text-secondary-600' },
                      { id: 'PICKUP', label: t('ord_pickup'), icon: ShoppingBag, color: 'bg-brand-50 text-brand-600' },
                      { id: 'CAR_PICKUP', label: t('ord_car'), icon: Car, color: 'bg-brand-50 text-brand-600' },
                      { id: 'DINE_IN', label: t('ord_dinein'), icon: UtensilsCrossed, color: 'bg-brand-50 text-brand-600' },
                  ].map((type) => {
                      const isActive = orderType === type.id;
                      return (
                          <button
                              key={type.id}
                              onClick={() => {
                                  setOrderType(type.id as OrderType);
                                  setShowOrderTypeModal(false);
                              }}
                              className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${isActive ? 'border-brand-600 bg-brand-50 ring-2 ring-secondary-400/50' : 'border-gray-100 hover:border-gray-200'}`}
                          >
                              <div className={`p-3 rounded-full ${type.color}`}>
                                  <type.icon className="w-6 h-6" />
                              </div>
                              <span className={`font-bold ${isActive ? 'text-brand-700' : 'text-gray-700'}`}>
                                  {type.label}
                              </span>
                          </button>
                      )
                  })}
              </div>
          </div>
      </div>
  );

  const BranchSelectorModal = () => (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl px-6 pb-6 pt-3 animate-slide-up">
            <div className="flex justify-center mb-4 md:hidden"><span className="w-12 h-1.5 bg-gray-300 rounded-full"></span></div>
            <h2 className="text-xl font-bold mb-6 text-center">{t('ord_select_branch')}</h2>
            
            <button 
                onClick={locateUser}
                className="w-full bg-brand-50 text-brand-600 font-bold py-4 rounded-xl mb-4 flex items-center justify-center gap-2 hover:bg-brand-100 transition-colors"
            >
                <Navigation className="w-5 h-5" />
                {t('ord_branch_auto')}
            </button>
            
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center"><span className="bg-white px-2 text-sm text-gray-500">{t('ord_branch_manual')}</span></div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
                {BRANCHES.map(branch => (
                    <button 
                        key={branch.id}
                        onClick={() => { setSelectedBranch(branch); setShowBranchModal(false); }}
                        className="w-full text-right p-4 rounded-xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all flex justify-between items-center"
                    >
                        <div>
                            <div className="font-bold text-gray-800">{branch.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{branch.address}</div>
                        </div>
                        {selectedBranch?.id === branch.id && <div className="w-4 h-4 rounded-full bg-brand-500"></div>}
                    </button>
                ))}
            </div>
            
            {!selectedBranch && <div className="mt-4 text-center text-xs text-gray-400">{t('ord_must_select_branch')}</div>}
        </div>
    </div>
  );

  // AddressFormModal removed as it is replaced by AddressMapScreen

  const CardFormModal = () => (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl px-6 pb-6 pt-3 animate-slide-up">
              <div className="flex justify-center mb-4 md:hidden"><span className="w-12 h-1.5 bg-gray-300 rounded-full"></span></div>
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{t('ord_add_card_title')}</h2>
                  <button onClick={() => setShowCardModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5 text-gray-500" />
                  </button>
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t('ord_card_number')}</label>
                      <input 
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          value={tempCard.number}
                          onChange={(e) => setTempCard({...tempCard, number: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">{t('ord_expiry')}</label>
                          <input 
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={tempCard.expiry}
                              onChange={(e) => setTempCard({...tempCard, expiry: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">{t('ord_cvv')}</label>
                          <input 
                              type="password"
                              placeholder="123"
                              maxLength={3}
                              value={tempCard.cvv}
                              onChange={(e) => setTempCard({...tempCard, cvv: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                          />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t('ord_card_holder')}</label>
                      <input 
                          type="text"
                          value={tempCard.holder}
                          onChange={(e) => setTempCard({...tempCard, holder: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                  </div>

                  <div className="flex gap-4 mt-6">
                      <button 
                          onClick={handleSaveCard}
                          className="flex-1 bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                      >
                          <Save className="w-5 h-5" />
                          {t('ord_save')}
                      </button>
                      <button 
                          onClick={() => setShowCardModal(false)}
                          className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                          {t('ord_cancel')}
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  const ProductDetailModal = () => {
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

    return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in">

                {/* Header image — title + price overlaid */}
                <div className="h-64 sm:h-80 relative shrink-0">
                    <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-ink/25" />
                    <button
                        onClick={() => setSelectedProduct(null)}
                        aria-label={t('ord_back')}
                        className="absolute top-4 start-4 w-11 h-11 bg-white/90 backdrop-blur text-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-white active:scale-95 transition-all"
                    >
                        <ArrowRight className={`w-6 h-6 ${language === 'en' ? 'rotate-180' : ''}`} />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 p-5">
                        <div className="max-w-2xl mx-auto flex items-end justify-between gap-3">
                            <h2 className="text-2xl font-display font-black text-white leading-tight drop-shadow">{selectedProduct.name}</h2>
                            <span className="shrink-0 bg-secondary-400 text-ink font-display font-black text-base rounded-full px-4 py-1.5 shadow-lg">{basePrice} {t('ord_sar')}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <div className="max-w-2xl mx-auto px-5 py-6">
                    <p className="text-gray-500 leading-relaxed mb-6">{selectedProduct.description}</p>

                    <div className="space-y-9">
                        {selectedProduct.modifiers?.map(group => (
                            <div key={group.id} className="border-t border-gray-200 pt-8 first:border-t-0 first:pt-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-display font-black text-gray-900 text-lg flex items-center gap-2.5">
                                        <span className="w-1.5 h-5 rounded-full bg-secondary-500" />
                                        {group.name}
                                    </h3>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${group.min > 0 ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {group.min > 0 ? t('ord_required') : t('ord_optional')}
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {group.options.map(option => {
                                        const isSelected = tempModifiers[group.id]?.includes(option.id) || false;
                                        const toggle = () => {
                                            const current = tempModifiers[group.id] || [];
                                            if (group.max === 1) {
                                                setTempModifiers({ ...tempModifiers, [group.id]: [option.id] });
                                            } else if (isSelected) {
                                                setTempModifiers({ ...tempModifiers, [group.id]: current.filter(id => id !== option.id) });
                                            } else if (current.length < group.max) {
                                                setTempModifiers({ ...tempModifiers, [group.id]: [...current, option.id] });
                                            }
                                        };
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={toggle}
                                                className="group w-full flex items-center justify-between py-3.5 text-start"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className={`w-5 h-5 ${group.max > 1 ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                                        {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                                                    </span>
                                                    <span className={`transition-colors ${isSelected ? 'font-bold text-brand-700' : 'font-medium text-gray-600'}`}>{option.name}</span>
                                                </span>
                                                {option.price > 0 && <span className={`text-sm font-bold ${isSelected ? 'text-brand-600' : 'text-gray-400'}`}>+{option.price} {t('ord_sar')}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Notes */}
                        <div className="border-t border-gray-200 pt-8">
                             <h3 className="font-display font-black text-gray-900 text-lg flex items-center gap-2.5 mb-3">
                                 <span className="w-1.5 h-5 rounded-full bg-secondary-500" />
                                 {t('ord_notes')}
                             </h3>
                             <textarea
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                rows={3}
                                placeholder={t('ord_special_inst')}
                             ></textarea>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="bg-white border-t border-gray-100">
                  <div className="max-w-2xl mx-auto p-4">
                    <div className="flex gap-3 items-center">
                        <div className="flex items-center bg-gray-100 rounded-full px-1.5 shrink-0">
                            <button onClick={() => setTempQty(Math.max(1, tempQty - 1))} aria-label="-" className="w-9 h-9 flex items-center justify-center text-gray-700 hover:text-brand-600"><Minus className="w-5 h-5" /></button>
                            <span className="font-black w-7 text-center">{tempQty}</span>
                            <button onClick={() => setTempQty(tempQty + 1)} aria-label="+" className="w-9 h-9 flex items-center justify-center text-gray-700 hover:text-brand-600"><Plus className="w-5 h-5" /></button>
                        </div>
                        <button
                            onClick={addToCart}
                            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2.5 shadow-lg shadow-brand-600/25 transition-all"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span>{t('ord_add_to_cart')}</span>
                            <span className="font-black">· {(currentTotal * tempQty).toFixed(2)} {t('ord_sar')}</span>
                        </button>
                    </div>
                  </div>
                </div>
        </div>
    );
  };

  // --- Screens ---

  const OrderDetailsScreen = () => {
    if (!selectedOrder) return null;

    const subtotal = selectedOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = 15;
    const vat = subtotal * 0.15;

    return (
        <div className="pt-6 pb-32 px-4 max-w-2xl mx-auto animate-fade-in">
             <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setActiveTab('ORDERS')} className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                    <ArrowRight className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-display font-black flex items-center gap-2 text-gray-900">
                        {t('ord_order_details')}
                        <span className="text-sm font-normal text-gray-400" dir="ltr">#{selectedOrder.id}</span>
                    </h2>
                    <p className="text-xs text-gray-400">{selectedOrder.date}</p>
                </div>
                <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>{getStatusText(selectedOrder.status)}</span>
            </div>

            {/* live status tracker (active orders) */}
            {['pending', 'preparing', 'ready', 'delivering'].includes(selectedOrder.status) && (() => {
                const steps = language === 'ar' ? ['استلام', 'تحضير', 'جاهز', 'في الطريق'] : ['Received', 'Preparing', 'Ready', 'On the way'];
                const stepIndex = ({ pending: 0, preparing: 1, ready: 2, delivering: 3 } as Record<string, number>)[selectedOrder.status] ?? 0;
                return (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
                        <div className="flex items-start">
                            {steps.map((s, i) => (
                                <React.Fragment key={i}>
                                    <div className="flex flex-col items-center gap-1 shrink-0 w-14">
                                        <span className={`w-2.5 h-2.5 rounded-full ${i <= stepIndex ? 'bg-brand-600' : 'bg-gray-200'}`} />
                                        <span className={`text-[9px] font-bold text-center leading-tight ${i <= stepIndex ? 'text-brand-600' : 'text-gray-400'}`}>{s}</span>
                                    </div>
                                    {i < steps.length - 1 && <span className={`flex-1 h-0.5 rounded-full mt-[5px] ${i < stepIndex ? 'bg-brand-600' : 'bg-gray-200'}`} />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                );
            })()}

            {/* items */}
            <section className="mb-5">
                <h3 className="flex items-center gap-2.5 font-display font-bold text-gray-900 mb-3"><span className="w-1.5 h-5 rounded-full bg-secondary-500" />{t('ord_items')}</h3>
                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                    {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-brand-50 text-brand-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0" dir="ltr">{item.quantity}×</span>
                                <span className="font-bold text-gray-800">{item.name}</span>
                            </div>
                            <span className="font-display font-bold text-brand-700">{item.price * item.quantity} {t('ord_sar')}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* info */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                 <div className="bg-white p-4 rounded-2xl border border-gray-100">
                     <p className="text-xs text-gray-400 mb-1">{t('ord_order_type')}</p>
                     <p className="font-bold text-gray-900 flex items-center gap-2">
                        {React.createElement(getOrderTypeIcon(selectedOrder.type), { className: "w-4 h-4 text-brand-700" })}
                        {getOrderTypeLabel(selectedOrder.type)}
                     </p>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border border-gray-100">
                     <p className="text-xs text-gray-400 mb-1">{t('ord_payment_method')}</p>
                     <p className="font-bold text-gray-900 flex items-center gap-2">
                        {selectedOrder.payment === 'APPLE' ? <Smartphone className="w-4 h-4 text-gray-900"/> : selectedOrder.payment === 'CARD' ? <CreditCard className="w-4 h-4 text-brand-700"/> : <Banknote className="w-4 h-4 text-green-500"/>}
                        {selectedOrder.payment === 'APPLE' ? t('ord_apple') : selectedOrder.payment === 'CARD' ? t('ord_card') : t('ord_cash')}
                     </p>
                 </div>
            </div>

            {/* summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
                <h3 className="flex items-center gap-2.5 font-display font-bold text-gray-900 mb-4"><span className="w-1.5 h-5 rounded-full bg-secondary-500" />{t('ord_summary')}</h3>
                <div className="flex justify-between text-sm text-gray-500 mb-3"><span>{t('ord_subtotal')}</span><span className="font-bold text-gray-700">{subtotal.toFixed(2)} {t('ord_sar')}</span></div>
                <div className="flex justify-between text-sm text-gray-500 mb-3"><span>{t('ord_delivery_fee')}</span><span className="font-bold text-gray-700">{deliveryFee.toFixed(2)} {t('ord_sar')}</span></div>
                <div className="flex justify-between text-sm text-gray-500 mb-4"><span>{t('ord_vat')}</span><span className="font-bold text-gray-700">{vat.toFixed(2)} {t('ord_sar')}</span></div>
                <div className="border-t-2 border-dashed border-gray-200" />
                <div className="flex justify-between items-center pt-4"><span className="font-display font-black text-lg text-gray-900">{t('ord_total')}</span><span className="font-display font-black text-2xl text-brand-700">{selectedOrder.total} {t('ord_sar')}</span></div>
            </div>

            {/* actions */}
            <div className="flex gap-3">
                 <button className="flex-1 bg-brand-600 text-white font-bold py-3.5 rounded-full hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"><RefreshCw className="w-5 h-5" />{t('ord_reorder')}</button>
                 <button className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-3.5 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"><HelpCircle className="w-5 h-5" />{t('ord_help')}</button>
            </div>
        </div>
    );
  };

  const PointsScreen = () => {
      const [view, setView] = useState<'rewards' | 'history'>('rewards');

      const history = [
          { id: 1, title: t('ord_order_no') + ' #9821', date: '2023-11-20', points: 50, type: 'earn' },
          { id: 2, title: 'Free Pepsi Reward', date: '2023-11-15', points: -150, type: 'spend' },
          { id: 3, title: t('ord_order_no') + ' #9800', date: '2023-11-10', points: 120, type: 'earn' },
      ];

      const rewards = [
          { id: 1, title: 'Free Soft Drink', cost: 150, icon: '🥤' },
          { id: 2, title: '15% Discount', cost: 500, icon: '🏷️' },
          { id: 3, title: 'Free Chicken Kabsa', cost: 1000, icon: '🍗' },
      ];

      return (
          <div className="pt-6 pb-32 px-4 max-w-2xl mx-auto animate-fade-in">
              {/* header */}
              <div className="flex items-center gap-3 mb-5">
                  <button onClick={() => setActiveTab('PROFILE')} className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                      <ArrowRight className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
                  </button>
                  <h2 className="text-2xl font-display font-black text-gray-900">{t('ord_points_page')}</h2>
              </div>

              {/* balance card — gradient + gold */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 text-white p-8 text-center mb-6">
                  <span className="absolute -top-12 -end-10 w-40 h-40 rounded-full bg-white/10" />
                  <span className="absolute -bottom-14 -start-10 w-36 h-36 rounded-full border border-white/15" />
                  <div className="relative">
                      <Star className="w-8 h-8 text-secondary-400 fill-current mx-auto mb-2" />
                      <h1 className="text-6xl font-display font-black text-secondary-400" dir="ltr">{points}</h1>
                      <p className="text-white/70 font-bold mt-1">{t('ord_points_bal')}</p>
                  </div>
              </div>

              {/* tabs — pill */}
              <div className="flex p-1 bg-gray-100 rounded-full mb-6">
                  <button onClick={() => setView('rewards')} className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 ${view === 'rewards' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'text-gray-500'}`}><Gift className="w-4 h-4" />{t('ord_rewards')}</button>
                  <button onClick={() => setView('history')} className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 ${view === 'history' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'text-gray-500'}`}><Clock className="w-4 h-4" />{t('ord_points_history')}</button>
              </div>

              {/* content */}
              {view === 'rewards' ? (
                  <div className="grid grid-cols-2 gap-4">
                      {rewards.map(r => (
                          <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-100 text-center">
                              <div className="text-4xl mb-3">{r.icon}</div>
                              <h3 className="font-bold text-gray-900 text-sm mb-1">{r.title}</h3>
                              <p className="text-brand-700 font-display font-black mb-3" dir="ltr">{r.cost} {t('ord_points')}</p>
                              <button className="w-full bg-brand-50 text-brand-700 font-bold py-2 rounded-full hover:bg-brand-100 transition-colors text-sm">{t('ord_redeem')}</button>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="space-y-3">
                      {history.map(h => (
                          <div key={h.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100">
                              <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${h.type === 'earn' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{h.type === 'earn' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}</div>
                                  <div className="min-w-0">
                                      <div className="font-bold text-gray-900 text-sm truncate">{h.title}</div>
                                      <div className="text-xs text-gray-400 mt-0.5">{h.date}</div>
                                  </div>
                              </div>
                              <div className={`font-display font-black ${h.type === 'earn' ? 'text-green-600' : 'text-red-500'}`} dir="ltr">{h.type === 'earn' ? '+' : ''}{h.points}</div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  }

  const AddressesScreen = () => {
    return (
        <div className="pt-6 pb-32 px-4 max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setActiveTab('PROFILE')} className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                    <ArrowRight className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
                </button>
                <h2 className="text-2xl font-display font-black text-gray-900">{t('ord_saved_addresses')}</h2>
            </div>

            <div className="space-y-3">
                {savedAddresses.map(addr => (
                    <div key={addr.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <span className="w-11 h-11 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 shrink-0">
                            <MapPin className="w-5 h-5" />
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 truncate">{addr.label}</h3>
                                {addr.isDefault && <span className="text-[10px] bg-secondary-100 text-brand-700 px-2 py-0.5 rounded-full font-bold shrink-0">{t('ord_default')}</span>}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5 truncate">{addr.address}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                            <button onClick={() => { setTempAddress(addr); setActiveTab('MAP_ADDRESS'); }} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-brand-700 hover:bg-gray-50"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteAddress(addr.id)} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => {
                    setTempAddress({ id: 0, type: '', label: '', address: '', isDefault: false, lat: 21.4225, lng: 39.8262 });
                    setActiveTab('MAP_ADDRESS');
                }}
                className="w-full mt-5 bg-brand-50 text-brand-700 font-bold py-3.5 rounded-2xl hover:bg-brand-100 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                {t('ord_add_address')}
            </button>
        </div>
    );
  };

  const PaymentsScreen = () => {
    return (
        <div className="pt-6 pb-32 px-4 max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setActiveTab('PROFILE')} className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                    <ArrowRight className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
                </button>
                <h2 className="text-2xl font-display font-black text-gray-900">{t('ord_saved_cards')}</h2>
            </div>

            <div className="space-y-3">
                {/* Apple Pay */}
                <div className="bg-ink text-white p-4 rounded-2xl flex items-center gap-3">
                    <span className="w-12 h-8 bg-white/15 rounded-md flex items-center justify-center font-bold text-xs shrink-0">Pay</span>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold">Apple Pay</h3>
                        <p className="text-xs text-white/50">{t('ord_card_linked_wallet')}</p>
                    </div>
                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                </div>

                {/* Saved Cards List */}
                {savedCards.map(card => (
                    <div key={card.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <span className={`w-12 h-8 rounded-md flex items-center justify-center text-white italic font-bold text-xs shrink-0 ${card.type === 'VISA' ? 'bg-brand-800' : 'bg-secondary-500 text-ink'}`}>{card.type}</span>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900" dir="ltr">{card.number}</h3>
                            <p className="text-sm text-gray-500">{t('ord_card_expires')} {card.expiry}</p>
                        </div>
                        <button onClick={() => handleDeleteCard(card.id)} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>

            <button
                onClick={() => {
                    setTempCard({ number: '', expiry: '', cvv: '', holder: '' });
                    setShowCardModal(true);
                }}
                className="w-full mt-5 bg-brand-50 text-brand-700 font-bold py-3.5 rounded-2xl hover:bg-brand-100 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                {t('ord_add_card')}
            </button>
        </div>
    );
  };

  const SettingsScreen = () => {
    return (
        <div className="pt-6 pb-32 px-4 max-w-2xl mx-auto animate-fade-in">
             <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setActiveTab('PROFILE')} className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                    <ArrowRight className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
                </button>
                <h2 className="text-2xl font-display font-black text-gray-900">{t('ord_settings_privacy')}</h2>
            </div>

            <div className="space-y-5">
                {/* General */}
                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                    <button onClick={toggleLanguage} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center"><Globe className="w-5 h-5" /></span>
                            <span className="font-bold text-gray-800">{t('ord_language')}</span>
                        </div>
                        <span className="text-sm font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full">{language === 'ar' ? 'العربية' : 'English'}</span>
                    </button>
                    <div className="w-full p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center"><Bell className="w-5 h-5" /></span>
                            <span className="font-bold text-gray-800">{t('ord_notifications')}</span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={notificationsOn}
                            aria-label={t('ord_notifications')}
                            onClick={() => setNotificationsOn(v => !v)}
                            className={`w-12 h-7 rounded-full relative shrink-0 transition-colors ${notificationsOn ? 'bg-brand-600' : 'bg-gray-300'}`}
                        >
                            <span className={`w-5 h-5 bg-white rounded-full absolute top-1 right-1 shadow transition-transform ${notificationsOn ? '-translate-x-5' : ''}`}></span>
                        </button>
                    </div>
                </div>

                {/* Account */}
                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                     <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"><Shield className="w-5 h-5" /></span>
                            <span className="font-bold text-gray-800">{t('ord_settings_privacy')}</span>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-300" />
                    </button>
                    <button onClick={onBackToPortal} className="w-full p-4 flex items-center gap-3 hover:bg-red-50/50 transition-colors">
                        <span className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center"><LogOut className="w-5 h-5" /></span>
                        <span className="font-bold text-red-500">{t('ord_logout')}</span>
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="pt-2">
                    <button className="w-full text-red-500 text-sm font-bold py-3 hover:text-red-600 transition-colors">{t('ord_delete_account')}</button>
                    <p className="text-center text-xs text-gray-400 mt-1">App Version 2.0.1</p>
                </div>
            </div>
        </div>
    );
  };

  const MenuScreen = () => {
     const categories = Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)));

     const BANNERS = [
        { id: 1, title: language === 'ar' ? 'عرض الغداء' : 'Lunch Offer', subtitle: language === 'ar' ? 'خصم 20% على جميع الكبسات' : '20% OFF on all Kabsa', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800' },
        { id: 2, title: language === 'ar' ? 'توصيل مجاني' : 'Free Delivery', subtitle: language === 'ar' ? 'للطلبات فوق 100 ريال' : 'Orders above 100 SAR', image: 'https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?q=80&w=800&auto=format&fit=crop' },
        { id: 3, title: language === 'ar' ? 'جديدنا' : 'New Item', subtitle: language === 'ar' ? 'جرب الجريش الأحمر' : 'Try Red Jareesh', image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&q=80&w=800' }
     ];

     return (
        <div className="pb-28 pt-32 px-4 max-w-2xl mx-auto">
            {/* Featured banners */}
             <div className="mb-8 -mx-4 px-4">
                <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
                    {BANNERS.map(banner => (
                        <div key={banner.id} className="min-w-[88%] md:min-w-[60%] h-44 rounded-3xl relative overflow-hidden snap-center shadow-lg shadow-brand-900/10">
                            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent"></div>
                            <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                                <span className="inline-flex items-center gap-1.5 bg-secondary-500 text-ink text-xs font-black px-3 py-1 rounded-full w-fit mb-2">
                                    <TicketPercent className="w-3.5 h-3.5" />
                                    {banner.title}
                                </span>
                                <p className="text-sm font-medium text-gray-100">{banner.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category tabs (editorial underline) */}
            <div className={`flex gap-7 overflow-x-auto no-scrollbar mb-6 sticky top-[58px] z-30 backdrop-blur pt-2.5 pb-0 -mx-4 px-4 border-b transition-colors ${scrolled ? 'bg-white/95 border-gray-100' : 'bg-pageBg/95 border-transparent'}`}>
                {[{ id: 'الكل', label: language === 'ar' ? 'الكل' : 'All' }, ...categories.map(c => ({ id: c, label: c }))].map(cat => {
                    const isActive = activeCat === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCat(cat.id)}
                            className={`relative whitespace-nowrap pb-3 text-base font-bold transition-colors ${isActive ? 'text-brand-700' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {cat.label}
                            {isActive && <span className="absolute -bottom-px inset-x-0 h-[3px] bg-secondary-500 rounded-full"></span>}
                        </button>
                    );
                })}
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 gap-4">
                {MOCK_PRODUCTS.filter(p => (activeCat === 'الكل' || p.category === activeCat) && (!searchQuery.trim() || p.name.includes(searchQuery) || p.description.includes(searchQuery))).map((product) => (
                    <div
                        key={product.id}
                        className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md cursor-pointer relative flex flex-col"
                        onClick={() => setSelectedProduct(product)}
                    >
                        <div className="relative h-40 overflow-hidden bg-gray-100">
                            <img src={product.image} loading="lazy" className="w-full h-full object-cover" alt={product.name} />
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                                aria-label={t('ord_favorites')}
                                className={`absolute top-2.5 end-2.5 p-1.5 rounded-full backdrop-blur-sm transition-colors ${favorites.includes(product.id) ? 'text-brand-600 bg-white' : 'text-white bg-black/25 hover:bg-black/40'}`}
                            >
                                <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                            </button>
                            {product.calories ? (
                                <span className="absolute bottom-2 start-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    <Flame className="w-3 h-3 text-secondary-400" /> {product.calories} {t('ord_calories')}
                                </span>
                            ) : null}
                        </div>
                        <div className="p-3 flex flex-col flex-1">
                            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">{product.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3 flex-1">{product.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="font-black text-brand-700 text-lg">{product.price} <span className="text-xs font-bold text-gray-400">{t('ord_sar')}</span></span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                    aria-label={t('ord_add')}
                                    className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 active:scale-95 shadow-md shadow-brand-900/20 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
     );
  };

  const CartScreen = () => {
      const ar = language === 'ar';
      const [redeem, setRedeem] = useState(0); // SAR discounted from loyalty points
      const maxRedeem = Math.floor(points / 10); // 10 points = 1 SAR
      const grandTotal = Math.max(0, cartTotal + 15 - redeem);

      if (cart.length === 0) return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
              <div className="w-24 h-24 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('ord_cart_empty_title')}</h3>
              <p className="text-gray-600 mb-8">{t('ord_cart_empty_desc')}</p>
              <button onClick={() => setActiveTab('HOME')} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold">{t('ord_add_to_cart')}</button>
          </div>
      );

      return (
          <div className="pt-16 pb-32 px-4 max-w-2xl mx-auto">
              {/* header — count merged into the title */}
              <div className="flex items-center justify-between mb-5">
                  <h2 className="text-3xl font-display font-black text-gray-900 flex items-baseline gap-2">
                      {t('ord_cart')}
                      <span className="text-base font-bold text-gray-400">{cart.reduce((s, i) => s + i.quantity, 0)} {language === 'ar' ? 'صنف' : 'items'}</span>
                  </h2>
                  <button onClick={() => setCart([])} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">{language === 'ar' ? 'تفريغ السلة' : 'Clear all'}</button>
              </div>

              {/* items */}
              <div className="space-y-3 mb-6">
                  {cart.map((item) => {
                      const mods = Object.values(item.selectedModifiers).flat().map(optId => {
                          for (const grp of item.product.modifiers || []) {
                              const opt = grp.options.find(o => o.id === optId);
                              if (opt) return opt.name;
                          }
                          return null;
                      }).filter(Boolean) as string[];
                      const setQty = (q: number) => setCart(cart.map(c => c.cartId === item.cartId ? { ...c, quantity: Math.max(1, q) } : c));
                      return (
                          <div key={item.cartId} className="relative h-[88px] flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm ps-3 pe-3 pt-3 pb-3">
                              {/* remove — obvious, top-left corner */}
                              <button
                                  onClick={() => setCart(cart.filter(c => c.cartId !== item.cartId))}
                                  aria-label={t('ord_cancel')}
                                  className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm transition-colors"
                              >
                                  <X className="w-4 h-4" strokeWidth={2.5} />
                              </button>
                              <img src={item.product.image} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                              <div className="flex-1 min-w-0">
                                  <h3 className="font-display font-bold text-gray-900 leading-tight truncate">{item.product.name}</h3>
                                  {mods.length > 0 && <p className="text-[11px] text-gray-400 truncate mt-0.5">{mods.join(' · ')}</p>}
                                  <div className="flex items-center justify-between gap-2 mt-1.5">
                                      <span className="font-display font-black text-brand-700">{item.product.price * item.quantity} {t('ord_sar')}</span>
                                      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 shrink-0">
                                          <button onClick={() => setQty(item.quantity - 1)} aria-label="-" className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-600 hover:bg-brand-50"><Minus className="w-3.5 h-3.5" /></button>
                                          <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                                          <button onClick={() => setQty(item.quantity + 1)} aria-label="+" className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-600 hover:bg-brand-50"><Plus className="w-3.5 h-3.5" /></button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>

              {/* Loyalty — one toggle that applies your points discount */}
              <button
                  onClick={() => setRedeem(redeem > 0 ? 0 : maxRedeem)}
                  className={`w-full text-start rounded-2xl border-2 p-4 mb-6 flex items-center justify-between gap-4 transition-all ${redeem > 0 ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white'}`}
              >
                  <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${redeem > 0 ? 'bg-brand-600 text-white' : 'bg-secondary-100 text-secondary-600'}`}>
                          <Star className="w-5 h-5 fill-current" />
                      </span>
                      <div className="min-w-0">
                          <strong className="block text-gray-900">{t('ord_loyalty_redeem')}</strong>
                          <span className="block text-xs text-gray-500" dir="ltr">{points} {t('points')} = {maxRedeem} {t('ord_sar')}</span>
                      </div>
                  </div>
                  <span className={`relative w-12 h-7 rounded-full shrink-0 transition-colors ${redeem > 0 ? 'bg-brand-600' : 'bg-gray-300'}`}>
                      <span className={`absolute top-1 right-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${redeem > 0 ? '-translate-x-5' : ''}`} />
                  </span>
              </button>

              {/* Receipt-style summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between text-sm text-gray-500 mb-3"><span>{t('ord_total')}</span><span className="font-bold text-gray-700">{cartTotal} {t('ord_sar')}</span></div>
                  <div className="flex justify-between text-sm text-gray-500 mb-3"><span>{t('ord_delivery')}</span><span className="font-bold text-gray-700">15 {t('ord_sar')}</span></div>
                  {redeem > 0 && (
                      <div className="flex justify-between text-sm text-green-600 mb-4">
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-current" />{ar ? 'خصم النقاط' : 'Points discount'}</span>
                          <span className="font-bold" dir="ltr">- {redeem} {t('ord_sar')}</span>
                      </div>
                  )}
                  <div className="border-t-2 border-dashed border-gray-200 mt-1" />
                  <div className="flex justify-between items-center pt-4">
                      <span className="font-display font-black text-lg text-gray-900">{t('ord_total')}</span>
                      <span className="font-display font-black text-2xl text-brand-700">{grandTotal} {t('ord_sar')}</span>
                  </div>
              </div>

              <button
                  onClick={() => setActiveTab('CHECKOUT')}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-full shadow-lg shadow-brand-600/25 mt-6 text-lg transition-all flex justify-center items-center gap-2"
              >
                  {t('ord_checkout')}
                  <ChevronLeft className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
              </button>
          </div>
      );
  };

  const CheckoutScreen = () => {
    const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];
    const ar = language === 'ar';
    const payMethods = [
        { id: 'APPLE', label: t('ord_apple'), node: <span className="bg-black text-white px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"><Smartphone className="w-3 h-3" /> Pay</span> },
        { id: 'CARD', label: t('ord_card'), node: <CreditCard className="w-5 h-5 text-brand-700" /> },
        { id: 'CASH', label: t('ord_cash'), node: <Banknote className="w-5 h-5 text-green-500" /> },
    ];
    const steps = [
        { n: '1', label: ar ? 'السلة' : 'Cart' },
        { n: '2', label: ar ? 'المراجعة' : 'Review' },
        { n: '3', label: ar ? 'التأكيد' : 'Confirm' },
    ];

    return (
        <div className="pt-6 pb-32 px-4 max-w-2xl mx-auto animate-fade-in">
             <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setActiveTab('CART')} className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                    <ArrowRight className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
                </button>
                <h2 className="text-2xl font-display font-black text-gray-900">{t('ord_checkout_title')}</h2>
            </div>

            {/* guided step indicator (Cart › Review › Confirm) */}
            <div className="flex items-center mb-7">
                {steps.map((s, i) => {
                    const reached = i <= 1; // review is the current step
                    return (
                        <React.Fragment key={i}>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center ${reached ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`} dir="ltr">{s.n}</span>
                                <span className={`text-xs font-bold ${reached ? 'text-brand-700' : 'text-gray-400'}`}>{s.label}</span>
                            </div>
                            {i < steps.length - 1 && <span className={`flex-1 h-0.5 mx-2 rounded ${i < 1 ? 'bg-brand-600' : 'bg-gray-200'}`} />}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Delivery Time */}
            <section className="mb-6">
                <h3 className="flex items-center gap-2.5 font-display font-bold text-gray-900 mb-3"><span className="w-1.5 h-5 rounded-full bg-secondary-500" />{t('ord_delivery_time')}</h3>
                <div className="grid grid-cols-2 gap-3">
                    {([['ASAP', t('ord_asap'), Bike], ['LATER', t('ord_later'), Clock]] as const).map(([id, label, Icon]) => {
                        const on = deliveryTime === id;
                        return (
                            <button key={id} onClick={() => setDeliveryTime(id)} className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${on ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${on ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500'}`}><Icon className="w-5 h-5" /></span>
                                <span className={`font-bold ${on ? 'text-brand-700' : 'text-gray-700'}`}>{label}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Address */}
            <section className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="flex items-center gap-2.5 font-display font-bold text-gray-900"><span className="w-1.5 h-5 rounded-full bg-secondary-500" />{t('ord_delivering_to')}</h3>
                    <button onClick={() => setActiveTab('ADDRESSES')} className="text-sm font-bold text-brand-700 hover:underline">{t('ord_change')}</button>
                </div>
                {selectedAddress ? (
                    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                        <span className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></span>
                        <div className="min-w-0">
                            <div className="font-bold text-gray-900">{selectedAddress.label}</div>
                            <div className="text-sm text-gray-500 truncate">{selectedAddress.address}</div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setTempAddress({ id: 0, type: '', label: '', address: '', isDefault: false, lat: 21.4225, lng: 39.8262 });
                            setActiveTab('MAP_ADDRESS');
                        }}
                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-600 font-bold hover:bg-gray-50"
                    >
                        {t('ord_select_address')}
                    </button>
                )}
            </section>

            {/* Payment Method */}
            <section className="mb-6">
                <h3 className="flex items-center gap-2.5 font-display font-bold text-gray-900 mb-3"><span className="w-1.5 h-5 rounded-full bg-secondary-500" />{t('ord_paying_with')}</h3>
                <div className="space-y-2.5">
                    {payMethods.map(pm => {
                        const on = selectedPaymentMethod === pm.id;
                        return (
                            <button key={pm.id} onClick={() => setSelectedPaymentMethod(pm.id as typeof selectedPaymentMethod)} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${on ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                <span className="flex items-center gap-3">
                                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300'}`}>{on && <Check className="w-3 h-3" strokeWidth={3} />}</span>
                                    {pm.node}
                                    <span className="font-bold text-gray-900">{pm.label}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Summary breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-3"><span>{t('ord_total')}</span><span className="font-bold text-gray-700">{cartTotal} {t('ord_sar')}</span></div>
                <div className="flex justify-between text-sm text-gray-500 mb-4"><span>{t('ord_delivery')}</span><span className="font-bold text-gray-700">15 {t('ord_sar')}</span></div>
                <div className="border-t-2 border-dashed border-gray-200" />
                <div className="flex justify-between items-center pt-4">
                    <span className="font-display font-black text-lg text-gray-900">{t('ord_total')}</span>
                    <span className="font-display font-black text-2xl text-brand-700">{cartTotal + 15} {t('ord_sar')}</span>
                </div>
            </div>

            <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-full shadow-lg shadow-brand-600/25 text-lg transition-all flex justify-center items-center gap-2.5"
            >
                {isPlacingOrder ? <Loader className="w-6 h-6 animate-spin" /> : <><ShoppingBag className="w-5 h-5" /> {t('ord_place_order')} <span className="font-black">· {cartTotal + 15} {t('ord_sar')}</span></>}
            </button>
        </div>
    );
  }

  const OrdersScreen = () => {
      const [filter, setFilter] = useState<'active' | 'history'>('active');
      
      const filteredOrders = orders.filter(order => {
          if (filter === 'active') {
              return ['pending', 'preparing', 'ready', 'delivering'].includes(order.status);
          } else {
              return ['completed', 'cancelled'].includes(order.status);
          }
      });

      const steps = language === 'ar' ? ['استلام', 'تحضير', 'جاهز', 'في الطريق'] : ['Received', 'Preparing', 'Ready', 'On the way'];
      const stepOf: Record<string, number> = { pending: 0, preparing: 1, ready: 2, delivering: 3 };

      return (
          <div className="pt-6 pb-32 px-4 max-w-2xl mx-auto">
              <h2 className="text-3xl font-display font-black mb-6 text-gray-900">{t('ord_track')}</h2>

              {/* Tabs */}
              <div className="flex p-1 bg-gray-100 rounded-full mb-6">
                  <button onClick={() => setFilter('active')} className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${filter === 'active' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'text-gray-500'}`}>{t('ord_active_orders')}</button>
                  <button onClick={() => setFilter('history')} className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${filter === 'history' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'text-gray-500'}`}>{t('ord_past_orders')}</button>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                       <div className="text-center py-16 text-gray-400">
                           <Package className="w-16 h-16 mx-auto mb-4 opacity-40" />
                           <p>{language === 'ar' ? 'لا توجد طلبات في هذه القائمة' : 'No orders found'}</p>
                       </div>
                  ) : (
                      filteredOrders.map(order => {
                          const stepIndex = stepOf[order.status] ?? 0;
                          return (
                          <div key={order.id} className="bg-white rounded-2xl border border-gray-100">
                              {/* head + tracker */}
                              <div className="p-4">
                                  <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                              <span className="font-display font-bold text-gray-900" dir="ltr">#{order.id}</span>
                                              <span className="text-xs text-gray-400">· {order.date}</span>
                                          </div>
                                          <p className="text-sm text-gray-500 mt-1 truncate">{order.items.map(it => `${it.quantity}× ${it.name}`).join(' · ')}</p>
                                      </div>
                                      <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                                  </div>

                                  {filter === 'active' && (
                                      <div className="flex items-start mt-4">
                                          {steps.map((s, i) => (
                                              <React.Fragment key={i}>
                                                  <div className="flex flex-col items-center gap-1 shrink-0 w-14">
                                                      <span className={`w-2.5 h-2.5 rounded-full ${i <= stepIndex ? 'bg-brand-600' : 'bg-gray-200'}`} />
                                                      <span className={`text-[9px] font-bold text-center leading-tight ${i <= stepIndex ? 'text-brand-600' : 'text-gray-400'}`}>{s}</span>
                                                  </div>
                                                  {i < steps.length - 1 && <span className={`flex-1 h-0.5 rounded-full mt-[5px] ${i < stepIndex ? 'bg-brand-600' : 'bg-gray-200'}`} />}
                                              </React.Fragment>
                                          ))}
                                      </div>
                                  )}
                              </div>

                              {/* footer — light divider, no fill */}
                              <div className="flex justify-between items-center px-4 py-2.5 border-t border-gray-50">
                                  <span className="text-sm"><span className="text-gray-400">{t('ord_total')} </span><span className="font-bold text-brand-700">{order.total} {t('ord_sar')}</span></span>
                                  <div className="flex gap-2">
                                      {filter === 'history' && (
                                          <button className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors">
                                              <RefreshCw className="w-3.5 h-3.5" /> {t('ord_reorder')}
                                          </button>
                                      )}
                                      <button onClick={() => { setSelectedOrder(order); setActiveTab('ORDER_DETAILS'); }} className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                                          {t('ord_details')}
                                      </button>
                                  </div>
                              </div>
                          </div>
                          );
                      })
                  )}
              </div>
          </div>
      );
  };

  const ProfileScreen = () => {
      const ar = language === 'ar';
      const menu = [
          { Icon: ShoppingBag, label: t('ord_track'), go: () => setActiveTab('ORDERS') },
          { Icon: MapPin, label: t('ord_saved_addresses'), go: () => setActiveTab('ADDRESSES') },
          { Icon: CreditCard, label: t('ord_saved_cards'), go: () => setActiveTab('PAYMENTS') },
          { Icon: ShieldCheck, label: t('ord_settings_privacy'), go: () => setActiveTab('SETTINGS') },
      ];
      return (
      <div className="pt-6 pb-32 px-4 max-w-2xl mx-auto">
          {/* hero profile card — white */}
          <div className="rounded-3xl bg-white border border-[#eee1d0] shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><User className="w-8 h-8" /></div>
                  <div className="min-w-0">
                      <h2 className="text-xl font-display font-black text-brand-800 truncate">{t('ord_guest_name')}</h2>
                      <p className="text-gray-500 text-sm">{ar ? 'مرحباً بك في المضياف العربي' : 'Welcome to Al Medhyaf'}</p>
                  </div>
              </div>
              <div className="mt-5 flex items-center justify-between bg-secondary-50 border border-secondary-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                      <Star className="w-6 h-6 text-secondary-500 fill-current shrink-0" />
                      <div className="leading-tight">
                          <span className="block text-2xl font-display font-black text-brand-700" dir="ltr">{points}</span>
                          <span className="block text-[11px] text-gray-500">{t('ord_points_bal')}</span>
                      </div>
                  </div>
                  <button onClick={() => setActiveTab('POINTS')} className="bg-brand-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-brand-700 transition-colors shrink-0">{t('ord_loyalty_redeem')}</button>
              </div>
          </div>

          {/* menu list */}
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden mb-6">
              {menu.map((m, i) => (
                  <button key={i} onClick={m.go} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                      <span className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><m.Icon className="w-5 h-5" /></span>
                      <span className="flex-1 text-start font-bold text-gray-800">{m.label}</span>
                      <ChevronLeft className="w-5 h-5 text-gray-300" />
                  </button>
              ))}
          </div>

          {/* logout */}
          <button onClick={onBackToPortal} className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 transition-colors">
              <LogOut className="w-5 h-5" />
              {t('ord_logout')}
          </button>
      </div>
      );
  };

  return (
    <div className="min-h-screen bg-pageBg font-sans" dir={dir}>

      {/* Top Header — only on the menu & cart (sub-pages have their own headers) */}
      {(activeTab === 'HOME' || activeTab === 'CART') && (
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-pageBg'}`}>
          <div className="container mx-auto max-w-2xl px-4 pt-2.5 pb-2.5">

              {/* Line 1 — branch + order-type (collapses on scroll) */}
              <div className={`overflow-hidden transition-all duration-300 ${scrolled ? 'max-h-0 opacity-0' : 'max-h-14 opacity-100'}`}>
                  <div className="flex items-center justify-between gap-3 pb-0.5">
                      <button className="flex items-center gap-2 shrink-0 text-start" onClick={() => setShowBranchModal(true)}>
                          <MapPin className="w-5 h-5 text-brand-600 shrink-0" />
                          <span className="font-bold text-sm text-gray-900 flex items-center gap-1 truncate max-w-[42vw]">
                              {selectedBranch ? selectedBranch.name : t('ord_locating')}
                              <ChevronDown className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                          </span>
                      </button>

                      <button
                        onClick={() => setShowOrderTypeModal(true)}
                        className="flex items-center gap-2 bg-secondary-500 text-ink px-3.5 py-2 rounded-full font-bold shrink-0 shadow-sm hover:bg-secondary-600 transition-colors"
                      >
                          {React.createElement(getOrderTypeIcon(orderType), { className: "w-4 h-4" })}
                          <span className="text-xs">{getOrderTypeLabel(orderType)}</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                  </div>
              </div>

              {/* Line 2 — search (menu only) */}
              {activeTab === 'HOME' && (
                <div className={`relative transition-all duration-300 ${scrolled ? 'mt-0' : 'mt-2.5'}`}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('ord_search') + '...'}
                        aria-label={t('ord_search')}
                        className="w-full h-10 bg-gray-50 border border-gray-200 rounded-full ps-11 pe-4 text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                    <Search className="w-5 h-5 text-brand-600 absolute top-2.5 start-4" />
                </div>
              )}
          </div>
      </div>
      )}

      {/* Main Content Area */}
      <main className="min-h-screen container mx-auto max-w-2xl">
          {activeTab === 'HOME' && <MenuScreen />}
          {activeTab === 'CART' && <CartScreen />}
          {activeTab === 'CHECKOUT' && <CheckoutScreen />}
          {activeTab === 'PROFILE' && <ProfileScreen />}
          {activeTab === 'ORDERS' && <OrdersScreen />}
          
          {/* Sub-Pages */}
          {activeTab === 'ADDRESSES' && <AddressesScreen />}
          {activeTab === 'MAP_ADDRESS' && <AddressMapScreen />}
          {activeTab === 'PAYMENTS' && <PaymentsScreen />}
          {activeTab === 'SETTINGS' && <SettingsScreen />}
          {activeTab === 'ORDER_DETAILS' && <OrderDetailsScreen />}
          {activeTab === 'POINTS' && <PointsScreen />}

          {activeTab === 'FAVORITES' && (
              <div className="pt-32 px-4 text-center">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">{t('ord_favorites')}</h2>
                  <p className="text-gray-600">{t('ord_favorites_empty')}</p>
              </div>
          )}
      </main>

      {/* Grounded bar nav with a sliding gold spotlight */}
      <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.07)]">
          <ul className="mx-auto max-w-2xl flex items-stretch">
              {[
                { key: 'HOME', icon: Utensils, label: t('ord_menu'), active: activeTab === 'HOME', onClick: () => setActiveTab('HOME') },
                { key: 'FAVORITES', icon: Heart, label: t('ord_favorites'), active: activeTab === 'FAVORITES', onClick: () => setActiveTab('FAVORITES') },
                { key: 'CART', icon: ShoppingBag, label: t('ord_cart'), active: activeTab === 'CART', onClick: () => setActiveTab('CART'), badge: cart.length },
                { key: 'ORDERS', icon: Package, label: t('ord_track'), active: ['ORDERS', 'ORDER_DETAILS'].includes(activeTab), onClick: () => setActiveTab('ORDERS') },
                { key: 'PROFILE', icon: User, label: t('ord_profile'), active: ['PROFILE', 'ADDRESSES', 'PAYMENTS', 'SETTINGS', 'POINTS'].includes(activeTab), onClick: () => setActiveTab('PROFILE') },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.key} className="flex-1">
                    <button
                      onClick={item.onClick}
                      aria-label={item.label}
                      className="relative w-full flex flex-col items-center justify-center gap-1 py-2.5"
                    >
                      {item.active && (
                        <motion.span
                          layoutId="nav-spotlight"
                          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                          className="absolute inset-x-2 inset-y-1 bg-secondary-500 rounded-2xl shadow-md shadow-secondary-500/30"
                        />
                      )}
                      <span className="relative">
                        <Icon className={`w-6 h-6 transition-colors ${item.active ? 'text-ink' : 'text-gray-400'}`} />
                        {item.badge ? (
                          <span className="absolute -top-1.5 -end-2 bg-brand-600 text-white text-[10px] font-black min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full border-2 border-white">{item.badge}</span>
                        ) : null}
                      </span>
                      <span className={`relative text-[11px] font-bold transition-colors ${item.active ? 'text-ink' : 'text-gray-400'}`}>{item.label}</span>
                    </button>
                  </li>
                );
              })}
          </ul>
      </nav>

      {/* Modals — invoked as functions (not <El/>) so option/typing re-renders
          reconcile in place instead of remounting + replaying the open animation */}
      {showBranchModal && BranchSelectorModal()}
      {showOrderTypeModal && OrderTypeSelectorModal()}
      {/* AddressFormModal removed */}
      {showCardModal && CardFormModal()}
      {selectedProduct && ProductDetailModal()}
      
    </div>
  );
};

export default Ordering;