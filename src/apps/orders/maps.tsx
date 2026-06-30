import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { ChevronLeft, MapPin, User } from 'lucide-react';
import { Order, RESTAURANT } from '../../data/orders';

const HOME_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const USER_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1D1D1B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const pinIcon = (bg: string, svg: string) => L.divIcon({ className: '', html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:${bg};transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35);display:grid;place-items:center"><span style="transform:rotate(45deg);display:grid;place-items:center">${svg}</span></div>`, iconSize: [32, 32], iconAnchor: [16, 32] });

// read-only route map (restaurant → customer)
export const MiniMap: React.FC<{ order: Order }> = ({ order }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!ref.current || mapRef.current || order.lat == null || order.lng == null) return;
    const map = L.map(ref.current, { zoomControl: false, attributionControl: false });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    const rest = L.latLng(RESTAURANT.lat, RESTAURANT.lng);
    const cust = L.latLng(order.lat, order.lng);
    L.marker(rest, { icon: pinIcon('#801212', HOME_SVG) }).addTo(map);
    L.marker(cust, { icon: pinIcon('#F8C15D', USER_SVG) }).addTo(map);
    L.polyline([rest, cust], { color: '#801212', weight: 3, dashArray: '6 8', opacity: 0.7 }).addTo(map);
    map.fitBounds(L.latLngBounds([rest, cust]).pad(0.35));
    setTimeout(() => map.invalidateSize(), 80);
    return () => { map.remove(); mapRef.current = null; };
  }, [order.id, order.lat, order.lng]);
  return <div ref={ref} className="h-40 w-full rounded-2xl overflow-hidden bg-gray-100" />;
};

// full-screen center-pin address picker
export const AddressPicker: React.FC<{ initial?: { lat?: number; lng?: number; address?: string }; ar: boolean; onCancel: () => void; onSave: (lat: number, lng: number, address: string) => void }> = ({ initial, ar, onCancel, onSave }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const center = useRef({ lat: initial?.lat ?? RESTAURANT.lat, lng: initial?.lng ?? RESTAURANT.lng });
  const [addr, setAddr] = useState(initial?.address ?? '');
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { zoomControl: false, attributionControl: false }).setView([center.current.lat, center.current.lng], 14);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    map.on('move', () => { const c = map.getCenter(); center.current = { lat: c.lat, lng: c.lng }; });
    setTimeout(() => map.invalidateSize(), 80);
    return () => { map.remove(); mapRef.current = null; };
  }, []);
  return (
    <div className="absolute inset-0 z-[60] bg-white flex flex-col">
      <div className="bg-white p-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
        <button onClick={onCancel} aria-label={ar ? 'رجوع' : 'Back'} className="w-10 h-10 rounded-xl hover:bg-gray-100 grid place-items-center text-gray-500 shrink-0"><ChevronLeft className={`w-6 h-6 ${ar ? 'rotate-180' : ''}`} /></button>
        <h2 className="font-display font-bold text-lg text-gray-900">{ar ? 'تحديد موقع التوصيل' : 'Set delivery location'}</h2>
      </div>
      <div className="relative flex-1">
        <div ref={ref} className="absolute inset-0" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
          <div className="w-9 h-9 bg-brand-600 shadow-lg grid place-items-center" style={{ borderRadius: '50% 50% 50% 0', transform: 'rotate(45deg)' }}>
            <User className="w-5 h-5 text-white" style={{ transform: 'rotate(-45deg)' }} />
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black/40 pointer-events-none" />
        <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
          <span className="inline-block bg-ink/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{ar ? 'حرّك الخريطة لضبط الموقع' : 'Move the map to set the location'}</span>
        </div>
      </div>
      <div className="bg-white p-4 border-t border-gray-100 shrink-0 space-y-3">
        <div className="relative">
          <MapPin className="w-4 h-4 text-gray-400 absolute top-3.5 start-3" />
          <input value={addr} onChange={e => setAddr(e.target.value)} placeholder={ar ? 'وصف العنوان (الحي - الشارع - المبنى)' : 'Address (district - street - building)'} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl ps-9 pe-3 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <button onClick={() => onSave(center.current.lat, center.current.lng, addr)} className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors">{ar ? 'تأكيد الموقع' : 'Confirm location'}</button>
      </div>
    </div>
  );
};
