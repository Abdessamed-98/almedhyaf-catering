import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, MapPin, X, Check, Store } from 'lucide-react';
import { RESTAURANT } from '../../data/orders';

const HOME_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const USER_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1D1D1B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const pinIcon = (bg: string, svg: string) => L.divIcon({ className: '', html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:${bg};transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35);display:grid;place-items:center"><span style="transform:rotate(45deg);display:grid;place-items:center">${svg}</span></div>`, iconSize: [32, 32], iconAnchor: [16, 32] });

// Mock geocoder — Makkah delivery spots (no external API in the mockup).
interface Place { area: string; name: string; lat: number; lng: number }
const PLACES: Place[] = [
  { area: 'العزيزية', name: 'العزيزية · شارع الحج', lat: 21.4085, lng: 39.8570 },
  { area: 'العزيزية', name: 'العزيزية · طريق الملك عبدالله', lat: 21.4130, lng: 39.8620 },
  { area: 'الششة', name: 'الششة · طريق الملك عبدالعزيز', lat: 21.4200, lng: 39.8300 },
  { area: 'العوالي', name: 'العوالي · حي النور', lat: 21.3600, lng: 39.8700 },
  { area: 'الزاهر', name: 'الزاهر · شارع الجامعة', lat: 21.4300, lng: 39.8100 },
  { area: 'الرصيفة', name: 'الرصيفة · شارع 22', lat: 21.3900, lng: 39.8900 },
  { area: 'النسيم', name: 'النسيم · طريق الليث', lat: 21.3400, lng: 39.8500 },
  { area: 'الكعكية', name: 'الكعكية · شارع المسجد', lat: 21.4000, lng: 39.8200 },
  { area: 'المسفلة', name: 'المسفلة · شارع أجياد', lat: 21.4130, lng: 39.8250 },
  { area: 'الشوقية', name: 'الشوقية · طريق مكة جدة', lat: 21.3800, lng: 39.7900 },
  { area: 'جرول', name: 'جرول · شارع المنصور', lat: 21.4350, lng: 39.8150 },
  { area: 'الخالدية', name: 'الخالدية · شارع الستين', lat: 21.4260, lng: 39.8420 },
];

export const PosAddressModal: React.FC<{
  ar: boolean;
  initial: { area?: string; address?: string };
  onClose: () => void;
  onSave: (area: string | undefined, address: string | undefined) => void;
}> = ({ ar, initial, onClose, onSave }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<string | undefined>(initial.area);
  const [address, setAddress] = useState<string | undefined>(initial.address);

  const dropPin = (lat: number, lng: number, fly = true) => {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    else markerRef.current = L.marker([lat, lng], { icon: pinIcon('#F8C15D', USER_SVG), draggable: true }).addTo(map);
    if (fly) map.setView([lat, lng], 15, { animate: true });
  };

  const pick = (p: Place) => {
    setArea(p.area);
    setAddress(p.name);
    setQuery('');
    dropPin(p.lat, p.lng);
  };

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView([RESTAURANT.lat, RESTAURANT.lng], 12);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([RESTAURANT.lat, RESTAURANT.lng], { icon: pinIcon('#801212', HOME_SVG) }).addTo(map);
    // if the cart already had an address, restore its pin
    const found = PLACES.find(p => p.name === initial.address || p.area === initial.area);
    if (found) {
      dropPin(found.lat, found.lng, false);
      map.setView([found.lat, found.lng], 15);
    }
    setTimeout(() => map.invalidateSize(), 120);
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = query.trim();
  const results = q ? PLACES.filter(p => p.name.includes(q) || p.area.includes(q)) : PLACES;
  const selected = area || address?.trim();

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-3xl h-[88vh] sm:h-[560px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-brand-600" />{ar ? 'عنوان التوصيل' : 'Delivery address'}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 grid grid-cols-2 overflow-hidden">
          {/* right (RTL start) — search */}
          <div className="flex flex-col overflow-hidden border-e border-gray-100">
            <div className="p-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute top-3 start-3" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder={ar ? 'ابحث عن حي أو شارع…' : 'Search district or street…'} className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl ps-9 pe-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {results.length === 0 ? (
                <div className="text-center text-gray-400 text-sm font-semibold py-10">{ar ? 'لا نتائج' : 'No results'}</div>
              ) : results.map(p => {
                const on = address === p.name;
                return (
                  <button key={p.name} onClick={() => pick(p)} className={`w-full text-start px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors border ${on ? 'bg-brand-50 border-brand-200' : 'border-transparent hover:bg-gray-50'}`}>
                    <span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${on ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}><MapPin className="w-4 h-4" /></span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm font-bold truncate ${on ? 'text-brand-700' : 'text-gray-800'}`}>{p.area}</span>
                      <span className="block text-xs text-gray-400 truncate">{p.name}</span>
                    </span>
                    {on && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* left (RTL end) — map */}
          <div className="relative bg-gray-100">
            <div ref={ref} className="absolute inset-0" />
            <div className="absolute top-2 inset-x-2 pointer-events-none flex justify-center">
              <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-600 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm"><Store className="w-3 h-3 text-brand-600" />{RESTAURANT.name}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center gap-3 shrink-0">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <MapPin className={`w-4 h-4 shrink-0 ${selected ? 'text-brand-600' : 'text-gray-300'}`} />
            <span className={`text-sm font-semibold truncate ${selected ? 'text-gray-700' : 'text-gray-400 font-normal'}`}>{selected ? [area, address].filter(Boolean).join(' · ') : (ar ? 'اختر موقعاً من البحث' : 'Pick a location from search')}</span>
          </div>
          {selected && <button onClick={() => { setArea(undefined); setAddress(undefined); setQuery(''); markerRef.current?.remove(); markerRef.current = null; }} className="px-3 py-2.5 rounded-xl bg-gray-100 text-gray-500 font-semibold text-sm hover:bg-gray-200 transition-colors shrink-0">{ar ? 'مسح' : 'Clear'}</button>}
          <button onClick={() => onSave(area, address)} className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors shrink-0">{ar ? 'تأكيد' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  );
};
