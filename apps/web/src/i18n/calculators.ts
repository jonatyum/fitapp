import type { CalculatorId } from "../routes";
import type { ActivityId, BmiBand, FatBand, GoalId, ZoneId } from "../calculators/formulas";
import type { Lang } from "./languages";

/**
 * El contenido explicativo de las calculadoras, fuera de `ui/` por el mismo
 * motivo que `plan.ts` y `vocab.ts`: no son etiquetas de interfaz, son textos
 * con clave de dominio. Y sobre todo, «peso» se explica una sola vez aunque lo
 * pidan cinco calculadoras; con una unión plana de claves habría que duplicar
 * el párrafo o inventar nombres compartidos a mano.
 *
 * `Record<Lang, string>` sigue haciendo fallar el build si falta un idioma, y
 * `Record<CalculatorId, …>` lo hace fallar si una calculadora se queda sin
 * texto: es más estricto que la unión, no menos.
 */
type Row = Record<Lang, string>;

export type FieldId =
  | "sex"
  | "age"
  | "height"
  | "weight"
  | "activity"
  | "goal"
  | "neck"
  | "waist"
  | "hip"
  | "restingHr"
  | "reps"
  | "load"
  | "kcal";

interface Field {
  label: Row;
  unit?: Row;
  /** Una línea, siempre visible bajo el campo. */
  help: Row;
  /** Lo que abre el diálogo de ayuda. Sólo donde una línea no basta. */
  long?: Row;
}

