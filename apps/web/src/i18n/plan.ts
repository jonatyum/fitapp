import type { Lang } from "./languages";

// Vocabulary specific to the routine planner: goals, levels and day labels.
// Same shape as vocab.ts — English is the key, so only the other 9 languages
// are stored, with a per-key English fallback string.

type Row = Record<Lang, string>;

export type Goal = "strength" | "hypertrophy" | "endurance" | "fatloss";
export type Level = "beginner" | "intermediate" | "advanced";

export const GOALS: Goal[] = ["strength", "hypertrophy", "endurance", "fatloss"];
export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

export const GOAL_NAME: Record<Goal, Row> = {
  strength: {
    en: "Strength", es: "Fuerza", it: "Forza", fr: "Force", tr: "Kuvvet",
    ru: "Сила", zh: "力量", hi: "ताकत", pl: "Siła", ko: "근력",
  },
  hypertrophy: {
    en: "Muscle mass", es: "Masa muscular", it: "Massa muscolare", fr: "Masse musculaire", tr: "Kas kütlesi",
    ru: "Мышечная масса", zh: "增肌", hi: "मांसपेशी द्रव्यमान", pl: "Masa mięśniowa", ko: "근육량",
  },
  endurance: {
    en: "Endurance", es: "Resistencia", it: "Resistenza", fr: "Endurance", tr: "Dayanıklılık",
    ru: "Выносливость", zh: "耐力", hi: "सहनशक्ति", pl: "Wytrzymałość", ko: "지구력",
  },
  fatloss: {
    en: "Fat loss", es: "Pérdida de grasa", it: "Perdita di grasso", fr: "Perte de graisse", tr: "Yağ kaybı",
    ru: "Снижение жира", zh: "减脂", hi: "वसा घटाना", pl: "Redukcja tkanki tłuszczowej", ko: "체지방 감량",
  },
};

export const GOAL_DESC: Record<Goal, Row> = {
  strength: {
    en: "Heavy loads, 4–6 reps, long rests", es: "Cargas altas, 4–6 reps, descansos largos",
    it: "Carichi alti, 4–6 rip, recuperi lunghi", fr: "Charges lourdes, 4–6 reps, repos longs",
    tr: "Ağır yük, 4–6 tekrar, uzun dinlenme", ru: "Большие веса, 4–6 повторов, долгий отдых",
    zh: "大重量，4–6 次，长间歇", hi: "भारी वजन, 4–6 दोहराव, लंबा विश्राम",
    pl: "Duże ciężary, 4–6 powtórzeń, długie przerwy", ko: "고중량, 4–6회, 긴 휴식",
  },
  hypertrophy: {
    en: "Moderate loads, 8–12 reps", es: "Cargas moderadas, 8–12 reps",
    it: "Carichi moderati, 8–12 rip", fr: "Charges modérées, 8–12 reps",
    tr: "Orta yük, 8–12 tekrar", ru: "Средние веса, 8–12 повторов",
    zh: "中等重量，8–12 次", hi: "मध्यम वजन, 8–12 दोहराव",
    pl: "Umiarkowane ciężary, 8–12 powtórzeń", ko: "중량 중간, 8–12회",
  },
  endurance: {
    en: "Light loads, 15–20 reps, short rests", es: "Cargas ligeras, 15–20 reps, descansos cortos",
    it: "Carichi leggeri, 15–20 rip, recuperi brevi", fr: "Charges légères, 15–20 reps, repos courts",
    tr: "Hafif yük, 15–20 tekrar, kısa dinlenme", ru: "Малые веса, 15–20 повторов, короткий отдых",
    zh: "轻重量，15–20 次，短间歇", hi: "हल्का वजन, 15–20 दोहराव, छोटा विश्राम",
    pl: "Lekkie ciężary, 15–20 powtórzeń, krótkie przerwy", ko: "저중량, 15–20회, 짧은 휴식",
  },
  fatloss: {
    en: "High volume plus cardio finisher", es: "Volumen alto más remate de cardio",
    it: "Volume alto più finale cardio", fr: "Volume élevé plus finisher cardio",
    tr: "Yüksek hacim ve kardiyo bitirici", ru: "Большой объём плюс кардио в конце",
    zh: "高训练量加有氧收尾", hi: "अधिक वॉल्यूम और कार्डियो फिनिशर",
    pl: "Duża objętość plus cardio na koniec", ko: "높은 볼륨과 마무리 유산소",
  },
};

