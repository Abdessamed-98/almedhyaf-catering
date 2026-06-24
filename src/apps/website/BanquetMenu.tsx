import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../ui';
import { motion } from 'motion/react';
import { UtensilsCrossed, Flame, Salad, Cookie, Coffee, Star, ShoppingBag } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

interface Dish { n: string; en: string; d: string; de: string; img: string; star?: boolean }
interface Category { key: string; label: string; labelEn: string; Icon: React.ComponentType<{ className?: string }>; dishes: Dish[] }

/** Full banquet menu — tabbed categories with photo dish cards. */
const BanquetMenu: React.FC<{ onOrderNow?: () => void }> = ({ onOrderNow }) => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [active, setActive] = useState(0);

  const categories: Category[] = [
    {
      key: 'mains', label: 'الأطباق الرئيسية', labelEn: 'Signature Mains', Icon: UtensilsCrossed,
      dishes: [
        { n: 'المندي', en: 'Mandi', d: 'لحم أو دجاج مدخّن في التنّور على أرز بسمتي معطّر بالبهارات.', de: 'Tandoor-smoked lamb or chicken over fragrant basmati rice.', img: 'dishes/main-4.jpg', star: true },
        { n: 'الكبسة', en: 'Kabsa', d: 'أرز بالبهارات السعودية مع اللحم والمكسرات والزبيب.', de: 'Saudi-spiced rice with meat, nuts and raisins.', img: 'dishes/main-1.jpg', star: true },
        { n: 'المفطّح', en: 'Mufattah', d: 'خروف كامل على أرز بخاري — طبق الولائم الكبرى.', de: 'Whole lamb over Bukhari rice — the grand-banquet centerpiece.', img: 'services/banquets.jpg', star: true },
        { n: 'المظبي', en: 'Mathbi', d: 'دجاج مشوي على الحجر بنكهة الفحم الأصيلة.', de: 'Stone-grilled chicken with an authentic smoky char.', img: 'dishes/main-5.jpg' },
        { n: 'البرياني', en: 'Biryani', d: 'أرز هندي بالبهارات الحارّة واللحم الطري.', de: 'Spiced Indian rice with tender meat.', img: 'dishes/main-2.jpg' },
        { n: 'أرز بخاري', en: 'Bukhari Rice', d: 'أرز بالجزر والزبيب يُقدّم مع الدجاج.', de: 'Carrot-and-raisin rice served with chicken.', img: 'dishes/main-6.jpg' },
      ],
    },
    {
      key: 'grill', label: 'المشويات', labelEn: 'From the Grill', Icon: Flame,
      dishes: [
        { n: 'مشاوي مشكّلة', en: 'Mixed Grill', d: 'تشكيلة كباب وتكة وأوصال مشوية على الفحم.', de: 'Charcoal kebab, tikka and chops.', img: 'dishes/grill-2.jpg', star: true },
        { n: 'شيش طاووق', en: 'Shish Tawook', d: 'قطع دجاج متبّلة مشوية على الأسياخ.', de: 'Marinated grilled chicken skewers.', img: 'dishes/grill-1.jpg' },
        { n: 'كباب', en: 'Kebab', d: 'لحم مفروم متبّل بالبهارات والأعشاب.', de: 'Spiced minced-meat kebab.', img: 'dishes/grill-3.jpg' },
        { n: 'أرياش', en: 'Lamb Chops', d: 'ريش خروف مشوية على الفحم.', de: 'Charcoal-grilled lamb ribs.', img: 'dishes/grill-4.jpg' },
      ],
    },
    {
      key: 'mezze', label: 'المقبلات والسلطات', labelEn: 'Mezze & Salads', Icon: Salad,
      dishes: [
        { n: 'حمص ومتبّل', en: 'Hummus & Mutabbal', d: 'معجّنات الحمّص والباذنجان المدخّن.', de: 'Chickpea and smoky-eggplant dips.', img: 'dishes/mezze-1.jpg' },
        { n: 'تبّولة وفتّوش', en: 'Tabbouleh & Fattoush', d: 'سلطات شامية طازجة بزيت الزيتون.', de: 'Fresh Levantine salads in olive oil.', img: 'dishes/mezze-2.jpg' },
        { n: 'سمبوسك', en: 'Sambousek', d: 'معجّنات مقرمشة محشوة باللحم أو الخضار.', de: 'Crisp pastries with meat or vegetables.', img: 'dishes/samosa-1.jpg' },
        { n: 'ورق عنب', en: 'Vine Leaves', d: 'محشي بالأرز والبهارات.', de: 'Rice-and-spice stuffed vine leaves.', img: 'dishes/dolma-1.jpg' },
      ],
    },
    {
      key: 'sweets', label: 'الحلويات', labelEn: 'Sweets', Icon: Cookie,
      dishes: [
        { n: 'اللقيمات', en: 'Luqaimat', d: 'كرات مقرمشة بالعسل والسمسم.', de: 'Crisp dumplings in honey & sesame.', img: 'dishes/luqaimat-1.jpg', star: true },
        { n: 'الكنافة', en: 'Kunafa', d: 'عجينة وجبن وقطر بماء الورد.', de: 'Cheese pastry in rose syrup.', img: 'dishes/kunafa-1.jpg' },
        { n: 'أم علي', en: 'Umm Ali', d: 'حلى دافئ بالحليب والمكسرات.', de: 'Warm milk-and-nut pudding.', img: 'dishes/sweet-2.jpg' },
        { n: 'بقلاوة', en: 'Baklava', d: 'طبقات رقيقة بالفستق والعسل.', de: 'Pistachio-and-honey layered pastry.', img: 'dishes/sweet-1.jpg' },
      ],
    },
    {
      key: 'drinks', label: 'المشروبات', labelEn: 'Beverages', Icon: Coffee,
      dishes: [
        { n: 'القهوة العربية والتمر', en: 'Arabic Coffee & Dates', d: 'ضيافة أصيلة لاستقبال الضيوف.', de: 'The authentic welcome for your guests.', img: 'dishes/drink-1.jpg', star: true },
        { n: 'الشاي بالنعناع', en: 'Mint Tea', d: 'شاي ساخن بالنعناع الطازج.', de: 'Hot tea with fresh mint.', img: 'dishes/tea-1.jpg' },
        { n: 'عصائر طازجة', en: 'Fresh Juices', d: 'تشكيلة موسمية متنوّعة.', de: 'A varied, seasonal selection.', img: 'dishes/juice-1.jpg' },
        { n: 'لبن وعيران', en: 'Laban & Ayran', d: 'مشروبات لبن منعشة.', de: 'Refreshing yogurt drinks.', img: 'dishes/laban-1.jpg' },
      ],
    },
  ];

  const cat = categories[active];

  return (
    <section className="bg-parchment text-ink py-16 md:py-24" id="banquet-menu">
      <div className="max-w-7xl mx-auto px-6">
        {/* header */}
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-brand-600 font-black text-xs md:text-sm tracking-wide">{ar ? 'قائمة الولائم' : 'The Banquet Menu'}</span>
          <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'أطباق الكرم العربي على مائدتك' : 'Arab generosity, on your table'}</h2>
          <div className="ornament my-5"><span className="w-2 h-2 rotate-45 bg-secondary-500" /></div>
          <p className="text-gray-600 leading-relaxed">{ar ? 'تشكيلة من أشهى الأطباق الشعبية والعالمية التي نقدّمها في ولائمنا — تُحضَّر طازجة وتُقدَّم بأسلوب يليق بضيوفك.' : 'A selection of the finest traditional and international dishes we serve at our banquets — freshly prepared and presented to honor your guests.'}</p>
        </motion.div>

        {/* category tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {categories.map((c, i) => (
            <button
              key={c.key}
              onClick={() => setActive(i)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${
                active === i
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                  : 'bg-white text-brand-700 border border-[#eee1d0] hover:border-secondary-500/50 hover:text-brand-800'
              }`}
            >
              <c.Icon className="w-4 h-4" />
              {ar ? c.label : c.labelEn}
            </button>
          ))}
        </div>

        {/* dishes */}
        <motion.div
          key={cat.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {cat.dishes.map((dish, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl bg-white border border-[#eee1d0] shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-secondary-500/40 transition-all flex flex-col"
            >
              <div className="relative overflow-hidden h-48">
                <img src={dish.img} alt={ar ? dish.n : dish.en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {dish.star && (
                  <span className="absolute top-3 end-3 inline-flex items-center gap-1 text-[11px] font-bold text-ink bg-secondary-400 rounded-full px-2.5 py-1 shadow-md">
                    <Star className="w-3 h-3 fill-ink" />
                    {ar ? 'الأكثر طلباً' : 'Popular'}
                  </span>
                )}
                <h3 className="absolute bottom-3 start-4 end-4 font-display font-bold text-xl text-white drop-shadow">{ar ? dish.n : dish.en}</h3>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 leading-relaxed">{ar ? dish.d : dish.de}</p>
                {onOrderNow && (
                  <button
                    onClick={onOrderNow}
                    className="mt-4 self-start inline-flex items-center gap-2 rounded-full bg-brand-600 text-white text-sm font-bold px-4 py-2 hover:bg-brand-700 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" /> {ar ? 'اطلب الآن' : 'Order'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* note + order CTA */}
        <motion.div {...fadeUp} className="mt-12 rounded-2xl bg-white border border-[#eee1d0] shadow-sm p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-start">
          <div>
            <h3 className="font-display font-bold text-xl text-brand-800">{ar ? 'جاهزون لخدمة وليمتك؟' : 'Ready to cater your banquet?'}</h3>
            <p className="mt-1 text-sm text-gray-500">{ar ? 'القائمة قابلة للتخصيص حسب عدد الضيوف ونوع المناسبة.' : 'The menu is fully customizable to your guest count and occasion.'}</p>
          </div>
          {onOrderNow && (
            <Button variant="gold" size="lg" onClick={onOrderNow} className="w-full sm:w-auto justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" /> {ar ? 'اطلب الآن' : 'Order Now'}
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default BanquetMenu;