export const FIELD: Record<FieldId, Field> = {
  sex: {
    label: { es: "Sexo", en: "Sex" },
    help: {
      es: "Las fórmulas se ajustaron por separado para hombres y mujeres.",
      en: "The formulas were fitted separately for men and women.",
    },
    long: {
      es: "A igual peso y estatura, el cuerpo reparte la grasa y la masa muscular de forma distinta según el sexo biológico, y por eso las fórmulas llevan constantes diferentes. La pregunta es por fisiología, no por identidad. Si ninguna de las dos opciones te representa, elige la que más se parezca a tu cuerpo y toma el resultado como una referencia aproximada.",
      en: "At the same weight and height, fat and muscle are distributed differently by biological sex, which is why the formulas carry different constants. The question is about physiology, not identity. If neither option describes you, pick the closer one and read the result as a rough reference.",
    },
  },
  age: {
    label: { es: "Edad", en: "Age" },
    unit: { es: "años", en: "years" },
    help: {
      es: "El gasto en reposo baja con los años, y la fórmula lo descuenta.",
      en: "Resting expenditure drops with age, and the formula discounts it.",
    },
  },
  height: {
    label: { es: "Altura", en: "Height" },
    unit: { es: "cm", en: "cm" },
    help: {
      es: "En centímetros: 165, no 1,65.",
      en: "In centimetres: 165, not 1.65.",
    },
  },
  weight: {
    label: { es: "Peso", en: "Weight" },
    unit: { es: "kg", en: "kg" },
    help: {
      es: "Tu peso actual. Mídete por la mañana, en ayunas y siempre igual.",
      en: "Your current weight. Weigh yourself in the morning, fasted, always the same way.",
    },
  },
  activity: {
    label: { es: "Nivel de actividad", en: "Activity level" },
    help: {
      es: "Cuánto te mueves en total, no sólo lo que entrenas.",
      en: "How much you move in total, not just your training.",
    },
    long: {
      es: "Cuenta el día entero: el trabajo, los desplazamientos, las escaleras y el entrenamiento. Alguien que entrena cuatro días pero pasa el resto sentado en una oficina está en «moderado», no en «alto». Ante la duda, elige el nivel de abajo: pasarse por arriba es el error que hace que el número no cuadre con la báscula.",
      en: "Count the whole day: work, commuting, stairs and training. Someone who trains four days but spends the rest sitting at a desk is \"moderate\", not \"high\". When in doubt pick the level below: overshooting is the mistake that makes the number disagree with the scale.",
    },
  },
  goal: {
    label: { es: "Objetivo", en: "Goal" },
    help: {
      es: "Sobre las calorías de mantenimiento.",
      en: "Relative to your maintenance calories.",
    },
  },
  neck: {
    label: { es: "Cuello", en: "Neck" },
    unit: { es: "cm", en: "cm" },
    help: {
      es: "Contorno justo por debajo de la nuez.",
      en: "Circumference just below the Adam's apple.",
    },
    long: {
      es: "De pie, hombros relajados y mirando al frente. Pasa la cinta alrededor del cuello justo por debajo de la nuez, algo inclinada hacia abajo por delante. No aprietes ni hinches el cuello: la cinta tiene que apoyarse en la piel sin marcarla.",
      en: "Stand with relaxed shoulders, looking ahead. Run the tape around the neck just below the Adam's apple, sloping slightly downward at the front. Do not pull tight or flex: the tape should rest on the skin without denting it.",
    },
  },
  waist: {
    label: { es: "Cintura", en: "Waist" },
    unit: { es: "cm", en: "cm" },
    help: {
      es: "En hombres, a la altura del ombligo; en mujeres, por la parte más estrecha.",
      en: "At navel height for men; at the narrowest point for women.",
    },
    long: {
      es: "De pie, con la cinta horizontal y bien apoyada. Mide al final de una espiración normal, sin meter barriga y sin hinchar el pecho. En hombres se toma a la altura del ombligo; en mujeres, por la parte más estrecha del tronco, que suele quedar algo más arriba.",
      en: "Stand with the tape horizontal and flat against the skin. Measure at the end of a normal breath out, without sucking in or puffing up. For men, take it at navel height; for women, at the narrowest part of the torso, usually a little higher.",
    },
  },
  hip: {
    label: { es: "Cadera", en: "Hip" },
    unit: { es: "cm", en: "cm" },
    help: {
      es: "Por la parte más ancha de los glúteos.",
      en: "Around the widest part of the buttocks.",
    },
    long: {
      es: "De pie y con los pies juntos, rodea la cadera por la parte más ancha de los glúteos, con la cinta horizontal. Sólo entra en la fórmula femenina, porque ahí se acumula grasa que la medida del abdomen no recoge; sin este dato el resultado saldría bajo.",
      en: "Stand with your feet together and run the tape around the widest part of the buttocks, keeping it horizontal. It only enters the female formula, because fat stored there is not captured by the waist reading; without it the result would come out low.",
    },
  },
  restingHr: {
    label: { es: "Frecuencia en reposo", en: "Resting heart rate" },
    unit: { es: "lpm", en: "bpm" },
    help: {
      es: "Opcional. Si la sabes, las zonas salen mucho más finas.",
      en: "Optional. If you know it, the zones come out far sharper.",
    },
    long: {
      es: "Tómate el pulso nada más despertar, antes de levantarte: cuenta los latidos durante un minuto entero, o durante quince segundos y multiplica por cuatro. Repítelo tres mañanas y quédate con el promedio. Con este dato las zonas se calculan con el método de Karvonen, que parte de tu reposo en vez de un porcentaje de la máxima, y por eso recoge tu forma física y tu aclimatación a la altura.",
      en: "Take your pulse as soon as you wake, before getting up: count the beats for a full minute, or for fifteen seconds and multiply by four. Repeat it three mornings and take the average. With this figure the zones use the Karvonen method, which starts from your resting rate rather than a percentage of your maximum, and so accounts for your fitness and your altitude acclimatisation.",
    },
  },
  reps: {
    label: { es: "Repeticiones", en: "Reps" },
    help: {
      es: "Las que completaste con buena técnica, sin ayuda.",
      en: "The ones you completed with good form, unassisted.",
    },
    long: {
      es: "Cuenta sólo las repeticiones limpias de una serie que llevaste cerca del fallo. Si te quedaban tres en el tanque, la estimación saldrá baja. Y por encima de diez repeticiones la fórmula se degrada: entra la resistencia, no sólo la fuerza, y el número deja de ser fiable.",
      en: "Count only the clean reps of a set you took close to failure. If you had three left in the tank, the estimate will come out low. And above ten reps the formula degrades: endurance enters the picture, not just strength, and the number stops being reliable.",
    },
  },
  load: {
    label: { es: "Peso levantado", en: "Weight lifted" },
    unit: { es: "kg", en: "kg" },
    help: {
      es: "El peso total de la barra, discos incluidos.",
      en: "The total weight of the bar, plates included.",
    },
  },
  kcal: {
    label: { es: "Calorías diarias", en: "Daily calories" },
    unit: { es: "kcal", en: "kcal" },
    help: {
      es: "Las de tu objetivo. Sácalas del TDEE si no las tienes.",
      en: "The ones for your goal. Get them from TDEE if you do not have them.",
    },
  },
};