export const LEVEL_NAME: Record<Level, Row> = {
  beginner: {
    en: "Beginner", es: "Principiante", it: "Principiante", fr: "Débutant", tr: "Başlangıç",
    ru: "Начинающий", zh: "初学者", hi: "शुरुआती", pl: "Początkujący", ko: "초급",
  },
  intermediate: {
    en: "Intermediate", es: "Intermedio", it: "Intermedio", fr: "Intermédiaire", tr: "Orta",
    ru: "Средний", zh: "中级", hi: "मध्यम", pl: "Średnio zaawansowany", ko: "중급",
  },
  advanced: {
    en: "Advanced", es: "Avanzado", it: "Avanzato", fr: "Avancé", tr: "İleri",
    ru: "Продвинутый", zh: "高级", hi: "उन्नत", pl: "Zaawansowany", ko: "고급",
  },
};

export const LEVEL_DESC: Record<Level, Row> = {
  beginner: {
    en: "Less than a year training · 5 exercises per day",
    es: "Menos de un año entrenando · 5 ejercicios por día",
    it: "Meno di un anno di allenamento · 5 esercizi al giorno",
    fr: "Moins d'un an d'entraînement · 5 exercices par jour",
    tr: "Bir yıldan az antrenman · günde 5 egzersiz",
    ru: "Меньше года тренировок · 5 упражнений в день",
    zh: "训练不足一年 · 每天 5 个动作",
    hi: "एक साल से कम प्रशिक्षण · प्रतिदिन 5 व्यायाम",
    pl: "Mniej niż rok treningu · 5 ćwiczeń dziennie",
    ko: "운동 경력 1년 미만 · 하루 5개 운동",
  },
  intermediate: {
    en: "One to three years · 6 exercises per day",
    es: "De uno a tres años · 6 ejercicios por día",
    it: "Da uno a tre anni · 6 esercizi al giorno",
    fr: "Un à trois ans · 6 exercices par jour",
    tr: "Bir ile üç yıl · günde 6 egzersiz",
    ru: "От года до трёх · 6 упражнений в день",
    zh: "一到三年 · 每天 6 个动作",
    hi: "एक से तीन साल · प्रतिदिन 6 व्यायाम",
    pl: "Od roku do trzech lat · 6 ćwiczeń dziennie",
    ko: "1~3년 · 하루 6개 운동",
  },
  advanced: {
    en: "Over three years · 8 exercises per day",
    es: "Más de tres años · 8 ejercicios por día",
    it: "Oltre tre anni · 8 esercizi al giorno",
    fr: "Plus de trois ans · 8 exercices par jour",
    tr: "Üç yıldan fazla · günde 8 egzersiz",
    ru: "Больше трёх лет · 8 упражнений в день",
    zh: "三年以上 · 每天 8 个动作",
    hi: "तीन साल से अधिक · प्रतिदिन 8 व्यायाम",
    pl: "Ponad trzy lata · 8 ćwiczeń dziennie",
    ko: "3년 이상 · 하루 8개 운동",
  },
};

