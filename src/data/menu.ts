// Shared catering menu (used by the POS; mirrors the ordering app's dishes).
export interface ModOption { id: number; name: string; price: number; }
export interface ModGroup { id: number; name: string; required?: boolean; max: number; options: ModOption[]; }
export interface PosProduct {
  id: number;
  name: string;
  price: number;       // SAR, VAT-inclusive
  category: string;
  image: string;
  modifiers?: ModGroup[];
}

export const POS_CATEGORIES = ['كبسة ومندي', 'مشويات', 'شعبيات', 'مقبلات', 'حلويات', 'مشروبات'];

// shared modifier groups
const RICE: ModGroup = { id: 1, name: 'نوع الرز', required: true, max: 1, options: [{ id: 101, name: 'بشاور (أبيض)', price: 0 }, { id: 102, name: 'شعبي (أحمر)', price: 0 }, { id: 103, name: 'بخاري', price: 4 }] };
const PORTION: ModGroup = { id: 2, name: 'الحجم', required: true, max: 1, options: [{ id: 201, name: 'فردي', price: 0 }, { id: 202, name: 'عائلي (يكفي 4)', price: 95 }, { id: 203, name: 'وليمة (يكفي 8)', price: 210 }] };
const EXTRAS: ModGroup = { id: 3, name: 'إضافات', max: 5, options: [{ id: 301, name: 'صنوبر', price: 6 }, { id: 302, name: 'مكسرات', price: 5 }, { id: 303, name: 'بصل مقلي', price: 3 }, { id: 304, name: 'زبيب', price: 2 }] };
const SPICE: ModGroup = { id: 4, name: 'درجة الحرارة', required: true, max: 1, options: [{ id: 401, name: 'عادي', price: 0 }, { id: 402, name: 'حار', price: 0 }] };
const SIDES: ModGroup = { id: 5, name: 'إضافات جانبية', max: 3, options: [{ id: 501, name: 'كمّاج', price: 3 }, { id: 502, name: 'صلصة ثوم', price: 3 }, { id: 503, name: 'حمص جانبي', price: 6 }] };

const RICE_SET = [RICE, PORTION, EXTRAS];
const GRILL_SET = [SPICE, SIDES];

export const POS_MENU: PosProduct[] = [
  // كبسة ومندي
  { id: 1, name: 'كبسة لحم نعيمي', price: 65, category: 'كبسة ومندي', image: 'dishes/main-1.jpg', modifiers: RICE_SET },
  { id: 2, name: 'كبسة دجاج', price: 38, category: 'كبسة ومندي', image: 'dishes/main-5.jpg', modifiers: RICE_SET },
  { id: 3, name: 'مندي لحم', price: 72, category: 'كبسة ومندي', image: 'dishes/main-4.jpg', modifiers: [PORTION, EXTRAS] },
  { id: 4, name: 'مندي دجاج', price: 40, category: 'كبسة ومندي', image: 'dishes/main-6.jpg', modifiers: [PORTION, EXTRAS] },
  { id: 5, name: 'أرز بخاري باللحم', price: 60, category: 'كبسة ومندي', image: 'dishes/main-6.jpg', modifiers: [PORTION, EXTRAS] },
  { id: 6, name: 'برياني دجاج', price: 42, category: 'كبسة ومندي', image: 'dishes/main-2.jpg', modifiers: [SPICE, PORTION] },
  { id: 7, name: 'مظبي دجاج', price: 45, category: 'كبسة ومندي', image: 'dishes/main-5.jpg', modifiers: [RICE, PORTION] },
  { id: 8, name: 'مفطّح خروف كامل', price: 850, category: 'كبسة ومندي', image: 'services/banquets.jpg', modifiers: [EXTRAS] },
  // مشويات
  { id: 9, name: 'مشاوي مشكّلة', price: 88, category: 'مشويات', image: 'dishes/grill-2.jpg', modifiers: GRILL_SET },
  { id: 10, name: 'شيش طاووق', price: 36, category: 'مشويات', image: 'dishes/grill-1.jpg', modifiers: GRILL_SET },
  { id: 11, name: 'كباب لحم', price: 48, category: 'مشويات', image: 'dishes/grill-3.jpg', modifiers: GRILL_SET },
  { id: 12, name: 'أرياش لحم', price: 95, category: 'مشويات', image: 'dishes/grill-4.jpg', modifiers: [SIDES] },
  { id: 13, name: 'تكة دجاج', price: 34, category: 'مشويات', image: 'dishes/grill-1.jpg', modifiers: GRILL_SET },
  // شعبيات
  { id: 14, name: 'جريش أحمر', price: 28, category: 'شعبيات', image: 'dishes/main-6.jpg' },
  { id: 15, name: 'مرقوق باللحم', price: 30, category: 'شعبيات', image: 'dishes/main-4.jpg' },
  { id: 16, name: 'قرصان', price: 26, category: 'شعبيات', image: 'dishes/main-2.jpg' },
  { id: 17, name: 'صالونة لحم', price: 32, category: 'شعبيات', image: 'dishes/main-5.jpg' },
  { id: 18, name: 'مطازيز', price: 29, category: 'شعبيات', image: 'dishes/main-1.jpg' },
  // مقبلات
  { id: 19, name: 'حمص بالطحينة', price: 14, category: 'مقبلات', image: 'dishes/mezze-1.jpg' },
  { id: 20, name: 'متبّل باذنجان', price: 14, category: 'مقبلات', image: 'dishes/mezze-1.jpg' },
  { id: 21, name: 'تبّولة', price: 16, category: 'مقبلات', image: 'dishes/mezze-2.jpg' },
  { id: 22, name: 'فتّوش', price: 16, category: 'مقبلات', image: 'dishes/mezze-2.jpg' },
  { id: 23, name: 'سمبوسك لحم', price: 18, category: 'مقبلات', image: 'dishes/samosa-1.jpg' },
  { id: 24, name: 'ورق عنب', price: 20, category: 'مقبلات', image: 'dishes/dolma-1.jpg' },
  { id: 25, name: 'سلطة خضراء', price: 12, category: 'مقبلات', image: 'dishes/mezze-2.jpg' },
  // حلويات
  { id: 26, name: 'لقيمات', price: 18, category: 'حلويات', image: 'dishes/luqaimat-1.jpg' },
  { id: 27, name: 'كنافة', price: 22, category: 'حلويات', image: 'dishes/kunafa-1.jpg' },
  { id: 28, name: 'بقلاوة', price: 24, category: 'حلويات', image: 'dishes/sweet-1.jpg' },
  { id: 29, name: 'أم علي', price: 20, category: 'حلويات', image: 'dishes/sweet-2.jpg' },
  // مشروبات
  { id: 30, name: 'قهوة عربية وتمر', price: 18, category: 'مشروبات', image: 'dishes/drink-1.jpg' },
  { id: 31, name: 'شاي بالنعناع', price: 8, category: 'مشروبات', image: 'dishes/tea-1.jpg' },
  { id: 32, name: 'عصير برتقال طازج', price: 14, category: 'مشروبات', image: 'dishes/juice-1.jpg' },
  { id: 33, name: 'لبن وعيران', price: 7, category: 'مشروبات', image: 'dishes/laban-1.jpg' },
];