export const FAT_BAND: Record<FatBand, { name: Row; advice: Row }> = {
  essential: {
    name: { es: "Grasa esencial", en: "Essential fat" },
    advice: {
      es: "Por debajo de lo que el cuerpo necesita para funcionar bien.",
      en: "Below what the body needs to work properly.",
    },
  },
  athlete: {
    name: { es: "Atleta", en: "Athlete" },
    advice: {
      es: "Propio de quien compite. Cuesta sostenerlo todo el año.",
      en: "Typical of someone competing. Hard to hold year round.",
    },
  },
  fit: {
    name: { es: "En forma", en: "Fit" },
    advice: {
      es: "Rango habitual de quien entrena de forma regular.",
      en: "The usual range for someone training regularly.",
    },
  },
  average: {
    name: { es: "Promedio", en: "Average" },
    advice: {
      es: "Dentro de lo corriente. Entrenar fuerza mueve este número mejor que el cardio.",
      en: "Unremarkable. Strength training moves this number better than cardio does.",
    },
  },
  high: {
    name: { es: "Por encima del promedio", en: "Above average" },
    advice: {
      es: "Vale la pena plantear el cambio con un profesional y con calma.",
      en: "Worth planning the change with a professional, and without rushing.",
    },
  },
};

export const ZONE: Record<ZoneId, { name: Row; purpose: Row }> = {
  z1: {
    name: { es: "Z1 · Muy suave", en: "Z1 · Very easy" },
    purpose: {
      es: "Calentamiento y recuperación entre sesiones duras.",
      en: "Warm-up and recovery between hard sessions.",
    },
  },
  z2: {
    name: { es: "Z2 · Suave", en: "Z2 · Easy" },
    purpose: {
      es: "Base aeróbica. Deberías poder hablar sin cortarte.",
      en: "Aerobic base. You should be able to talk without breaking up.",
    },
  },
  z3: {
    name: { es: "Z3 · Moderada", en: "Z3 · Moderate" },
    purpose: {
      es: "Ritmo sostenido. Cómodo-incómodo.",
      en: "Steady pace. Comfortably uncomfortable.",
    },
  },
  z4: {
    name: { es: "Z4 · Dura", en: "Z4 · Hard" },
    purpose: {
      es: "Umbral. Frases cortas y poco más.",
      en: "Threshold. Short sentences and little else.",
    },
  },
  z5: {
    name: { es: "Z5 · Máxima", en: "Z5 · Maximum" },
    purpose: {
      es: "Series cortas. No se sostiene más de unos minutos.",
      en: "Short intervals. Not sustainable beyond a few minutes.",
    },
  },
};

export const MACRO: Record<"protein" | "fat" | "carb", Row> = {
  protein: { es: "Proteína", en: "Protein" },
  fat: { es: "Grasa", en: "Fat" },
  carb: { es: "Carbohidratos", en: "Carbs" },
};

export const SEX: Record<"female" | "male", Row> = {
  female: { es: "Mujer", en: "Female" },
  male: { es: "Hombre", en: "Male" },
};

export const ACTIVITY: Record<ActivityId, { name: Row; detail: Row }> = {
  sedentary: {
    name: { es: "Sedentario", en: "Sedentary" },
    detail: {
      es: "Trabajo sentado y poco movimiento fuera de él.",
      en: "Desk work and little movement outside it.",
    },
  },
  light: {
    name: { es: "Ligero", en: "Light" },
    detail: {
      es: "Entrenas 1 a 3 días por semana.",
      en: "You train 1 to 3 days a week.",
    },
  },
  moderate: {
    name: { es: "Moderado", en: "Moderate" },
    detail: {
      es: "Entrenas 3 a 5 días por semana.",
      en: "You train 3 to 5 days a week.",
    },
  },
  high: {
    name: { es: "Alto", en: "High" },
    detail: {
      es: "Entrenas 6 o 7 días por semana.",
      en: "You train 6 or 7 days a week.",
    },
  },
  veryHigh: {
    name: { es: "Muy alto", en: "Very high" },
    detail: {
      es: "Trabajo físico además de entrenar a diario.",
      en: "Physical work on top of training every day.",
    },
  },
};