/** Day template labels produced by the generator. */
export const DAY_LABEL: Record<string, Row> = {
  "fullbody-a": {
    en: "Full body A", es: "Cuerpo completo A", it: "Total body A", fr: "Corps entier A", tr: "Tüm vücut A",
    ru: "Всё тело A", zh: "全身 A", hi: "पूरा शरीर A", pl: "Całe ciało A", ko: "전신 A",
  },
  "fullbody-b": {
    en: "Full body B", es: "Cuerpo completo B", it: "Total body B", fr: "Corps entier B", tr: "Tüm vücut B",
    ru: "Всё тело B", zh: "全身 B", hi: "पूरा शरीर B", pl: "Całe ciało B", ko: "전신 B",
  },
  "fullbody-c": {
    en: "Full body C", es: "Cuerpo completo C", it: "Total body C", fr: "Corps entier C", tr: "Tüm vücut C",
    ru: "Всё тело C", zh: "全身 C", hi: "पूरा शरीर C", pl: "Całe ciało C", ko: "전신 C",
  },
  push: {
    en: "Push", es: "Empuje", it: "Spinta", fr: "Poussée", tr: "İtiş",
    ru: "Жим", zh: "推", hi: "पुश", pl: "Push", ko: "푸시",
  },
  pull: {
    en: "Pull", es: "Tirón", it: "Trazione", fr: "Tirage", tr: "Çekiş",
    ru: "Тяга", zh: "拉", hi: "पुल", pl: "Pull", ko: "풀",
  },
  legs: {
    en: "Legs", es: "Pierna", it: "Gambe", fr: "Jambes", tr: "Bacak",
    ru: "Ноги", zh: "腿部", hi: "पैर", pl: "Nogi", ko: "하체",
  },
  upper: {
    en: "Upper body", es: "Tren superior", it: "Parte superiore", fr: "Haut du corps", tr: "Üst vücut",
    ru: "Верх тела", zh: "上半身", hi: "ऊपरी शरीर", pl: "Góra ciała", ko: "상체",
  },
  lower: {
    en: "Lower body", es: "Tren inferior", it: "Parte inferiore", fr: "Bas du corps", tr: "Alt vücut",
    ru: "Низ тела", zh: "下半身", hi: "निचला शरीर", pl: "Dół ciała", ko: "하체",
  },
};

/** Split names, shown as a subtitle on the routine header. */
export const SPLIT_NAME: Record<string, Row> = {
  fullbody: {
    en: "Full body", es: "Cuerpo completo", it: "Total body", fr: "Corps entier", tr: "Tüm vücut",
    ru: "Всё тело", zh: "全身", hi: "पूरा शरीर", pl: "Całe ciało", ko: "전신",
  },
  upperlower: {
    en: "Upper / Lower", es: "Torso / Pierna", it: "Upper / Lower", fr: "Haut / Bas", tr: "Üst / Alt",
    ru: "Верх / Низ", zh: "上下分化", hi: "ऊपर / नीचे", pl: "Góra / Dół", ko: "상하체 분할",
  },
  ppl: {
    en: "Push / Pull / Legs", es: "Empuje / Tirón / Pierna", it: "Spinta / Trazione / Gambe",
    fr: "Poussée / Tirage / Jambes", tr: "İtiş / Çekiş / Bacak", ru: "Жим / Тяга / Ноги",
    zh: "推 / 拉 / 腿", hi: "पुश / पुल / लेग्स", pl: "Push / Pull / Legs", ko: "푸시 / 풀 / 레그",
  },
  "ppl-ul": {
    en: "Push / Pull / Legs + Upper / Lower", es: "Empuje / Tirón / Pierna + Torso / Pierna",
    it: "Spinta / Trazione / Gambe + Upper / Lower", fr: "Poussée / Tirage / Jambes + Haut / Bas",
    tr: "İtiş / Çekiş / Bacak + Üst / Alt", ru: "Жим / Тяга / Ноги + Верх / Низ",
    zh: "推 / 拉 / 腿 + 上 / 下", hi: "पुश / पुल / लेग्स + ऊपर / नीचे",
    pl: "Push / Pull / Legs + Góra / Dół", ko: "푸시 / 풀 / 레그 + 상 / 하체",
  },
};

const pick = (table: Record<string, Row>, key: string, lang: Lang) =>
  table[key]?.[lang] ?? table[key]?.en ?? key;

export const tGoal = (g: string, lang: Lang) => pick(GOAL_NAME as Record<string, Row>, g, lang);
export const tGoalDesc = (g: string, lang: Lang) => pick(GOAL_DESC as Record<string, Row>, g, lang);
export const tLevel = (l: string, lang: Lang) => pick(LEVEL_NAME as Record<string, Row>, l, lang);
export const tLevelDesc = (l: string, lang: Lang) => pick(LEVEL_DESC as Record<string, Row>, l, lang);
export const tDayLabel = (l: string, lang: Lang) => pick(DAY_LABEL, l, lang);
export const tSplit = (s: string, lang: Lang) => pick(SPLIT_NAME, s, lang);
