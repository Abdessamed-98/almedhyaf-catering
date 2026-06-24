import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Button,
  Card,
  SectionHeader,
  Ornament,
  Badge,
  PriceTag,
  Field,
  Input,
  Select,
  Textarea,
  Sheet,
  EmptyState,
  useToast,
} from '../../ui';
import {
  List,
  MapPin,
  Wallet,
  User,
  Phone,
  Navigation,
  CheckCircle,
  Clock,
  ArrowLeft,
  Power,
  Package,
  Car,
  Bell,
  Globe,
  Headphones,
  Info,
  ChevronLeft,
  ChevronRight,
  Camera,
  Check,
  Star,
  MessageCircle,
  Truck,
  ExternalLink,
  Plus,
  Send,
  Search,
  X,
  Filter
} from 'lucide-react';

interface DeliveryAppProps {
  onBackToPortal: () => void;
}

type Screen = 'SPLASH' | 'LOGIN' | 'MAIN' | 'ORDER_HISTORY';
type Tab = 'NEW' | 'ACTIVE' | 'EARNINGS' | 'PROFILE';

interface HistoryOrder {
  id: string;
  status: 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  address: string;
  date: string;
  time: string;
  earnings: number;
  items: string[];
  pickup: string;
  dropoff: string;
  duration: string;
}

const mockOrderHistory: HistoryOrder[] = [
  { id: 'ORD-1022', status: 'COMPLETED', address: 'Al Narjis, Riyadh', date: '2026-04-02', time: '14:30', earnings: 18, items: ['Classic Burger', 'French Fries'], pickup: 'Burger House', dropoff: 'Al Narjis, Riyadh', duration: '25 min' },
  { id: 'ORD-1021', status: 'COMPLETED', address: 'King Fahd Road, Riyadh', date: '2026-04-02', time: '13:15', earnings: 25, items: ['Margherita Pizza', 'Cola'], pickup: 'Pizza Inn', dropoff: 'King Fahd Road, Riyadh', duration: '35 min' },
  { id: 'ORD-1020', status: 'CANCELLED', address: 'Al Yasmin, Riyadh', date: '2026-04-02', time: '12:45', earnings: 0, items: ['Chicken Shawarma', 'Orange Juice'], pickup: 'Shawarma Plus', dropoff: 'Al Yasmin, Riyadh', duration: '10 min' },
  { id: 'ORD-1019', status: 'COMPLETED', address: 'Olaya Street, Riyadh', date: '2026-04-02', time: '11:20', earnings: 20, items: ['Meat Kabsa', 'Laban'], pickup: 'Najdi Village Restaurant', dropoff: 'Olaya Street, Riyadh', duration: '40 min' },
  { id: 'ORD-1018', status: 'IN_PROGRESS', address: 'Al Malqa, Riyadh', date: '2026-04-02', time: '10:05', earnings: 22, items: ['Assorted Sushi', 'Miso Soup'], pickup: 'Oishi Sushi', dropoff: 'Al Malqa, Riyadh', duration: 'In Progress' },
  { id: 'ORD-1017', status: 'COMPLETED', address: 'Al Sahafa, Riyadh', date: '2026-04-01', time: '19:40', earnings: 15, items: ['Specialty Coffee', 'Croissant'], pickup: 'Pro Cafe', dropoff: 'Al Sahafa, Riyadh', duration: '15 min' },
  { id: 'ORD-1016', status: 'CANCELLED', address: 'Al Aqiq, Riyadh', date: '2026-04-01', time: '18:10', earnings: 0, items: ['Alfredo Pasta'], pickup: 'Pasta De La Casa', dropoff: 'Al Aqiq, Riyadh', duration: '5 min' },
  { id: 'ORD-1015', status: 'COMPLETED', address: 'Hittin, Riyadh', date: '2026-04-01', time: '16:55', earnings: 30, items: ['Grilled Steak', 'Green Salad'], pickup: 'The Grill House', dropoff: 'Hittin, Riyadh', duration: '45 min' },
];

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  distance: string;
  earnings: number;
  items: string[];
  status: 'PENDING' | 'PICKED_UP' | 'ON_WAY' | 'ARRIVED' | 'DELIVERED';
  lat: number;
  lng: number;
}

const mockNewOrders: DeliveryOrder[] = [
  {
    id: 'ORD-1023',
    customerName: 'Ahmed Ali',
    customerPhone: '+966 50 123 4567',
    address: 'King Fahd Road, Riyadh',
    distance: '2.5 km',
    earnings: 15,
    items: ['1x Chicken Kabsa', '2x Pepsi'],
    status: 'PENDING',
    lat: 24.7136,
    lng: 46.6753
  },
  {
    id: 'ORD-1024',
    customerName: 'Sara Khalid',
    customerPhone: '+966 55 987 6543',
    address: 'Olaya Street, Riyadh',
    distance: '4.1 km',
    earnings: 22,
    items: ['2x Meat Mathbi', '1x Kunafa'],
    status: 'PENDING',
    lat: 24.6922,
    lng: 46.6854
  },
  {
    id: 'ORD-1025',
    customerName: 'Fahad Nasser',
    customerPhone: '+966 54 321 0987',
    address: 'Tahlia Street, Riyadh',
    distance: '3.8 km',
    earnings: 18,
    items: ['3x Shawarma', '1x Orange Juice'],
    status: 'PENDING',
    lat: 24.7000,
    lng: 46.6600
  }
];