export const GOAL: Record<GoalId, { name: Row; detail: Row }> = {
  lose: {
    name: { es: "Perder grasa", en: "Lose fat" },
    detail: { es: "20 % por debajo del mantenimiento.", en: "20% below maintenance." },
  },
  maintain: {
    name: { es: "Mantener", en: "Maintain" },
    detail: { es: "Ni subes ni bajas de peso.", en: "Neither gaining nor losing." },
  },
  gain: {
    name: { es: "Ganar músculo", en: "Gain muscle" },
    detail: { es: "10 % por encima del mantenimiento.", en: "10% above maintenance." },
  },
};

export const BMI_BAND: Record<BmiBand, { name: Row; advice: Row }> = {
  under: {
    name: { es: "Por debajo del rango", en: "Below the range" },
    advice: {
      es: "Comer más y entrenar fuerza suele ser mejor punto de partida que hacer más cardio.",
      en: "Eating more and training for strength is usually a better starting point than more cardio.",
    },
  },
  normal: {
    name: { es: "Dentro del rango", en: "Within the range" },
    advice: {
      es: "El peso no es el dato que te va a mover ahora. Mira la fuerza y la composición.",
      en: "Weight is not the number that will move you now. Look at strength and composition.",
    },
  },
  over: {
    name: { es: "Por encima del rango", en: "Above the range" },
    advice: {
      es: "Si entrenas fuerza, buena parte de ese peso puede ser músculo: el IMC no los distingue.",
      en: "If you train for strength, much of that weight may be muscle: BMI cannot tell them apart.",
    },
  },
  obese: {
    name: { es: "Muy por encima del rango", en: "Well above the range" },
    advice: {
      es: "Vale la pena comentarlo con un profesional de salud antes de plantear un plan agresivo.",
      en: "Worth raising with a health professional before committing to an aggressive plan.",
    },
  },
};

interface Calculator {
  name: Row;
  lead: Row;
  /** Qué es, en el desplegable plegado. */
  what: Row;
  /** El descargo específico, pegado al resultado. */
  note: Row;
}

