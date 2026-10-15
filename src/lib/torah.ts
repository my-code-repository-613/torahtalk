// Canonical order of the five books and their parshiyos.
// Keys are URL slugs; `name` is the display spelling used on the site.

export interface Parsha { slug: string; name: string; hebrew: string; verses: string }
export interface Sefer { slug: string; name: string; english: string; hebrew: string; parshiyos: Parsha[] }

export const SEFARIM: Sefer[] = [
  { slug: 'bereishis', name: 'Bereishis', english: 'Genesis', hebrew: 'בראשית', parshiyos: [
    { slug: 'bereishis', name: 'Bereishis', hebrew: 'בראשית', verses: 'Genesis 1:1–6:8' },
    { slug: 'noach', name: 'Noach', hebrew: 'נח', verses: 'Genesis 6:9–11:32' },
    { slug: 'lech-lecha', name: 'Lech Lecha', hebrew: 'לך לך', verses: 'Genesis 12:1–17:27' },
    { slug: 'vayeira', name: 'Vayeira', hebrew: 'וירא', verses: 'Genesis 18:1–22:24' },
    { slug: 'chayei-sarah', name: 'Chayei Sarah', hebrew: 'חיי שרה', verses: 'Genesis 23:1–25:18' },
    { slug: 'toldos', name: 'Toldos', hebrew: 'תולדות', verses: 'Genesis 25:19–28:9' },
    { slug: 'vayeitzei', name: 'Vayeitzei', hebrew: 'ויצא', verses: 'Genesis 28:10–32:3' },
    { slug: 'vayishlach', name: 'Vayishlach', hebrew: 'וישלח', verses: 'Genesis 32:4–36:43' },
    { slug: 'vayeishev', name: 'Vayeishev', hebrew: 'וישב', verses: 'Genesis 37:1–40:23' },
    { slug: 'mikeitz', name: 'Mikeitz', hebrew: 'מקץ', verses: 'Genesis 41:1–44:17' },
    { slug: 'vayigash', name: 'Vayigash', hebrew: 'ויגש', verses: 'Genesis 44:18–47:27' },
    { slug: 'vayechi', name: 'Vayechi', hebrew: 'ויחי', verses: 'Genesis 47:28–50:26' },
  ]},
  { slug: 'shemos', name: 'Shemos', english: 'Exodus', hebrew: 'שמות', parshiyos: [
    { slug: 'shemos', name: 'Shemos', hebrew: 'שמות', verses: 'Exodus 1:1–6:1' },
    { slug: 'vaeira', name: "Va'eira", hebrew: 'וארא', verses: 'Exodus 6:2–9:35' },
    { slug: 'bo', name: 'Bo', hebrew: 'בא', verses: 'Exodus 10:1–13:16' },
    { slug: 'beshalach', name: 'Beshalach', hebrew: 'בשלח', verses: 'Exodus 13:17–17:16' },
    { slug: 'yisro', name: 'Yisro', hebrew: 'יתרו', verses: 'Exodus 18:1–20:23' },
    { slug: 'mishpatim', name: 'Mishpatim', hebrew: 'משפטים', verses: 'Exodus 21:1–24:18' },
    { slug: 'terumah', name: 'Terumah', hebrew: 'תרומה', verses: 'Exodus 25:1–27:19' },
    { slug: 'tetzaveh', name: 'Tetzaveh', hebrew: 'תצוה', verses: 'Exodus 27:20–30:10' },
    { slug: 'ki-sisa', name: 'Ki Sisa', hebrew: 'כי תשא', verses: 'Exodus 30:11–34:35' },
    { slug: 'vayakhel', name: 'Vayakhel', hebrew: 'ויקהל', verses: 'Exodus 35:1–38:20' },
    { slug: 'pekudei', name: 'Pekudei', hebrew: 'פקודי', verses: 'Exodus 38:21–40:38' },
  ]},
  { slug: 'vayikra', name: 'Vayikra', english: 'Leviticus', hebrew: 'ויקרא', parshiyos: [
    { slug: 'vayikra', name: 'Vayikra', hebrew: 'ויקרא', verses: 'Leviticus 1:1–5:26' },
    { slug: 'tzav', name: 'Tzav', hebrew: 'צו', verses: 'Leviticus 6:1–8:36' },
    { slug: 'shemini', name: 'Shemini', hebrew: 'שמיני', verses: 'Leviticus 9:1–11:47' },
    { slug: 'tazria', name: 'Tazria', hebrew: 'תזריע', verses: 'Leviticus 12:1–13:59' },
    { slug: 'metzora', name: 'Metzora', hebrew: 'מצורע', verses: 'Leviticus 14:1–15:33' },
    { slug: 'acharei-mos', name: 'Acharei Mos', hebrew: 'אחרי מות', verses: 'Leviticus 16:1–18:30' },
    { slug: 'kedoshim', name: 'Kedoshim', hebrew: 'קדושים', verses: 'Leviticus 19:1–20:27' },
    { slug: 'emor', name: 'Emor', hebrew: 'אמור', verses: 'Leviticus 21:1–24:23' },
    { slug: 'behar', name: 'Behar', hebrew: 'בהר', verses: 'Leviticus 25:1–26:2' },
    { slug: 'bechukosai', name: 'Bechukosai', hebrew: 'בחקתי', verses: 'Leviticus 26:3–27:34' },
  ]},
  { slug: 'bamidbar', name: 'Bamidbar', english: 'Numbers', hebrew: 'במדבר', parshiyos: [
    { slug: 'bamidbar', name: 'Bamidbar', hebrew: 'במדבר', verses: 'Numbers 1:1–4:20' },
    { slug: 'naso', name: 'Naso', hebrew: 'נשא', verses: 'Numbers 4:21–7:89' },
    { slug: 'behaaloscha', name: "Beha'aloscha", hebrew: 'בהעלתך', verses: 'Numbers 8:1–12:16' },
    { slug: 'shelach', name: 'Shelach', hebrew: 'שלח', verses: 'Numbers 13:1–15:41' },
    { slug: 'korach', name: 'Korach', hebrew: 'קרח', verses: 'Numbers 16:1–18:32' },
    { slug: 'chukas', name: 'Chukas', hebrew: 'חקת', verses: 'Numbers 19:1–22:1' },
    { slug: 'balak', name: 'Balak', hebrew: 'בלק', verses: 'Numbers 22:2–25:9' },
    { slug: 'pinchas', name: 'Pinchas', hebrew: 'פינחס', verses: 'Numbers 25:10–30:1' },
    { slug: 'matos', name: 'Matos', hebrew: 'מטות', verses: 'Numbers 30:2–32:42' },
    { slug: 'masei', name: 'Masei', hebrew: 'מסעי', verses: 'Numbers 33:1–36:13' },
  ]},
  { slug: 'devarim', name: 'Devarim', english: 'Deuteronomy', hebrew: 'דברים', parshiyos: [
    { slug: 'devarim', name: 'Devarim', hebrew: 'דברים', verses: 'Deuteronomy 1:1–3:22' },
    { slug: 'vaeschanan', name: "Va'eschanan", hebrew: 'ואתחנן', verses: 'Deuteronomy 3:23–7:11' },
    { slug: 'eikev', name: 'Eikev', hebrew: 'עקב', verses: 'Deuteronomy 7:12–11:25' },
    { slug: 'reeh', name: "Re'eh", hebrew: 'ראה', verses: 'Deuteronomy 11:26–16:17' },
    { slug: 'shoftim', name: 'Shoftim', hebrew: 'שופטים', verses: 'Deuteronomy 16:18–21:9' },
    { slug: 'ki-seitzei', name: 'Ki Seitzei', hebrew: 'כי תצא', verses: 'Deuteronomy 21:10–25:19' },
    { slug: 'ki-savo', name: 'Ki Savo', hebrew: 'כי תבוא', verses: 'Deuteronomy 26:1–29:8' },
    { slug: 'nitzavim', name: 'Nitzavim', hebrew: 'נצבים', verses: 'Deuteronomy 29:9–30:20' },
    { slug: 'vayeilech', name: 'Vayeilech', hebrew: 'וילך', verses: 'Deuteronomy 31:1–31:30' },
    { slug: 'haazinu', name: "Ha'azinu", hebrew: 'האזינו', verses: 'Deuteronomy 32:1–32:52' },
    { slug: 'vezos-haberachah', name: "V'zos Haberachah", hebrew: 'וזאת הברכה', verses: 'Deuteronomy 33:1–34:12' },
  ]},
  { slug: 'holidays', name: 'Holidays', english: 'Yomim Tovim', hebrew: 'מועדים', parshiyos: [
    { slug: 'rosh-hashanah', name: 'Rosh Hashanah', hebrew: 'ראש השנה', verses: '' },
    { slug: 'yom-kippur', name: 'Yom Kippur', hebrew: 'יום כיפור', verses: '' },
    { slug: 'succos', name: 'Succos', hebrew: 'סוכות', verses: '' },
    { slug: 'chanukah', name: 'Chanukah', hebrew: 'חנוכה', verses: '' },
    { slug: 'purim', name: 'Purim', hebrew: 'פורים', verses: '' },
    { slug: 'pesach', name: 'Pesach', hebrew: 'פסח', verses: '' },
    { slug: 'shavuos', name: 'Shavuos', hebrew: 'שבועות', verses: '' },
    { slug: 'tisha-bav', name: "Tisha B'Av", hebrew: 'תשעה באב', verses: '' },
    { slug: 'other', name: 'Other', hebrew: '', verses: '' },
  ]},
  { slug: 'mitzvos', name: 'Mitzvos', english: 'Mitzvos & Topics', hebrew: 'מצוות', parshiyos: [
    { slug: 'general', name: 'General', hebrew: '', verses: '' },
  ]},
];

export const seferBySlug = (s: string) => SEFARIM.find(x => x.slug === s);
export const parshaBySlug = (sefer: string, p: string) => seferBySlug(sefer)?.parshiyos.find(x => x.slug === p);
export const ALL_SEFER_SLUGS = SEFARIM.map(s => s.slug);
export const ALL_PARSHA_SLUGS = SEFARIM.flatMap(s => s.parshiyos.map(p => p.slug));
