import type { Lang } from "./languages";

// Translations for the finite category vocabulary used across the dataset
// (body parts, target muscles, equipment). Keyed by the English value as
// stored in exercises.json. English falls through to a title-cased key, so we
// only store the Spanish translation here.
//
// Best-effort translations — easy to refine term by term.
type Row = Partial<Record<Exclude<Lang, "en">, string>>;

export const VOCAB: Record<string, Row> = {
  // ── Body parts ──────────────────────────────────────────
  back: { es: "Espalda" },
  cardio: { es: "Cardio" },
  chest: { es: "Pecho" },
  "lower arms": { es: "Antebrazos" },
  "lower legs": { es: "Pantorrillas" },
  neck: { es: "Cuello" },
  shoulders: { es: "Hombros" },
  "upper arms": { es: "Brazos" },
  "upper legs": { es: "Muslos" },
  waist: { es: "Cintura" },

  // ── Target muscles ──────────────────────────────────────
  abductors: { es: "Abductores" },
  abs: { es: "Abdominales" },
  adductors: { es: "Aductores" },
  biceps: { es: "Bíceps" },
  calves: { es: "Pantorrillas" },
  "cardiovascular system": { es: "Sistema cardiovascular" },
  delts: { es: "Deltoides" },
  forearms: { es: "Antebrazos" },
  glutes: { es: "Glúteos" },
  hamstrings: { es: "Isquiotibiales" },
  lats: { es: "Dorsales" },
  "levator scapulae": { es: "Elevador de la escápula" },
  pectorals: { es: "Pectorales" },
  quads: { es: "Cuádriceps" },
  "serratus anterior": { es: "Serrato anterior" },
  spine: { es: "Columna" },
  traps: { es: "Trapecios" },
  triceps: { es: "Tríceps" },
  "upper back": { es: "Espalda alta" },

  // ── Equipment ───────────────────────────────────────────
  assisted: { es: "Asistido" },
  band: { es: "Banda" },
  barbell: { es: "Barra" },
  "body weight": { es: "Peso corporal" },
  "bosu ball": { es: "Bosu" },
  cable: { es: "Polea" },
  dumbbell: { es: "Mancuerna" },
  "elliptical machine": { es: "Elíptica" },
  "ez barbell": { es: "Barra EZ" },
  hammer: { es: "Martillo" },
  kettlebell: { es: "Pesa rusa" },
  "leverage machine": { es: "Máquina de palanca" },
  "medicine ball": { es: "Balón medicinal" },
  "olympic barbell": { es: "Barra olímpica" },
  "resistance band": { es: "Banda de resistencia" },
  roller: { es: "Rodillo" },
  rope: { es: "Cuerda" },
  "skierg machine": { es: "Máquina SkiErg" },
  "sled machine": { es: "Trineo" },
  "smith machine": { es: "Máquina Smith" },
  "stability ball": { es: "Fitball" },
  "stationary bike": { es: "Bicicleta estática" },
  "stepmill machine": { es: "Escaladora" },
  tire: { es: "Neumático" },
  "trap bar": { es: "Barra trap" },
  "upper body ergometer": { es: "Ergómetro de brazos" },
  weighted: { es: "Con peso" },
  "wheel roller": { es: "Rueda abdominal" },

  // ── Secondary muscles (beyond the target list) ──────────
  abdominals: { es: "Abdominales" },
  "ankle stabilizers": { es: "Estabilizadores del tobillo" },
  ankles: { es: "Tobillos" },
  brachialis: { es: "Braquial" },
  core: { es: "Core" },
  deltoids: { es: "Deltoides" },
  feet: { es: "Pies" },
  "grip muscles": { es: "Músculos de agarre" },
  groin: { es: "Ingle" },
  hands: { es: "Manos" },
  "hip flexors": { es: "Flexores de cadera" },
  "inner thighs": { es: "Muslos internos" },
  "latissimus dorsi": { es: "Dorsal ancho" },
  "lower abs": { es: "Abdominales inferiores" },
  "lower back": { es: "Espalda baja" },
  obliques: { es: "Oblicuos" },
  quadriceps: { es: "Cuádriceps" },
  "rear deltoids": { es: "Deltoides posteriores" },
  rhomboids: { es: "Romboides" },
  "rotator cuff": { es: "Manguito rotador" },
  shins: { es: "Espinillas" },
  soleus: { es: "Sóleo" },
  sternocleidomastoid: { es: "Esternocleidomastoideo" },
  trapezius: { es: "Trapecio" },
  "upper chest": { es: "Pecho superior" },
  "wrist extensors": { es: "Extensores de muñeca" },
  "wrist flexors": { es: "Flexores de muñeca" },
  wrists: { es: "Muñecas" },
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