export const CALC: Record<CalculatorId, Calculator> = {
  bmi: {
    name: { es: "IMC", en: "BMI" },
    lead: {
      es: "Tu peso en relación con tu altura, y qué rango le corresponde.",
      en: "Your weight relative to your height, and the range that goes with it.",
    },
    what: {
      es: "El índice de masa corporal divide tu peso entre el cuadrado de tu altura. Nació para comparar poblaciones enteras, no personas, y por eso su límite es conocido: no sabe distinguir un kilo de músculo de un kilo de grasa. Alguien que levanta pesas puede salir «por encima del rango» con poca grasa encima, y alguien sedentario puede salir dentro con bastante. Sirve como primer vistazo y como punto de partida de otras cuentas, no como retrato de tu salud.",
      en: "Body mass index divides your weight by the square of your height. It was built to compare whole populations rather than individuals, which is why its limit is well known: it cannot tell a kilo of muscle from a kilo of fat. Someone who lifts can land \"above the range\" carrying little fat, and someone sedentary can land inside it carrying plenty. Read it as a first glance and a starting point for other numbers, not as a portrait of your health.",
    },
    note: {
      es: "El IMC no distingue músculo de grasa. Es un punto de partida, no un diagnóstico.",
      en: "BMI cannot tell muscle from fat. It is a starting point, not a diagnosis.",
    },
  },
  bmr: {
    name: { es: "TMB", en: "BMR" },
    lead: {
      es: "Las calorías que gastas en reposo absoluto, sin moverte.",
      en: "The calories you burn at complete rest, without moving.",
    },
    what: {
      es: "La tasa metabólica basal es lo que tu cuerpo gasta sólo por seguir vivo: respirar, bombear sangre, mantener la temperatura, reparar tejidos. Es la mayor parte de tu gasto diario, incluso si entrenas. Aquí se estima con la fórmula de Mifflin-St Jeor, que es la que menos se equivoca sin pedir datos de laboratorio; la clásica de Harris-Benedict se ajustó en 1919 y tiende a dar de más. Nunca comas por debajo de esta cifra: es el suelo, no el objetivo.",
      en: "Basal metabolic rate is what your body spends simply staying alive: breathing, pumping blood, holding temperature, repairing tissue. It is the largest share of your daily expenditure, even if you train. This uses the Mifflin-St Jeor equation, the one that errs least without lab data; the classic Harris-Benedict was fitted in 1919 and tends to run high. Never eat below this figure: it is the floor, not the target.",
    },
    note: {
      es: "Es una estimación estadística: dos personas iguales en la báscula pueden gastar distinto.",
      en: "It is a statistical estimate: two people alike on the scale can burn different amounts.",
    },
  },
  tdee: {
    name: { es: "TDEE", en: "TDEE" },
    lead: {
      es: "Lo que gastas en un día completo, y cuánto comer según tu objetivo.",
      en: "What you burn in a full day, and how much to eat for your goal.",
    },
    what: {
      es: "El gasto energético diario total es tu TMB multiplicada por lo que te mueves: el trabajo, los desplazamientos, el entrenamiento y hasta la digestión. Es la cifra que de verdad decide si subes o bajas de peso, porque comer por encima engorda y comer por debajo adelgaza, con independencia de qué comas. Tómala como punto de partida y corrígela con la báscula: si en dos semanas no se mueve nada, el número real es otro.\n\nVivir en altura sube algo el gasto las primeras semanas. Si acabas de llegar a La Paz, es normal gastar un poco más y tener menos hambre. Ninguna fórmula de esta pantalla lo corrige, porque no hay un ajuste fiable.",
      en: "Total daily energy expenditure is your BMR multiplied by how much you move: work, commuting, training, even digestion. It is the number that actually decides whether you gain or lose, because eating above it adds weight and eating below it takes weight off, whatever the food. Treat it as a starting point and correct it with the scale: if nothing moves in two weeks, your real number is a different one.\n\nLiving at altitude raises expenditure somewhat for the first few weeks. If you have just arrived in La Paz, burning a little more and feeling less hungry is normal. No formula on this screen corrects for it, because there is no reliable adjustment.",
    },
    note: {
      es: "El déficit más agresivo que ofrecemos es del 20 %, y nunca por debajo del suelo calórico.",
      en: "The most aggressive deficit we offer is 20%, and never below the calorie floor.",
    },
  },
  bodyfat: {
    name: { es: "Grasa corporal", en: "Body fat" },
    lead: {
      es: "Qué parte de tu peso es grasa, con una cinta métrica y tres medidas.",
      en: "How much of your weight is fat, from three tape-measure readings.",
    },
    what: {
      es: "El porcentaje de grasa corporal dice qué parte de tu peso es grasa y qué parte es todo lo demás: músculo, hueso, agua y órganos. Explica lo que el IMC no puede, porque dos personas del mismo peso y la misma altura pueden tener una el doble de grasa que la otra.\n\nAquí se estima con el método de la Marina de Estados Unidos, que usa tres contornos medidos con cinta. Es una estimación, no una medición: puede desviarse unos tres o cuatro puntos frente a un laboratorio. Sirve para seguir tu propio cambio midiéndote siempre igual, a la misma hora y con la misma cinta, no para compararte con nadie.",
      en: "Body-fat percentage tells you how much of your weight is fat and how much is everything else: muscle, bone, water and organs. It explains what BMI cannot, because two people of the same weight and height can differ twofold in fat.\n\nThis uses the US Navy method, which reads three tape measurements. It is an estimate, not a measurement: it can be off by three or four points against a lab. Use it to follow your own change, measuring the same way every time, at the same hour and with the same tape — not to compare yourself with anyone.",
    },
    note: {
      es: "Puede desviarse 3 o 4 puntos. Úsalo para ver hacia dónde vas, no para ponerte una etiqueta. No se usa en el embarazo.",
      en: "It can be off by 3 or 4 points. Use it to see where you are heading, not as a label. Not for use in pregnancy.",
    },
  },
  macros: {
    name: { es: "Macros", en: "Macros" },
    lead: {
      es: "Cómo repartir tus calorías entre proteína, grasa y carbohidratos.",
      en: "How to split your calories between protein, fat and carbs.",
    },
    what: {
      es: "Las calorías deciden si subes o bajas de peso; los macronutrientes deciden de qué está hecho ese cambio. Con suficiente proteína, lo que pierdes es grasa y no músculo, y lo que ganas es músculo y no sólo grasa.\n\nEl reparto parte de 1,8 g de proteína por kilo de peso, dentro del rango útil de 1,6 a 2,2; por encima el beneficio se aplana. La grasa sale de 0,9 g por kilo con un suelo del 20 % de las calorías, porque bajar de ahí compromete la parte hormonal. Lo que queda son carbohidratos, que es lo que alimenta el entrenamiento. Si tienes bastante sobrepeso, calcula la proteína sobre el peso al que quieres llegar, no sobre el actual.",
      en: "Calories decide whether you gain or lose; macronutrients decide what that change is made of. With enough protein, what you lose is fat rather than muscle, and what you gain is muscle rather than only fat.\n\nThe split starts from 1.8 g of protein per kilo, inside the useful range of 1.6 to 2.2; above that the benefit flattens out. Fat comes from 0.9 g per kilo with a floor of 20% of calories, because going below that compromises hormonal health. What remains is carbohydrate, which is what fuels training. If you carry significant excess weight, work the protein off your target weight rather than your current one.",
    },
    note: {
      es: "Un reparto de partida, no una receta. Ajusta con lo que veas en semanas, no en días.",
      en: "A starting split, not a prescription. Adjust on what you see over weeks, not days.",
    },
  },
  onerm: {
    name: { es: "1RM", en: "1RM" },
    lead: {
      es: "Cuánto podrías levantar una sola vez, a partir de una serie que ya hiciste.",
      en: "What you could lift once, from a set you have already done.",
    },
    what: {
      es: "La repetición máxima es el peso que podrías mover una sola vez con buena técnica. Es la referencia con la que se programa la fuerza: casi todos los porcentajes de un plan se cuentan sobre ella.\n\nNo hace falta intentarlo de verdad, que es arriesgado y agota. Se estima desde una serie normal con la fórmula de Epley, la misma que usa el panel de Progreso de la app para tus récords, así que los dos números siempre coinciden. Funciona bien hasta unas diez repeticiones; por encima entra la resistencia y la estimación se va.",
      en: "Your one-rep max is the weight you could move once with good form. It is the reference strength training is programmed against: nearly every percentage in a plan is counted off it.\n\nYou do not need to actually attempt it, which is risky and draining. It is estimated from an ordinary set with the Epley formula — the same one the app's Progress panel uses for your records, so the two numbers always agree. It holds up to about ten reps; above that endurance takes over and the estimate drifts.",
    },
    note: {
      es: "Es una estimación desde una serie. El peso real del día depende del descanso, el sueño y la técnica.",
      en: "It is an estimate from one set. What you actually lift on the day depends on rest, sleep and form.",
    },
  },
  heartrate: {
    name: { es: "Frecuencia cardiaca", en: "Heart rate" },
    lead: {
      es: "Tu máxima estimada y las cinco zonas en las que se entrena.",
      en: "Your estimated maximum and the five zones you train in.",
    },
    what: {
      es: "La frecuencia cardiaca máxima es el techo de latidos por minuto que alcanza tu corazón, y las zonas son tramos de ese techo: cada una entrena una cosa distinta. Aquí se estima con la fórmula de Tanaka (208 menos 0,7 por tu edad), y no con la clásica de 220 menos la edad, que arrastra un error de diez a doce latidos y se queda corta en personas mayores.\n\nVivir a 3.600 metros no baja tu máxima de forma que merezca corregirse —el error de cualquier fórmula por edad es mayor que el efecto—, pero sí sube tu frecuencia para un mismo esfuerzo si no estás aclimatado: en La Paz puedes estar en zona 3 haciendo lo que a nivel del mar sería zona 2. Por eso vale la pena darnos tu frecuencia en reposo, que ya recoge tu aclimatación, o gobernarte por el esfuerzo que sientes.",
      en: "Maximum heart rate is the ceiling of beats per minute your heart reaches, and the zones are slices of that ceiling: each one trains something different. This uses the Tanaka formula (208 minus 0.7 times your age) rather than the classic 220 minus age, which carries an error of ten to twelve beats and runs short for older people.\n\nLiving at 3,600 m does not lower your maximum by enough to be worth correcting — the error in any age-based formula is larger than the effect — but it does raise your rate for the same effort while you are not acclimatised: in La Paz you can be in zone 3 doing what would be zone 2 at sea level. That is why it is worth giving us your resting heart rate, which already reflects your acclimatisation, or going by how hard it feels.",
    },
    note: {
      es: "Una fórmula por edad se equivoca en unos 10 latidos. Si algo te sienta mal, manda lo que sientes, no la pulsera.",
      en: "An age-based formula is off by about 10 beats. If something feels wrong, trust how you feel over the watch.",
    },
  },
};

export const tField = (id: FieldId, lang: Lang) => FIELD[id].label[lang];
export const tCalc = (id: CalculatorId, lang: Lang) => CALC[id].name[lang];
export const tCalcLead = (id: CalculatorId, lang: Lang) => CALC[id].lead[lang];
