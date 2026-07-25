import type { Lang } from "./languages";

// Translations for the finite category vocabulary used across the dataset
// (body parts, target muscles, equipment). Keyed by the English value as
// stored in exercises.json. English falls through to a title-cased key, so we
// only store the 9 non-English languages here.
//
// Best-effort translations — easy to refine term by term.
type Row = Partial<Record<Exclude<Lang, "en">, string>>;

export const VOCAB: Record<string, Row> = {
  // ── Body parts ──────────────────────────────────────────
  back: { es: "Espalda", it: "Schiena", fr: "Dos", tr: "Sırt", ru: "Спина", zh: "背部", hi: "पीठ", pl: "Plecy", ko: "등" },
  cardio: { es: "Cardio", it: "Cardio", fr: "Cardio", tr: "Kardiyo", ru: "Кардио", zh: "有氧", hi: "कार्डियो", pl: "Cardio", ko: "유산소" },
  chest: { es: "Pecho", it: "Petto", fr: "Poitrine", tr: "Göğüs", ru: "Грудь", zh: "胸部", hi: "छाती", pl: "Klatka piersiowa", ko: "가슴" },
  "lower arms": { es: "Antebrazos", it: "Avambracci", fr: "Avant-bras", tr: "Ön kol", ru: "Предплечья", zh: "前臂", hi: "अग्रबाहु", pl: "Przedramiona", ko: "아래팔" },
  "lower legs": { es: "Pantorrillas", it: "Polpacci", fr: "Mollets", tr: "Alt bacak", ru: "Голени", zh: "小腿", hi: "निचला पैर", pl: "Łydki", ko: "종아리" },
  neck: { es: "Cuello", it: "Collo", fr: "Cou", tr: "Boyun", ru: "Шея", zh: "颈部", hi: "गर्दन", pl: "Szyja", ko: "목" },
  shoulders: { es: "Hombros", it: "Spalle", fr: "Épaules", tr: "Omuzlar", ru: "Плечи", zh: "肩部", hi: "कंधे", pl: "Barki", ko: "어깨" },
  "upper arms": { es: "Brazos", it: "Braccia", fr: "Bras", tr: "Üst kol", ru: "Верх рук", zh: "上臂", hi: "ऊपरी बाँह", pl: "Ramiona", ko: "위팔" },
  "upper legs": { es: "Muslos", it: "Cosce", fr: "Cuisses", tr: "Üst bacak", ru: "Бёдра", zh: "大腿", hi: "जांघ", pl: "Uda", ko: "허벅지" },
  waist: { es: "Cintura", it: "Vita", fr: "Taille", tr: "Bel", ru: "Талия", zh: "腰部", hi: "कमर", pl: "Talia", ko: "허리" },

  // ── Target muscles ──────────────────────────────────────
  abductors: { es: "Abductores", it: "Abduttori", fr: "Abducteurs", tr: "Abdüktörler", ru: "Отводящие мышцы", zh: "外展肌", hi: "अपवर्तक", pl: "Odwodziciele", ko: "외전근" },
  abs: { es: "Abdominales", it: "Addominali", fr: "Abdominaux", tr: "Karın", ru: "Пресс", zh: "腹肌", hi: "पेट", pl: "Brzuch", ko: "복근" },
  adductors: { es: "Aductores", it: "Adduttori", fr: "Adducteurs", tr: "Addüktörler", ru: "Приводящие мышцы", zh: "内收肌", hi: "संयोजक", pl: "Przywodziciele", ko: "내전근" },
  biceps: { es: "Bíceps", it: "Bicipiti", fr: "Biceps", tr: "Biceps", ru: "Бицепс", zh: "二头肌", hi: "बाइसेप्स", pl: "Biceps", ko: "이두근" },
  calves: { es: "Pantorrillas", it: "Polpacci", fr: "Mollets", tr: "Baldırlar", ru: "Икры", zh: "小腿", hi: "पिंडली", pl: "Łydki", ko: "종아리" },
  "cardiovascular system": { es: "Sistema cardiovascular", it: "Sistema cardiovascolare", fr: "Système cardiovasculaire", tr: "Kardiyovasküler sistem", ru: "Сердечно-сосудистая система", zh: "心血管系统", hi: "हृदय प्रणाली", pl: "Układ krążenia", ko: "심혈관계" },
  delts: { es: "Deltoides", it: "Deltoidi", fr: "Deltoïdes", tr: "Deltoidler", ru: "Дельты", zh: "三角肌", hi: "डेल्टॉइड", pl: "Naramienne", ko: "삼각근" },
  forearms: { es: "Antebrazos", it: "Avambracci", fr: "Avant-bras", tr: "Ön kollar", ru: "Предплечья", zh: "前臂", hi: "अग्रबाहु", pl: "Przedramiona", ko: "전완근" },
  glutes: { es: "Glúteos", it: "Glutei", fr: "Fessiers", tr: "Kalçalar", ru: "Ягодицы", zh: "臀肌", hi: "ग्लूट्स", pl: "Pośladki", ko: "둔근" },
  hamstrings: { es: "Isquiotibiales", it: "Femorali", fr: "Ischio-jambiers", tr: "Arka bacak", ru: "Задняя поверхность бедра", zh: "腘绳肌", hi: "हैमस्ट्रिंग", pl: "Dwugłowe uda", ko: "햄스트링" },
  lats: { es: "Dorsales", it: "Dorsali", fr: "Grands dorsaux", tr: "Sırt kasları", ru: "Широчайшие", zh: "背阔肌", hi: "लैट्स", pl: "Najszersze grzbietu", ko: "광배근" },
  "levator scapulae": { es: "Elevador de la escápula", it: "Elevatore della scapola", fr: "Élévateur de la scapula", tr: "Levator skapula", ru: "Мышца, поднимающая лопатку", zh: "提肩胛肌", hi: "लेवेटर स्कैपुला", pl: "Dźwigacz łopatki", ko: "견갑거근" },
  pectorals: { es: "Pectorales", it: "Pettorali", fr: "Pectoraux", tr: "Göğüs kasları", ru: "Грудные", zh: "胸肌", hi: "पेक्टोरल", pl: "Piersiowe", ko: "흉근" },
  quads: { es: "Cuádriceps", it: "Quadricipiti", fr: "Quadriceps", tr: "Quadriceps", ru: "Квадрицепс", zh: "股四头肌", hi: "क्वाड्स", pl: "Czworogłowe", ko: "대퇴사두근" },
  "serratus anterior": { es: "Serrato anterior", it: "Dentato anteriore", fr: "Dentelé antérieur", tr: "Serratus anterior", ru: "Передняя зубчатая мышца", zh: "前锯肌", hi: "सेराटस एन्टीरियर", pl: "Zębaty przedni", ko: "전거근" },
  spine: { es: "Columna", it: "Colonna vertebrale", fr: "Colonne vertébrale", tr: "Omurga", ru: "Позвоночник", zh: "脊柱", hi: "रीढ़", pl: "Kręgosłup", ko: "척추" },
  traps: { es: "Trapecios", it: "Trapezi", fr: "Trapèzes", tr: "Trapezler", ru: "Трапеции", zh: "斜方肌", hi: "ट्रैप्स", pl: "Czworoboczne", ko: "승모근" },
  triceps: { es: "Tríceps", it: "Tricipiti", fr: "Triceps", tr: "Triceps", ru: "Трицепс", zh: "三头肌", hi: "ट्राइसेप्स", pl: "Triceps", ko: "삼두근" },
  "upper back": { es: "Espalda alta", it: "Schiena alta", fr: "Haut du dos", tr: "Üst sırt", ru: "Верх спины", zh: "上背部", hi: "ऊपरी पीठ", pl: "Górna część pleców", ko: "상부 등" },

  // ── Equipment ───────────────────────────────────────────
  assisted: { es: "Asistido", it: "Assistito", fr: "Assisté", tr: "Destekli", ru: "С поддержкой", zh: "辅助", hi: "सहायता प्राप्त", pl: "Wspomagany", ko: "보조" },
  band: { es: "Banda", it: "Banda", fr: "Bande", tr: "Bant", ru: "Резинка", zh: "弹力带", hi: "बैंड", pl: "Guma", ko: "밴드" },
  barbell: { es: "Barra", it: "Bilanciere", fr: "Barre", tr: "Halter", ru: "Штанга", zh: "杠铃", hi: "बारबेल", pl: "Sztanga", ko: "바벨" },
  "body weight": { es: "Peso corporal", it: "Corpo libero", fr: "Poids du corps", tr: "Vücut ağırlığı", ru: "Свой вес", zh: "自重", hi: "शारीरिक भार", pl: "Masa ciała", ko: "맨몸" },
  "bosu ball": { es: "Bosu", it: "Bosu", fr: "Bosu", tr: "Bosu topu", ru: "Босу", zh: "波速球", hi: "बोसु बॉल", pl: "Bosu", ko: "보수볼" },
  cable: { es: "Polea", it: "Cavo", fr: "Câble", tr: "Kablo", ru: "Блок", zh: "拉索", hi: "केबल", pl: "Wyciąg", ko: "케이블" },
  dumbbell: { es: "Mancuerna", it: "Manubrio", fr: "Haltère", tr: "Dambıl", ru: "Гантель", zh: "哑铃", hi: "डम्बल", pl: "Hantel", ko: "덤벨" },
  "elliptical machine": { es: "Elíptica", it: "Ellittica", fr: "Elliptique", tr: "Eliptik", ru: "Эллипс", zh: "椭圆机", hi: "एलिप्टिकल", pl: "Orbitrek", ko: "일립티컬" },
  "ez barbell": { es: "Barra EZ", it: "Bilanciere EZ", fr: "Barre EZ", tr: "EZ halter", ru: "EZ-штанга", zh: "EZ杠铃", hi: "EZ बारबेल", pl: "Łamana sztanga", ko: "EZ바벨" },
  hammer: { es: "Martillo", it: "Martello", fr: "Marteau", tr: "Çekiç", ru: "Молот", zh: "锤子", hi: "हैमर", pl: "Młot", ko: "해머" },
  kettlebell: { es: "Pesa rusa", it: "Kettlebell", fr: "Kettlebell", tr: "Kettlebell", ru: "Гиря", zh: "壶铃", hi: "केटलबेल", pl: "Kettlebell", ko: "케틀벨" },
  "leverage machine": { es: "Máquina de palanca", it: "Macchina a leva", fr: "Machine à levier", tr: "Kollu makine", ru: "Рычажный тренажёр", zh: "杠杆器械", hi: "लीवरेज मशीन", pl: "Maszyna dźwigniowa", ko: "레버리지 머신" },
  "medicine ball": { es: "Balón medicinal", it: "Palla medica", fr: "Ballon médicinal", tr: "Sağlık topu", ru: "Медбол", zh: "药球", hi: "मेडिसिन बॉल", pl: "Piłka lekarska", ko: "메디신볼" },
  "olympic barbell": { es: "Barra olímpica", it: "Bilanciere olimpico", fr: "Barre olympique", tr: "Olimpik halter", ru: "Олимпийская штанга", zh: "奥林匹克杠铃", hi: "ओलंपिक बारबेल", pl: "Sztanga olimpijska", ko: "올림픽 바벨" },
  "resistance band": { es: "Banda de resistencia", it: "Banda elastica", fr: "Bande de résistance", tr: "Direnç bandı", ru: "Эспандер", zh: "阻力带", hi: "रेसिस्टेंस बैंड", pl: "Taśma oporowa", ko: "저항 밴드" },
  roller: { es: "Rodillo", it: "Rullo", fr: "Rouleau", tr: "Silindir", ru: "Ролик", zh: "滚轮", hi: "रोलर", pl: "Wałek", ko: "롤러" },
  rope: { es: "Cuerda", it: "Corda", fr: "Corde", tr: "İp", ru: "Канат", zh: "绳索", hi: "रस्सी", pl: "Lina", ko: "로프" },
  "skierg machine": { es: "Máquina SkiErg", it: "SkiErg", fr: "SkiErg", tr: "SkiErg", ru: "SkiErg", zh: "滑雪机", hi: "स्कीएर्ग", pl: "SkiErg", ko: "스키어그" },
  "sled machine": { es: "Trineo", it: "Slitta", fr: "Traîneau", tr: "Kızak", ru: "Сани", zh: "雪橇", hi: "स्लेड", pl: "Sanie", ko: "슬레드" },
  "smith machine": { es: "Máquina Smith", it: "Multipower", fr: "Machine Smith", tr: "Smith makinesi", ru: "Смит-машина", zh: "史密斯机", hi: "स्मिथ मशीन", pl: "Maszyna Smitha", ko: "스미스 머신" },
  "stability ball": { es: "Fitball", it: "Fitball", fr: "Ballon de stabilité", tr: "Denge topu", ru: "Фитбол", zh: "稳定球", hi: "स्टेबिलिटी बॉल", pl: "Piłka gimnastyczna", ko: "짐볼" },
  "stationary bike": { es: "Bicicleta estática", it: "Cyclette", fr: "Vélo stationnaire", tr: "Sabit bisiklet", ru: "Велотренажёр", zh: "健身车", hi: "स्थिर साइकिल", pl: "Rower stacjonarny", ko: "실내 자전거" },
  "stepmill machine": { es: "Escaladora", it: "Stepmill", fr: "Escalier", tr: "Stepmill", ru: "Степпер-лестница", zh: "踏步机", hi: "स्टेपमिल", pl: "Stepper", ko: "스텝밀" },
  tire: { es: "Neumático", it: "Pneumatico", fr: "Pneu", tr: "Lastik", ru: "Покрышка", zh: "轮胎", hi: "टायर", pl: "Opona", ko: "타이어" },
  "trap bar": { es: "Barra trap", it: "Trap bar", fr: "Trap bar", tr: "Trap bar", ru: "Трэп-гриф", zh: "六角杠铃", hi: "ट्रैप बार", pl: "Gryf trap", ko: "트랩 바" },
  "upper body ergometer": { es: "Ergómetro de brazos", it: "Ergometro braccia", fr: "Ergomètre bras", tr: "Üst vücut ergometresi", ru: "Эргометр для рук", zh: "上肢功率车", hi: "अपर बॉडी एर्गोमीटर", pl: "Ergometr rąk", ko: "상체 에르고미터" },
  weighted: { es: "Con peso", it: "Con peso", fr: "Lesté", tr: "Ağırlıklı", ru: "С отягощением", zh: "负重", hi: "भारित", pl: "Obciążony", ko: "중량" },
  "wheel roller": { es: "Rueda abdominal", it: "Ruota addominale", fr: "Roue abdominale", tr: "Karın tekerleği", ru: "Ролик для пресса", zh: "健腹轮", hi: "व्हील रोलर", pl: "Kółko do brzucha", ko: "애브 롤러" },

  // ── Secondary muscles (beyond the target list) ──────────
  abdominals: { es: "Abdominales", it: "Addominali", fr: "Abdominaux", tr: "Karın", ru: "Пресс", zh: "腹肌", hi: "पेट", pl: "Brzuch", ko: "복근" },
  "ankle stabilizers": { es: "Estabilizadores del tobillo", it: "Stabilizzatori caviglia", fr: "Stabilisateurs de la cheville", tr: "Ayak bileği sabitleyicileri", ru: "Стабилизаторы голеностопа", zh: "踝关节稳定肌", hi: "टखना स्थिरक", pl: "Stabilizatory kostki", ko: "발목 안정근" },
  ankles: { es: "Tobillos", it: "Caviglie", fr: "Chevilles", tr: "Ayak bilekleri", ru: "Лодыжки", zh: "脚踝", hi: "टखने", pl: "Kostki", ko: "발목" },
  brachialis: { es: "Braquial", it: "Brachiale", fr: "Brachial", tr: "Brakialis", ru: "Плечевая мышца", zh: "肱肌", hi: "ब्राकियलिस", pl: "Ramienny", ko: "상완근" },
  core: { es: "Core", it: "Core", fr: "Gainage", tr: "Kor", ru: "Кор", zh: "核心", hi: "कोर", pl: "Core", ko: "코어" },
  deltoids: { es: "Deltoides", it: "Deltoidi", fr: "Deltoïdes", tr: "Deltoidler", ru: "Дельты", zh: "三角肌", hi: "डेल्टॉइड", pl: "Naramienne", ko: "삼각근" },
  feet: { es: "Pies", it: "Piedi", fr: "Pieds", tr: "Ayaklar", ru: "Стопы", zh: "脚", hi: "पैर", pl: "Stopy", ko: "발" },
  "grip muscles": { es: "Músculos de agarre", it: "Muscoli della presa", fr: "Muscles de préhension", tr: "Kavrama kasları", ru: "Мышцы хвата", zh: "握力肌", hi: "पकड़ की मांसपेशियाँ", pl: "Mięśnie chwytu", ko: "악력근" },
  groin: { es: "Ingle", it: "Inguine", fr: "Aine", tr: "Kasık", ru: "Пах", zh: "腹股沟", hi: "कमर", pl: "Pachwina", ko: "사타구니" },
  hands: { es: "Manos", it: "Mani", fr: "Mains", tr: "Eller", ru: "Кисти", zh: "手", hi: "हाथ", pl: "Dłonie", ko: "손" },
  "hip flexors": { es: "Flexores de cadera", it: "Flessori dell'anca", fr: "Fléchisseurs de la hanche", tr: "Kalça fleksörleri", ru: "Сгибатели бедра", zh: "髋屈肌", hi: "हिप फ्लेक्सर", pl: "Zginacze bioder", ko: "고관절 굴곡근" },
  "inner thighs": { es: "Muslos internos", it: "Interno cosce", fr: "Intérieur des cuisses", tr: "İç uyluk", ru: "Внутренняя поверхность бедра", zh: "大腿内侧", hi: "भीतरी जांघ", pl: "Wewnętrzna część ud", ko: "허벅지 안쪽" },
  "latissimus dorsi": { es: "Dorsal ancho", it: "Gran dorsale", fr: "Grand dorsal", tr: "Latissimus dorsi", ru: "Широчайшая мышца спины", zh: "背阔肌", hi: "लैटिसिमस डॉर्सी", pl: "Najszerszy grzbietu", ko: "광배근" },
  "lower abs": { es: "Abdominales inferiores", it: "Addominali bassi", fr: "Bas des abdominaux", tr: "Alt karın", ru: "Нижний пресс", zh: "下腹肌", hi: "निचला पेट", pl: "Dolne partie brzucha", ko: "하복부" },
  "lower back": { es: "Espalda baja", it: "Zona lombare", fr: "Bas du dos", tr: "Alt sırt", ru: "Поясница", zh: "下背部", hi: "निचली पीठ", pl: "Dolna część pleców", ko: "허리(하부)" },
  obliques: { es: "Oblicuos", it: "Obliqui", fr: "Obliques", tr: "Oblikler", ru: "Косые мышцы", zh: "腹斜肌", hi: "तिरछी मांसपेशियाँ", pl: "Skośne brzucha", ko: "복사근" },
  quadriceps: { es: "Cuádriceps", it: "Quadricipiti", fr: "Quadriceps", tr: "Quadriceps", ru: "Квадрицепс", zh: "股四头肌", hi: "क्वाड्रिसेप्स", pl: "Czworogłowe", ko: "대퇴사두근" },
  "rear deltoids": { es: "Deltoides posteriores", it: "Deltoidi posteriori", fr: "Deltoïdes postérieurs", tr: "Arka deltoidler", ru: "Задние дельты", zh: "后三角肌", hi: "पिछला डेल्टॉइड", pl: "Tylne naramienne", ko: "후면 삼각근" },
  rhomboids: { es: "Romboides", it: "Romboidi", fr: "Rhomboïdes", tr: "Romboidler", ru: "Ромбовидные", zh: "菱形肌", hi: "रॉमबॉइड्स", pl: "Równoległoboczne", ko: "능형근" },
  "rotator cuff": { es: "Manguito rotador", it: "Cuffia dei rotatori", fr: "Coiffe des rotateurs", tr: "Rotator manşet", ru: "Вращательная манжета", zh: "肩袖", hi: "रोटेटर कफ", pl: "Stożek rotatorów", ko: "회전근개" },
  shins: { es: "Espinillas", it: "Stinchi", fr: "Tibias", tr: "İncikler", ru: "Передняя поверхность голени", zh: "胫部", hi: "पिंडली", pl: "Golenie", ko: "정강이" },
  soleus: { es: "Sóleo", it: "Soleo", fr: "Soléaire", tr: "Soleus", ru: "Камбаловидная мышца", zh: "比目鱼肌", hi: "सोलियस", pl: "Płaszczkowaty", ko: "가자미근" },
  sternocleidomastoid: { es: "Esternocleidomastoideo", it: "Sternocleidomastoideo", fr: "Sterno-cléido-mastoïdien", tr: "Sternokleidomastoid", ru: "Грудино-ключично-сосцевидная мышца", zh: "胸锁乳突肌", hi: "स्टर्नोक्लीडोमास्टॉइड", pl: "Mostkowo-obojczykowo-sutkowy", ko: "흉쇄유돌근" },
  trapezius: { es: "Trapecio", it: "Trapezio", fr: "Trapèze", tr: "Trapez", ru: "Трапеция", zh: "斜方肌", hi: "ट्रैपेज़ियस", pl: "Czworoboczny", ko: "승모근" },
  "upper chest": { es: "Pecho superior", it: "Petto alto", fr: "Haut des pectoraux", tr: "Üst göğüs", ru: "Верх груди", zh: "上胸部", hi: "ऊपरी छाती", pl: "Górna część klatki", ko: "상부 가슴" },
  "wrist extensors": { es: "Extensores de muñeca", it: "Estensori del polso", fr: "Extenseurs du poignet", tr: "Bilek ekstansörleri", ru: "Разгибатели запястья", zh: "腕伸肌", hi: "कलाई विस्तारक", pl: "Prostowniki nadgarstka", ko: "손목 신전근" },
  "wrist flexors": { es: "Flexores de muñeca", it: "Flessori del polso", fr: "Fléchisseurs du poignet", tr: "Bilek fleksörleri", ru: "Сгибатели запястья", zh: "腕屈肌", hi: "कलाई फ्लेक्सर", pl: "Zginacze nadgarstka", ko: "손목 굴곡근" },
  wrists: { es: "Muñecas", it: "Polsi", fr: "Poignets", tr: "Bilekler", ru: "Запястья", zh: "手腕", hi: "कलाई", pl: "Nadgarstki", ko: "손목" },
};

/** Title-case an English vocab value as the English fallback. */
function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Translate a dataset category value into the given language. */
export function tVocab(value: string, lang: Lang): string {
  if (lang === "en") return titleCase(value);
  return VOCAB[value]?.[lang] ?? titleCase(value);
}
