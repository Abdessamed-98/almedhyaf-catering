import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Navigation, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../ui';
import { motion } from 'motion/react';
import L from 'leaflet';
import { BRAND } from '../../theme/tokens';

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

// Makkah center
const MAKKAH: [number, number] = [21.4225, 39.8262];

const Branches: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Three production kitchens — all in Makkah
  const kitchens = [
    {
      id: 1,
      name: ar ? 'مطبخ الشوقية' : 'Al-Shoqiyah Kitchen',
      city: ar ? 'مكة المكرمة' : 'Makkah',
      address: ar ? 'حي الشوقية' : 'Al-Shoqiyah District',
      role: ar ? 'مطبخ إنتاج رئيسي للوجبات الساخنة' : 'Primary production kitchen for hot meals',
      phone: '0570165050',
      lat: 21.39,
      lng: 39.86,
    },
    {
      id: 2,
      name: ar ? 'مطبخ العوالي' : 'Al-Awali Kitchen',
      city: ar ? 'مكة المكرمة' : 'Makkah',
      address: ar ? 'حي العوالي' : 'Al-Awali District',
      role: ar ? 'مرفق تجهيز وتعبئة وتوزيع للفنادق' : 'Preparation, packaging & hotel distribution facility',
      phone: '0570165050',
      lat: 21.37,
      lng: 39.86,
    },
    {
      id: 3,
      name: ar ? 'مطبخ الشرائع' : "Al-Shara'i Kitchen",
      city: ar ? 'مكة المكرمة' : 'Makkah',
      address: ar ? 'حي الشرائع' : "Al-Shara'i District",
      role: ar ? 'مطبخ مواسم الحج والإفطار (معتمد HACCP)' : 'Hajj & Iftar seasonal kitchen (HACCP-certified)',
      phone: '0570165050',
      lat: 21.34,
      lng: 39.92,
    },
  ];

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
        // Initialize map — centered on Makkah
        const map = L.map(mapContainerRef.current).setView(MAKKAH, 12);
        mapInstanceRef.current = map;

        // Add OSM Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Custom Icon
        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div style="
                    background-color: ${BRAND};
                    width: 30px;
                    height: 30px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        width: 8px;
                        height: 8px;
                        background-color: white;
                        border-radius: 50%;
                        transform: rotate(45deg);
                    "></div>
                </div>
            `,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -45]
        });

        // Add Markers
        const markers: L.Marker[] = [];
        kitchens.forEach(kitchen => {
            const marker = L.marker([kitchen.lat, kitchen.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="font-family: 'Cairo', sans-serif; text-align: ${ar ? 'right' : 'left'};">
                        <strong style="font-size: 1.1em; color: #801212;">${kitchen.name}</strong><br/>
                        <span style="color: #666;">${kitchen.address}</span>
                    </div>
                `);
            markers.push(marker);
        });

        // Fit Bounds if markers exist
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.3));
        }
    }

    // Cleanup
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, [language]); // Re-run if language changes to update popups

  const focusOnKitchen = (lat: number, lng: number) => {
      if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, {
              duration: 1.5
          });
      }
  };

  const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-flex items-center gap-3 text-secondary-500 font-bold text-sm md:text-base">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-500" />
      {children}
    </span>
  );
  const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-brand-600 font-black text-xs md:text-sm tracking-wide">{children}</span>
  );
  const Num: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <span dir="ltr" className={className}>{children}</span>
  );

  return (
    <div className="overflow-hidden">

      {/* ===== MAP + KITCHEN CARDS (light) ===== */}
      <section id="kitchens-map" className="bg-[#fbf7ef] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Kicker>{ar ? 'مواقع مطابخنا' : 'Our kitchen locations'}</Kicker>
              <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'حضور قريب من العميل ومناطق التشغيل' : 'Close to clients and to operating zones'}</h2>
            </div>
            <p className="md:max-w-sm text-gray-600 leading-relaxed">{ar ? 'اضغط على أي مطبخ لتحديد موقعه على الخريطة التفاعلية.' : 'Tap any kitchen to locate it on the interactive map.'}</p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6 items-start">

            {/* Map — prominent concept frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="lg:col-span-3 lg:sticky lg:top-24 order-1"
            >
              <div className="relative rounded-2xl overflow-hidden border-8 border-white shadow-2xl shadow-brand-900/10 ring-1 ring-[#eee1d0] h-[420px] lg:h-[560px] z-0">
                <div ref={mapContainerRef} className="w-full h-full bg-gray-100" />
                <div className="absolute top-4 start-4 z-[400] bg-white/95 backdrop-blur rounded-2xl px-4 py-2.5 shadow-lg ring-1 ring-black/5 flex items-center gap-2 pointer-events-none">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND }} />
                  <span className="text-sm font-bold text-gray-800">{ar ? 'مواقع مطابخنا' : 'Our kitchen locations'}</span>
                </div>
              </div>
            </motion.div>

            {/* Kitchen cards */}
            <div className="lg:col-span-2 space-y-5 order-2">
              {kitchens.map((kitchen, i) => {
                const active = activeId === kitchen.id;
                return (
                  <motion.div
                    key={kitchen.id}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                    onClick={() => { setActiveId(kitchen.id); focusOnKitchen(kitchen.lat, kitchen.lng); }}
                    className={`cursor-pointer rounded-2xl bg-white border p-6 shadow-sm transition-all ${active ? 'border-secondary-400 ring-2 ring-secondary-400/40 shadow-xl' : 'border-[#eee1d0] hover:shadow-md'}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="inline-block mb-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">{kitchen.city}</span>
                        <h3 className="text-xl font-display font-bold text-brand-800">{kitchen.name}</h3>
                      </div>
                      <Num className="text-4xl font-display font-black text-brand-600/15 leading-none">{`0${kitchen.id}`}</Num>
                    </div>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-secondary-500 shrink-0" />
                        <span className="text-sm">{kitchen.address}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{kitchen.role}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-secondary-500 shrink-0" />
                        <Num className="text-sm">{kitchen.phone}</Num>
                      </div>
                    </div>
                    <span className="block mt-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-brand-600 to-secondary-500" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveId(kitchen.id); focusOnKitchen(kitchen.lat, kitchen.lng); }}
                      className="mt-5 inline-flex items-center gap-2 text-brand-700 font-bold hover:gap-3 transition-all"
                    >
                      <Navigation className="w-4 h-4" />
                      {ar ? 'عرض على الخريطة' : 'Show on map'}
                    </button>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ===== HEADQUARTERS BAND (dark accent) ===== */}
      <section className="bg-[#221713] text-white py-16 md:py-24 relative overflow-hidden">
        <span className="absolute -end-40 -top-40 w-[30rem] h-[30rem] rounded-full bg-secondary-500/10" />
        <div className="max-w-7xl mx-auto px-6 relative grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <Eyebrow>{ar ? 'المقر الرئيسي' : 'Headquarters'}</Eyebrow>
            <h2 className="mt-3 font-display font-black text-3xl md:text-5xl leading-tight">{ar ? 'الإدارة العامة في حي النزهة' : 'General management in Al-Nuzha'}</h2>
            <p className="mt-4 text-white/75 text-lg leading-relaxed max-w-xl">
              {ar
                ? 'من المقر الرئيسي تُدار عمليات التخطيط والتشغيل واللوجستيات التي تربط المطابخ الثلاثة بمناطق التوزيع في مكة المكرمة.'
                : 'From our headquarters we run the planning, operations and logistics that link the three kitchens to distribution zones across Makkah.'}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-8">
            <div className="flex items-start gap-4">
              <span className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-secondary-300" />
              </span>
              <div>
                <p className="font-bold">{ar ? 'العنوان' : 'Address'}</p>
                <p className="text-white/70 text-sm mt-1">{ar ? 'شارع عبدالله عارف، حي النزهة، مكة المكرمة' : 'Abdullah Arif St, Al-Nuzha District, Makkah'}</p>
              </div>
            </div>
            <div className="h-px bg-white/10 my-6" />
            <div className="flex items-start gap-4">
              <span className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-secondary-300" />
              </span>
              <div>
                <p className="font-bold">{ar ? 'الهاتف' : 'Phone'}</p>
                <Num className="text-white/70 text-sm mt-1 block">0570165050</Num>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA (dark) ===== */}
      <section className="bg-[#0f0e0d] text-white py-16 md:py-24 relative overflow-hidden">
        <span className="absolute -top-40 -end-24 w-[42rem] h-[42rem] rounded-full bg-brand-600/20 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 md:p-14 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <Eyebrow>{ar ? 'هل تخطط لمشروع إعاشة؟' : 'Planning a catering project?'}</Eyebrow>
              <h2 className="mt-3 font-display font-black text-3xl md:text-5xl leading-tight">{ar ? 'مطابخنا جاهزة لخدمة مشروعك' : 'Our kitchens are ready to serve your project'}</h2>
              <p className="mt-4 text-white/75 text-lg leading-relaxed max-w-xl">{ar ? 'تواصل معنا لتحديد المطبخ الأنسب لموقعك وحجم وجباتك ونطاق خدمتك.' : 'Reach out to match the right kitchen to your site, meal volume and service scope.'}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="tel:0570165050"><Button variant="gold" size="lg">{ar ? 'اتصل بنا الآن' : 'Call us now'}</Button></a>
              </div>
            </div>
            <div className="rounded-2xl bg-[#fffaf2] text-ink p-8 shadow-2xl">
              <strong className="text-2xl font-display font-bold text-brand-800 block">{ar ? 'المضياف العربي' : 'Al-Mudhayaf Al-Arabi'}</strong>
              <div className="h-px bg-[#eadfce] my-6" />
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center"><span className="text-gray-500">{ar ? 'المطابخ' : 'Kitchens'}</span><b className="text-brand-700" dir="ltr">3</b></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">{ar ? 'الموقع' : 'Location'}</span><b className="text-brand-700">{ar ? 'مكة المكرمة' : 'Makkah'}</b></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">{ar ? 'الهاتف' : 'Phone'}</span><b className="text-brand-700" dir="ltr">0570165050</b></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Branches;