const MapComponent: React.FC<{ order: DeliveryOrder }> = ({ order }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.GeoJSON) {
        map.removeLayer(layer);
      }
    });

    const restaurantLatLng: L.LatLngExpression = [24.7255, 46.6540];
    const customerLatLng: L.LatLngExpression = [order.lat, order.lng];

    // Custom icons
    const restaurantIcon = L.divIcon({
      className: 'bg-brand-600 w-4 h-4 rounded-full border-2 border-white shadow-md',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const customerIcon = L.divIcon({
      className: 'bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-md',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    L.marker(restaurantLatLng, { icon: restaurantIcon }).addTo(map);
    L.marker(customerLatLng, { icon: customerIcon }).addTo(map);

    // UI/UX demo: draw an instant local route (no backend / routing API call).
    const route = L.polyline([restaurantLatLng, customerLatLng], {
      color: '#ef4444',
      weight: 4,
      dashArray: '8, 8'
    }).addTo(map);
    map.fitBounds(route.getBounds(), { padding: [30, 30] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [order]);

  return <div ref={mapRef} className="w-full h-full z-0" />;
};

const DeliveryApp: React.FC<DeliveryAppProps> = ({ onBackToPortal }) => {
  const { t, dir, language } = useLanguage();
  const toast = useToast();
  const [currentScreen, setCurrentScreen] = useState<Screen>('SPLASH');
  const [activeTab, setActiveTab] = useState<Tab>('NEW');
  const [earningsPeriod, setEarningsPeriod] = useState<'DAY' | 'WEEK' | 'MONTH'>('DAY');
  const [profileSubPage, setProfileSubPage] = useState<'MAIN' | 'EDIT_PROFILE' | 'VEHICLE' | 'NOTIFICATIONS' | 'LANGUAGE' | 'SUPPORT' | 'ABOUT'>('MAIN');
  const [isOnline, setIsOnline] = useState(true);
  const [newOrders, setNewOrders] = useState<DeliveryOrder[]>(mockNewOrders);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<HistoryOrder | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentScreen === 'SPLASH') {
      const timer = setTimeout(() => {
        setCurrentScreen('LOGIN');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleAcceptOrder = (order: DeliveryOrder) => {
    setActiveOrder({ ...order, status: 'PICKED_UP' });
    setNewOrders(newOrders.filter(o => o.id !== order.id));
    setActiveTab('ACTIVE');
    toast(language === 'ar' ? 'تم قبول الطلب' : 'Order accepted');
  };

  const handleUpdateStatus = (newStatus: DeliveryOrder['status']) => {
    if (activeOrder) {
      if (newStatus === 'DELIVERED') {
        setActiveOrder(null);
        setActiveTab('NEW');
        toast(language === 'ar' ? 'تم تسليم الطلب بنجاح' : 'Order delivered');
      } else {
        setActiveOrder({ ...activeOrder, status: newStatus });
      }
    }
  };

  const statusTone = (status: HistoryOrder['status']) =>
    status === 'COMPLETED' ? 'success' : status === 'CANCELLED' ? 'maroon' : 'gold';

  const statusLabel = (status: HistoryOrder['status']) =>
    status === 'COMPLETED' ? t('ord_status_completed') :
    status === 'CANCELLED' ? t('ord_status_cancelled') : t('del_filter_in_progress');

  return (
    <div className="min-h-screen bg-ink/90 flex justify-center">
      <div className="w-full max-w-md bg-pageBg min-h-screen flex flex-col relative shadow-2xl overflow-hidden">
        {currentScreen === 'ORDER_HISTORY' && (
          <div className="absolute inset-0 z-[110] bg-pageBg flex flex-col" dir={dir}>
            {/* Header */}
            <div className="bg-brand-800 p-4 pt-12 flex items-center gap-4 text-white shadow-lg shadow-brand-900/30 relative overflow-hidden">
              <div className="absolute -top-10 -end-10 w-40 h-40 bg-secondary-500/10 rounded-full pointer-events-none" />
              <button onClick={() => setCurrentScreen('MAIN')} className="p-2 rounded-full hover:bg-white/10 transition-colors relative z-10">
                <ChevronRight className="w-6 h-6 rtl:-scale-x-100" />
              </button>
              <h2 className="text-xl font-display font-bold relative z-10">{t('del_history_title')}</h2>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-pageBg border-b border-secondary-500/20">
              <div className="relative">
                <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                <Input
                  type="text"
                  placeholder={t('del_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pe-10"
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar bg-pageBg border-b border-secondary-500/20">
              {[
                { id: 'ALL', label: t('del_filter_all') },
                { id: 'COMPLETED', label: t('del_filter_completed') },
                { id: 'CANCELLED', label: t('del_filter_cancelled') },
                { id: 'IN_PROGRESS', label: t('del_filter_in_progress') },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setHistoryFilter(chip.id as any)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-all ${
                    historyFilter === chip.id
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20 ring-2 ring-secondary-400/50'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mockOrderHistory
                .filter(order => historyFilter === 'ALL' || order.status === historyFilter)
                .filter(order => order.id.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((order) => (
                  <Card
                    key={order.id}
                    interactive
                    onClick={() => setSelectedHistoryOrder(order)}
                    className="p-4 flex items-center justify-between text-start"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="font-bold text-brand-800">{order.id}</span>
                        <Badge tone={statusTone(order.status)} className="text-[10px]">
                          {statusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-1 truncate">{order.address}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">{order.date} | {order.time}</span>
                        <PriceTag amount={order.earnings} currency={t('sar')} className="text-sm" />
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-secondary-500 ms-3 rtl:-scale-x-100" />
                  </Card>
                ))}
            </div>

            {/* Order Detail Sheet */}
            <Sheet open={!!selectedHistoryOrder} onClose={() => setSelectedHistoryOrder(null)}>
              {selectedHistoryOrder && (
                <div className="p-6 pt-2">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-display font-bold text-brand-800">{t('del_order_details')}</h3>
                    <button onClick={() => setSelectedHistoryOrder(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-brand-50 rounded-2xl">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{t('del_order_id')}</p>
                        <p className="font-bold text-brand-800">{selectedHistoryOrder.id}</p>
                      </div>
                      <div className="text-end">
                        <p className="text-xs text-gray-400 mb-1">{t('del_status')}</p>
                        <Badge tone={statusTone(selectedHistoryOrder.status)}>
                          {statusLabel(selectedHistoryOrder.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-secondary-500"></div>
                          <div className="w-0.5 flex-1 bg-secondary-500/30"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-600"></div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">{t('del_pickup_point')}</p>
                            <p className="text-sm font-bold text-gray-700">{selectedHistoryOrder.pickup}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">{t('del_dropoff_point')}</p>
                            <p className="text-sm font-bold text-gray-700">{selectedHistoryOrder.dropoff}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-secondary-500/20 pt-6">
                      <h4 className="font-bold text-brand-800 text-sm mb-3">{t('del_items_section')}</h4>
                      <div className="space-y-2">
                        {selectedHistoryOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item}</span>
                            <span className="text-gray-400">x1</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-brand-50 rounded-2xl">
                        <p className="text-xs text-gray-400 mb-1">{t('del_duration')}</p>
                        <p className="font-bold text-brand-800">{selectedHistoryOrder.duration}</p>
                      </div>
                      <div className="p-4 bg-secondary-50 rounded-2xl">
                        <p className="text-xs text-gray-400 mb-1">{t('del_earnings_label')}</p>
                        <PriceTag amount={selectedHistoryOrder.earnings} currency={t('sar')} className="text-lg" />
                      </div>
                    </div>

                    <Button variant="primary" block onClick={() => setSelectedHistoryOrder(null)}>
                      {t('del_close')}
                    </Button>
                  </div>
                </div>
              )}
            </Sheet>
          </div>
        )}

        {currentScreen === 'SPLASH' && (
          <div className="absolute inset-0 z-[100] bg-brand-800 flex flex-col items-center justify-center text-white overflow-hidden">
            <div className="absolute -top-16 -start-16 w-56 h-56 bg-secondary-500/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -end-16 w-64 h-64 bg-secondary-500/10 rounded-full pointer-events-none" />
            <div className="mb-6 w-28 h-28 rounded-full bg-secondary-500/15 ring-2 ring-secondary-500/40 flex items-center justify-center">
              <Truck className="w-14 h-14 text-secondary-400" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-2">{t('del_app_name')}</h1>
            <Ornament className="my-3 [&>span]:bg-secondary-400" />
            <p className="text-lg font-light text-secondary-100/80">{t('del_splash_tagline')}</p>

            <div className="absolute bottom-12 flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-3 h-3 bg-secondary-400 rounded-full"
                />
              ))}
            </div>
          </div>
        )}

        {currentScreen === 'LOGIN' && (
          <div className="absolute inset-0 z-[90] bg-pageBg flex flex-col" dir={dir}>
            {/* Header Strip */}
            <div className="bg-brand-800 p-4 pt-12 flex items-center gap-4 text-white relative overflow-hidden">
              <div className="absolute -top-10 -end-10 w-40 h-40 bg-secondary-500/10 rounded-full pointer-events-none" />
              <button onClick={onBackToPortal} className="p-2 rounded-full hover:bg-white/10 transition-colors relative z-10">
                <ChevronRight className="w-6 h-6 rtl:-scale-x-100" />
              </button>
              <h2 className="text-xl font-display font-bold relative z-10">{t('del_login_title')}</h2>
            </div>

            <div className="flex-1 p-6 flex flex-col">
              <div className="mt-6 mb-2">
                <SectionHeader title={t('del_app_name')} subtitle={t('del_splash_tagline')} align="start" />
              </div>
              <div className="mt-6 space-y-8">
                <Field label={t('del_phone_label')} htmlFor="del-phone">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-700">
                      <span className="text-xl">🇸🇦</span>
                      <span dir="ltr">+966</span>
                    </div>
                    <Input
                      id="del-phone"
                      type="tel"
                      placeholder={t('del_phone_placeholder')}
                      className="flex-1 text-lg font-bold"
                    />
                  </div>
                </Field>

                <div>
                  <label className="block text-gray-700 font-bold mb-2 text-sm">{t('del_otp_label')}</label>
                  <div className="flex justify-between gap-2" dir="ltr">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        className="w-10 h-12 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition"
                      />
                    ))}
                  </div>
                </div>

                <Button variant="primary" size="lg" block onClick={() => setCurrentScreen('MAIN')}>
                  {t('del_send_otp')}
                </Button>

                <div className="text-center">
                  <button className="text-brand-700 font-bold text-sm hover:text-brand-800 transition-colors">{t('del_no_account')}</button>
                </div>
              </div>

              <div className="mt-auto text-center pb-8">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {t('del_terms_prefix')} <br />
                  <span className="underline">{t('del_terms_of_service')}</span> {t('del_and')} <span className="underline">{t('del_privacy_policy')}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'MAIN' && (
          <>
            {/* Header */}
            <header className="bg-brand-800 h-[60px] flex items-center justify-between px-4 z-10 relative overflow-hidden">
              <div className="absolute -top-10 -end-8 w-32 h-32 bg-secondary-500/10 rounded-full pointer-events-none" />
              <button onClick={onBackToPortal} className="text-white z-20">
                <ArrowLeft className="w-5 h-5 rtl:-scale-x-100" />
              </button>
              <h1 className="text-[18px] font-display font-bold text-white absolute inset-0 flex items-center justify-center pointer-events-none">
                {t('del_app_name')}
              </h1>
              <div className="w-5"></div>
            </header>

            {/* Driver Status Card */}
            <div className="my-3 mx-4 p-3 px-4 flex flex-row items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm" dir={dir}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-[44px] h-[44px] rounded-full overflow-hidden border-[2.5px] ${isOnline ? 'border-success' : 'border-gray-200'}`}>
                    <img src="https://picsum.photos/seed/driver/100/100" alt="Driver" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-0 end-0 w-[10px] h-[10px] bg-success rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="text-start">
                  <p className="text-[15px] font-bold text-ink">Mohammed S.</p>
                  <p className={`text-[12px] font-bold ${isOnline ? 'text-success' : 'text-gray-400'}`}>{isOnline ? t('del_online') : t('del_offline')}</p>
                </div>
              </div>

              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-colors ${isOnline ? 'bg-brand-600' : 'bg-gray-400'}`}
              >
                <Power className="w-5 h-5" />
              </button>
            </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-pageBg pb-28">
          {!isOnline ? (
            <div className="flex flex-col items-center justify-center h-full">
              <EmptyState
                icon={Power}
                title={t('del_offline')}
                description={t('del_go_online_hint')}
                action={<Button variant="gold" onClick={() => setIsOnline(true)}>{t('del_online')}</Button>}
              />
            </div>
          ) : (
            <>
              {activeTab === 'NEW' && (
                <div className="p-4 space-y-4" dir={dir}>
                  <SectionHeader title={t('del_new_orders')} align="start" className="mb-1" />
                  {newOrders.length === 0 ? (
                    <EmptyState icon={Package} title={t('del_no_new_full')} />
                  ) : (
                    newOrders.map(order => (
                      <Card key={order.id} className="p-4" dir={dir}>
                        {/* Top Row */}
                        <div className="flex justify-between items-center mb-4">
                          <Badge tone="maroon">{order.id}</Badge>
                          <PriceTag amount={order.earnings} currency={t('sar')} className="text-lg" />
                        </div>

                        {/* Middle Row */}
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-brand-600" />
                          <span className="text-sm text-gray-700 font-medium">{order.address}</span>
                        </div>

                        {/* Distance Row */}
                        <div className="flex items-center gap-2 mb-4">
                          <Navigation className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-400">{order.distance}</span>
                        </div>

                        {/* Items Badge */}
                        <div className="mb-4">
                          <Badge tone="muted">
                            {order.items.length} {t('del_items_count')}
                          </Badge>
                        </div>

                        {/* Bottom Row */}
                        <div className="flex gap-2">
                          <Button variant="primary" block onClick={() => handleAcceptOrder(order)}>
                            {t('del_accept')}
                          </Button>
                          <Button variant="outline" block onClick={() => setNewOrders(newOrders.filter(o => o.id !== order.id))}>
                            {t('del_reject')}
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'ACTIVE' && (
                <div className="h-full flex flex-col">
                  {!activeOrder ? (
                    <div className="flex flex-col items-center justify-center flex-1">
                      <EmptyState icon={MapPin} title={t('del_no_active')} />
                    </div>
                  ) : (
                    <>
                      {/* Map */}
                      <div className="h-52 bg-gray-200 relative">
                        <MapComponent order={activeOrder} />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 to-transparent flex items-end p-4 pointer-events-none z-10">
                          <div className="text-white w-full">
                            <p className="text-sm text-secondary-200">{t('del_address')}</p>
                            <p className="font-bold truncate">{activeOrder.address}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <Card className="p-4 mb-4">
                          <div className="flex justify-between items-center mb-4 border-b border-secondary-500/20 pb-4">
                            <div>
                              <p className="text-sm text-gray-500">{t('del_order_id')}</p>
                              <p className="font-bold text-lg text-brand-800">{activeOrder.id}</p>
                            </div>
                            <div className="text-end">
                              <p className="text-sm text-gray-500">{t('del_earnings')}</p>
                              <PriceTag amount={activeOrder.earnings} currency={t('sar')} className="text-lg" />
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1">{t('del_customer')}</p>
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-ink">{activeOrder.customerName}</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => window.location.href = `tel:${activeOrder.customerPhone.replace(/\s+/g, '')}`}
                                  className="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                                >
                                  <Phone className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeOrder.lat},${activeOrder.lng}`, '_blank')}
                                  className="w-10 h-10 rounded-full bg-secondary-500 text-ink flex items-center justify-center hover:bg-secondary-600 transition-colors shadow-sm"
                                >
                                  <Navigation className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500 mb-2">{t('del_items')}</p>
                            <ul className="space-y-1">
                              {activeOrder.items.map((item, idx) => (
                                <li key={idx} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-500"></div>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Card>

                        <div className="mt-auto space-y-3">
                          {activeOrder.status === 'PICKED_UP' && (
                            <Button variant="primary" size="lg" block onClick={() => handleUpdateStatus('ON_WAY')}>
                              {t('del_on_way')}
                              <Navigation className="w-5 h-5" />
                            </Button>
                          )}
                          {activeOrder.status === 'ON_WAY' && (
                            <Button variant="gold" size="lg" block onClick={() => handleUpdateStatus('ARRIVED')}>
                              {t('del_arrived')}
                              <MapPin className="w-5 h-5" />
                            </Button>
                          )}
                          {activeOrder.status === 'ARRIVED' && (
                            <button
                              onClick={() => handleUpdateStatus('DELIVERED')}
                              className="w-full inline-flex items-center justify-center gap-2 font-bold rounded-full px-8 py-4 text-lg text-white bg-success hover:opacity-90 shadow-md transition-all active:scale-[0.98]"
                            >
                              {t('del_delivered')}
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'EARNINGS' && (
                <div className="flex flex-col h-full bg-pageBg" dir={dir}>
                  {/* Summary Metrics */}
                  <div className="p-4 grid grid-cols-3 gap-3">
                    {[
                      { amount: '45', label: t('del_today') },
                      { amount: '320', label: t('del_this_week') },
                      { amount: '1,250', label: t('del_this_month') },
                    ].map((m, i) => (
                      <Card key={i} className="p-3 text-center">
                        <PriceTag amount={m.amount} currency={t('sar')} className="text-base leading-none" />
                        <p className="text-[10px] text-gray-400 mt-1">{m.label}</p>
                      </Card>
                    ))}
                  </div>

                  {/* Period Tabs */}
                  <div className="flex border-b border-secondary-500/20 px-4">
                    {(['DAY', 'WEEK', 'MONTH'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setEarningsPeriod(period)}
                        className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
                          earningsPeriod === period ? 'text-brand-700' : 'text-gray-400'
                        }`}
                      >
                        {period === 'DAY' ? t('del_period_day') : period === 'WEEK' ? t('del_period_week') : t('del_period_month')}
                        {earningsPeriod === period && (
                          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-secondary-500 rounded-full mx-4"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Chart Section */}
                  <div className="p-6">
                    <div className="h-32 flex items-end justify-between gap-2 px-2">
                      {[
                        { label: t('del_weekday_sun'), val: 40, h: 'h-[40%]' },
                        { label: t('del_weekday_mon'), val: 65, h: 'h-[65%]' },
                        { label: t('del_weekday_tue'), val: 45, h: 'h-[45%]' },
                        { label: t('del_weekday_wed'), val: 80, h: 'h-[80%]' },
                        { label: t('del_weekday_thu'), val: 95, h: 'h-[95%]' },
                        { label: t('del_weekday_fri'), val: 70, h: 'h-[70%]' },
                        { label: t('del_weekday_sat'), val: 55, h: 'h-[55%]' },
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-[10px] font-bold text-brand-700">{bar.val}</span>
                          <div className={`w-full bg-gradient-to-t from-brand-700 to-brand-500 rounded-t-md ${bar.h}`}></div>
                          <span className="text-[8px] text-gray-400 truncate w-full text-center">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Completed Deliveries List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-display font-bold text-brand-800 text-base">{t('del_completed_orders')}</h3>
                      <button
                        onClick={() => setCurrentScreen('ORDER_HISTORY')}
                        className="text-brand-700 text-xs font-bold hover:text-brand-800 transition-colors"
                      >
                        {t('del_view_all')}
                      </button>
                    </div>
                    {[
                      { id: 'ORD-1022', address: mockOrderHistory[0].address, time: '14:30', amount: 18 },
                      { id: 'ORD-1021', address: mockOrderHistory[1].address, time: '13:15', amount: 25 },
                      { id: 'ORD-1020', address: mockOrderHistory[2].address, time: '12:45', amount: 15 },
                      { id: 'ORD-1019', address: mockOrderHistory[3].address, time: '11:20', amount: 20 },
                      { id: 'ORD-1018', address: mockOrderHistory[4].address, time: '10:05', amount: 22 },
                    ].map((order, idx) => (
                      <Card key={idx} className="p-4 flex justify-between items-center">
                        <div className="flex-1 min-w-0 me-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-brand-800 text-sm">{order.id}</span>
                            <span className="text-[10px] text-gray-400">{order.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-3 h-3 flex-shrink-0 text-brand-600" />
                            <p className="text-xs truncate">{order.address}</p>
                          </div>
                        </div>
                        <div className="bg-secondary-50 px-3 py-1 rounded-lg whitespace-nowrap">
                          <PriceTag amount={order.amount} currency={t('sar')} className="text-sm" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'PROFILE' && (
                <div className="flex flex-col h-full bg-pageBg" dir={dir}>
                  {profileSubPage === 'MAIN' ? (
                    <div className="p-4 space-y-6">
                      {/* Profile Header */}
                      <Card className="p-6 text-center relative overflow-hidden">
                        <div className="absolute -top-12 -end-12 w-40 h-40 bg-secondary-500/10 rounded-full pointer-events-none" />
                        <div className="relative w-24 h-24 mx-auto mb-4">
                          <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden border-4 border-secondary-500/40 shadow-sm">
                            <img src="https://picsum.photos/seed/driver/200/200" alt="Driver" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="absolute bottom-0 end-0 bg-secondary-500 text-ink p-1.5 rounded-full border-2 border-white">
                            <Star className="w-3 h-3 fill-current" />
                          </div>
                        </div>
                        <h3 className="text-xl font-display font-bold text-brand-800">Mohammed S.</h3>
                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-2">
                          <span>ID: DRV-8842</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-secondary-500 fill-current" />
                            <span className="font-bold text-gray-700">4.8</span>
                          </div>
                        </div>
                      </Card>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: '1,240', label: t('del_total_orders') },
                          { val: '156', label: t('del_active_days') },
                          { val: '98%', label: t('del_acceptance_rate') },
                        ].map((s, i) => (
                          <Card key={i} className="p-3 text-center">
                            <p className="text-brand-800 font-black text-lg leading-none mb-1">{s.val}</p>
                            <p className="text-[10px] text-gray-400">{s.label}</p>
                          </Card>
                        ))}
                      </div>

                      {/* Settings List */}
                      <Card className="overflow-hidden">
                        {[
                          { id: 'EDIT_PROFILE', label: t('del_edit_profile'), icon: User },
                          { id: 'VEHICLE', label: t('del_vehicle_info'), icon: Car },
                          { id: 'ORDER_HISTORY', label: t('del_order_history'), icon: List },
                          { id: 'NOTIFICATIONS', label: t('del_notifications'), icon: Bell },
                          { id: 'LANGUAGE', label: t('del_language'), icon: Globe },
                          { id: 'SUPPORT', label: t('del_support'), icon: Headphones },
                          { id: 'ABOUT', label: t('del_about'), icon: Info },
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (item.id === 'ORDER_HISTORY') {
                                setCurrentScreen('ORDER_HISTORY');
                              } else {
                                setProfileSubPage(item.id as any);
                              }
                            }}
                            className={`w-full p-4 flex items-center justify-between hover:bg-brand-50 transition-colors ${
                              idx !== 6 ? 'border-b border-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-brand-50 rounded-xl">
                                <item.icon className="w-5 h-5 text-brand-600" />
                              </div>
                              <span className="font-bold text-gray-700 text-sm">{item.label}</span>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-secondary-500 rtl:-scale-x-100" />
                          </button>
                        ))}
                      </Card>

                      {/* Logout */}
                      <button
                        onClick={() => toast(language === 'ar' ? 'تم تسجيل الخروج' : 'Logged out')}
                        className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between text-brand-700 hover:bg-brand-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-50 rounded-xl">
                            <Power className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-sm">{t('ord_logout')}</span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full bg-pageBg">
                      {/* Sub-page Header */}
                      <div className="p-4 border-b border-secondary-500/20 flex items-center gap-4 bg-white">
                        <button
                          onClick={() => setProfileSubPage('MAIN')}
                          className="p-2 hover:bg-brand-50 rounded-full transition-colors"
                        >
                          <ChevronRight className="w-6 h-6 text-brand-700 rtl:-scale-x-100" />
                        </button>
                        <h2 className="font-display font-bold text-brand-800 text-lg">
                          {profileSubPage === 'EDIT_PROFILE' && t('del_edit_profile')}
                          {profileSubPage === 'VEHICLE' && t('del_vehicle_info')}
                          {profileSubPage === 'NOTIFICATIONS' && t('del_notifications')}
                          {profileSubPage === 'LANGUAGE' && t('del_language')}
                          {profileSubPage === 'SUPPORT' && t('del_support')}
                          {profileSubPage === 'ABOUT' && t('del_about')}
                        </h2>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6">
                        {profileSubPage === 'EDIT_PROFILE' && (
                          <div className="space-y-6">
                            <div className="flex flex-col items-center mb-8">
                              <div className="relative w-24 h-24">
                                <img src="https://picsum.photos/seed/driver/200/200" alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-secondary-500/30" referrerPolicy="no-referrer" />
                                <button className="absolute bottom-0 end-0 bg-brand-600 text-white p-2 rounded-full shadow-lg">
                                  <Camera className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <Field label={t('del_full_name')} htmlFor="ep-name">
                                <Input id="ep-name" type="text" defaultValue="Mohammed Sulaiman" />
                              </Field>
                              <Field label={t('del_phone_label')} htmlFor="ep-phone">
                                <Input id="ep-phone" type="tel" dir="ltr" defaultValue="+966 50 123 4567" />
                              </Field>
                              <Field label={t('del_email')} htmlFor="ep-email">
                                <Input id="ep-email" type="email" dir="ltr" defaultValue="m.sulaiman@email.com" />
                              </Field>
                              <Field label={t('del_city')} htmlFor="ep-city">
                                <Select id="ep-city">
                                  <option>{t('del_city_riyadh')}</option>
                                  <option>{t('del_city_jeddah')}</option>
                                  <option>{t('del_city_dammam')}</option>
                                </Select>
                              </Field>
                            </div>
                            <Button variant="primary" block className="mt-8" onClick={() => toast(language === 'ar' ? 'تم حفظ التغييرات' : 'Changes saved')}>
                              {t('del_save_changes')}
                            </Button>
                          </div>
                        )}

                        {profileSubPage === 'VEHICLE' && (
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <Field label={t('del_vehicle_type')} htmlFor="v-type">
                                <Input id="v-type" type="text" defaultValue="Toyota Camry" />
                              </Field>
                              <Field label={t('del_model_year')} htmlFor="v-year">
                                <Input id="v-year" type="text" defaultValue="2023" />
                              </Field>
                              <Field label={t('del_plate_number')} htmlFor="v-plate">
                                <Input id="v-plate" type="text" defaultValue="ABC 1234" />
                              </Field>
                              <Field label={t('del_vehicle_color')} htmlFor="v-color">
                                <Input id="v-color" type="text" defaultValue={t('del_color_white')} />
                              </Field>
                              <div>
                                <label className="block text-gray-700 font-bold mb-3 text-sm">{t('del_vehicle_photo')}</label>
                                <div className="w-full aspect-video bg-brand-50/50 border-2 border-dashed border-secondary-500/40 rounded-2xl flex flex-col items-center justify-center text-brand-400 hover:bg-brand-50 transition-colors cursor-pointer">
                                  <Camera className="w-8 h-8 mb-2" />
                                  <span className="text-xs font-medium">{t('del_upload_vehicle_photo')}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="primary" block className="mt-8" onClick={() => toast(language === 'ar' ? 'تم حفظ بيانات المركبة' : 'Vehicle info saved')}>
                              {t('del_save_vehicle_info')}
                            </Button>
                          </div>
                        )}

                        {profileSubPage === 'NOTIFICATIONS' && (
                          <div className="space-y-2">
                            {[
                              { label: t('del_notif_new_orders'), active: true },
                              { label: t('del_notif_order_updates'), active: true },
                              { label: t('del_notif_earnings'), active: false },
                              { label: t('del_notif_system'), active: true },
                            ].map((toggle, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <span className="font-bold text-gray-700 text-sm">{toggle.label}</span>
                                <button className={`w-12 h-6 rounded-full transition-colors relative ${toggle.active ? 'bg-brand-600' : 'bg-gray-200'}`}>
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${toggle.active ? 'start-1' : 'start-7'}`}></div>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {profileSubPage === 'LANGUAGE' && (
                          <div className="space-y-2">
                            {[
                              { label: t('del_lang_arabic'), code: 'ar', active: true },
                              { label: t('del_lang_english'), code: 'en', active: false },
                              { label: t('del_lang_urdu'), code: 'ur', active: false },
                            ].map((lang, idx) => (
                              <button key={idx} className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-brand-50 transition-colors text-start">
                                <span className={`font-bold text-sm ${lang.active ? 'text-brand-700' : 'text-gray-700'}`}>{lang.label}</span>
                                {lang.active && (
                                  <div className="w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {profileSubPage === 'SUPPORT' && (
                          <div className="space-y-8">
                            {/* Support Cards */}
                            <div className="grid grid-cols-2 gap-4">
                              <Card interactive className="p-6 flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                                  <MessageCircle className="w-6 h-6 text-success" />
                                </div>
                                <span className="font-bold text-gray-700 text-sm">{t('del_support_whatsapp')}</span>
                              </Card>
                              <Card interactive className="p-6 flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center">
                                  <Phone className="w-6 h-6 text-brand-600" />
                                </div>
                                <span className="font-bold text-gray-700 text-sm">{t('del_support_call')}</span>
                              </Card>
                            </div>

                            {/* FAQ Accordion */}
                            <div className="space-y-3">
                              <h3 className="font-display font-bold text-brand-800 text-base mb-4">{t('del_faq_title')}</h3>
                              {[
                                { q: t('del_faq_q1'), a: t('del_faq_a1') },
                                { q: t('del_faq_q2'), a: t('del_faq_a2') },
                                { q: t('del_faq_q3'), a: t('del_faq_a3') },
                                { q: t('del_faq_q4'), a: t('del_faq_a4') },
                                { q: t('del_faq_q5'), a: t('del_faq_a5') },
                              ].map((faq, idx) => (
                                <details key={idx} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                    <span className="font-bold text-gray-700 text-sm">{faq.q}</span>
                                    <Plus className="w-4 h-4 text-secondary-500 group-open:rotate-45 transition-transform" />
                                  </summary>
                                  <div className="px-4 pb-4 text-xs text-gray-500 leading-relaxed">
                                    {faq.a}
                                  </div>
                                </details>
                              ))}
                            </div>

                            {/* Message Input */}
                            <div className="space-y-3">
                              <label className="block text-gray-700 font-bold text-sm">{t('del_send_message')}</label>
                              <div className="relative">
                                <Textarea
                                  placeholder={t('del_message_placeholder')}
                                  className="min-h-[120px]"
                                />
                                <button
                                  onClick={() => toast(language === 'ar' ? 'تم إرسال الرسالة' : 'Message sent')}
                                  className="absolute bottom-4 end-4 bg-brand-600 text-white p-2 rounded-xl shadow-lg hover:bg-brand-700 transition-colors"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {profileSubPage === 'ABOUT' && (
                          <div className="flex flex-col items-center py-4">
                            {/* App Icon */}
                            <div className="w-32 h-32 bg-brand-50 rounded-full flex items-center justify-center mb-6 border-4 border-secondary-500/30 shadow-sm">
                              <Truck className="w-16 h-16 text-brand-600" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-brand-800 mb-1">{t('del_app_name')}</h3>
                            <p className="text-gray-400 text-sm mb-2">{t('del_version')}</p>
                            <Ornament className="mb-8" />

                            {/* Links */}
                            <Card className="w-full overflow-hidden mb-12">
                              {[
                                { label: t('del_about_privacy'), icon: Info },
                                { label: t('del_about_terms'), icon: Info },
                                { label: t('del_about_rate'), icon: Star, stars: true },
                                { label: t('del_about_contact'), icon: Globe },
                              ].map((item, idx) => (
                                <button key={idx} className={`w-full p-4 flex items-center justify-between hover:bg-brand-50 transition-colors ${idx !== 3 ? 'border-b border-gray-50' : ''}`}>
                                  <span className="font-bold text-gray-700 text-sm">{item.label}</span>
                                  {item.stars ? (
                                    <div className="flex gap-0.5">
                                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 text-secondary-500 fill-current" />)}
                                    </div>
                                  ) : (
                                    <ChevronLeft className="w-4 h-4 text-secondary-500 rtl:-scale-x-100" />
                                  )}
                                </button>
                              ))}
                            </Card>

                            <p className="text-gray-400 text-xs flex items-center gap-1">
                              {t('del_made_with_love_prefix')} <span className="text-brand-600">❤️</span> {t('del_made_with_love_suffix')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>

        {/* Floating pill-island navigation */}
        <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none" dir={dir}>
          <div className="pointer-events-auto flex items-center gap-1 bg-brand-800/95 backdrop-blur-xl rounded-full p-1.5 shadow-2xl shadow-brand-900/50 border border-secondary-500/30">
            {[
              { key: 'NEW', icon: List, label: t('del_nav_new'), active: activeTab === 'NEW', onClick: () => setActiveTab('NEW'), badge: newOrders.length },
              { key: 'ACTIVE', icon: MapPin, label: t('del_nav_active'), active: activeTab === 'ACTIVE', onClick: () => setActiveTab('ACTIVE') },
              { key: 'EARNINGS', icon: Wallet, label: t('del_nav_earnings'), active: activeTab === 'EARNINGS', onClick: () => setActiveTab('EARNINGS') },
              { key: 'PROFILE', icon: User, label: t('del_nav_profile'), active: activeTab === 'PROFILE', onClick: () => setActiveTab('PROFILE') },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  aria-label={item.label}
                  className={`relative flex items-center gap-2 rounded-full transition-all duration-300 ${item.active ? 'bg-secondary-500 text-ink ps-3.5 pe-4 py-2.5' : 'text-white/70 hover:text-white hover:bg-white/10 p-2.5'}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.active && <span className="text-sm font-bold whitespace-nowrap">{item.label}</span>}
                  {!item.active && item.badge ? (
                    <motion.span
                      key={item.badge}
                      initial={{ scale: 0.4 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                      className="absolute -top-1 -end-1 bg-secondary-500 text-ink text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 border border-brand-800"
                    >{item.badge}</motion.span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryApp;
