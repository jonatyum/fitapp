import type { GuideTopic } from "../routes";
import type { Lang } from "./languages";

/**
 * El contenido del recorrido, fuera de `ui/` por el mismo motivo que
 * `calculators.ts`: son textos con clave de dominio, no etiquetas de interfaz.
 *
 * Regla de redacción, y es la que impide que esto envejezca: **se describe qué
 * hace la función y para qué sirve, nunca dónde está el botón.** «Toca el
 * conmutador de arriba a la derecha» es deuda el día que se mueva.
 *
 * `Record<GuideTopic, …>` hace fallar el build si se añade un tema a
 * `routes.ts` y se olvida el texto; `Record<Lang, string>`, si falta un idioma.
 */
type Row = Record<Lang, string>;

interface Topic {
  name: Row;
  /** Una línea: se lee en el índice y bajo el título del paso. */
  lead: Row;
  /** Dos párrafos cortos. Caben en una pantalla de móvil sin scroll. */
  body: Row[];
}

export const GUIDE: Record<GuideTopic, Topic> = {
  today: {
    name: { es: "Hoy", en: "Today" },
    lead: {
      es: "La pantalla de inicio: qué te toca entrenar y cómo vas.",
      en: "Your home screen: what you are training today and how you are doing.",
    },
    body: [
      {
        es: "Hoy abre con el entrenamiento que te toca: qué día de tu plan es, qué músculos trabaja y cuántos ejercicios tiene. Desde ahí empiezas a entrenar de un toque.",
        en: "Today opens on the workout that is up next: which day of your plan it is, what it trains and how many exercises it has. From there you start training in one tap.",
      },
      {
        es: "Debajo van tus números de la semana: la racha, los entrenamientos que registraste y el peso total que moviste. Si todavía no tienes plan, Hoy te lleva a crearlo.",
        en: "Below that are your numbers for the week: your streak, the workouts you logged and the total load you moved. If you do not have a plan yet, Today takes you to build one.",
      },
    ],
  },
  plan: {
    name: { es: "Tu plan", en: "Your plan" },
    lead: {
      es: "Una semana de entrenamiento armada con lo que tienes a mano.",
      en: "A week of training built around what you actually have.",
    },
    body: [
      {
        es: "Nos dices dónde entrenas, qué buscas, cuántos días puedes y qué equipo tienes, y te armamos la semana completa: qué día toca qué, con cuántas series y repeticiones y cuánto descansar.",
        en: "You tell us where you train, what you are after, how many days you have and what kit you own, and we build the full week: what falls on which day, with how many sets and reps, and how long to rest.",
      },
      {
        es: "El orden no es casual: primero los ejercicios grandes, que piden fuerza y concentración, y al final el trabajo de aislamiento y de abdomen. Si algo no te encaja, se cambia.",
        en: "The order is not incidental: the big lifts come first, while you are fresh, and isolation and core work come last. If something does not fit you, it can be changed.",
      },
    ],
  },
  swap: {
    name: { es: "Cambiar un ejercicio", en: "Swapping an exercise" },
    lead: {
      es: "Si la máquina está ocupada o algo te molesta, cámbialo.",
      en: "If the machine is taken or something hurts, swap it.",
    },
    body: [
      {
        es: "Cualquier ejercicio de tu plan se puede cambiar por otro que trabaje el mismo músculo con un movimiento parecido. Te proponemos alternativas ordenadas por lo cerca que están, y primero las que puedes hacer con tu equipo.",
        en: "Any exercise in your plan can be swapped for another that trains the same muscle with a similar movement. We rank the alternatives by how close they are, and put the ones your kit allows first.",
      },
      {
        es: "No hay límite y no hace falta pagar: un plan que no se puede ajustar al gimnasio de tu barrio no sirve de nada.",
        en: "There is no limit and it is not a paid feature: a plan you cannot adjust to the gym down the street is no plan at all.",
      },
    ],
  },
  workout: {
    name: { es: "Entrenar y registrar", en: "Training and logging" },
    lead: {
      es: "Vas marcando cada serie mientras entrenas.",
      en: "You tick off each set as you train.",
    },
    body: [
      {
        es: "Al empezar el entrenamiento aparece la lista de series con su peso y sus repeticiones. Apuntas lo que hiciste de verdad y lo marcas: eso es todo lo que pide la app.",
        en: "When you start a workout you get the list of sets with their weight and reps. You note down what you actually did and tick it off: that is all the app asks of you.",
      },
      {
        es: "Registrar es lo que hace que todo lo demás funcione: de ahí salen tu racha, tu volumen semanal y tus récords. Sin eso, la app no sabe nada de ti.",
        en: "Logging is what makes everything else work: your streak, your weekly volume and your records all come from it. Without it, the app knows nothing about you.",
      },
    ],
  },
  streak: {
    name: { es: "La racha", en: "Your streak" },
    lead: {
      es: "Semanas seguidas entrenando. Es gratis y siempre lo será.",
      en: "Consecutive weeks of training. It is free, and it always will be.",
    },
    body: [
      {
        es: "La racha cuenta semanas, no días. Entrena al menos una vez en la semana y sigue viva: no se rompe porque un martes te surja algo, que es lo que pasa en la vida real.",
        en: "The streak counts weeks, not days. Train at least once in the week and it stays alive: it does not break because something came up on a Tuesday, which is what real life looks like.",
      },
      {
        es: "Es lo único que de verdad predice si vas a seguir entrenando en tres meses. Por eso está en la pantalla de inicio y por eso nunca va a costar dinero.",
        en: "It is the one thing that really predicts whether you will still be training in three months. That is why it sits on the home screen, and why it will never cost money.",
      },
    ],
  },
  progress: {
    name: { es: "Progreso", en: "Progress" },
    lead: {
      es: "Lo que has movido, y en qué ejercicios estás mejorando.",
      en: "What you have moved, and which lifts are improving.",
    },
    body: [
      {
        es: "Progreso reúne todo lo que registraste: cuántos entrenamientos llevas, el peso total que moviste por semana y tu mejor serie en cada ejercicio, con el máximo que podrías levantar una vez.",
        en: "Progress gathers everything you logged: how many workouts you have done, the total load you moved each week, and your best set in every exercise, with the most you could lift once.",
      },
      {
        es: "No hace falta apuntar nada aparte: sale solo de los entrenamientos que vas marcando. La racha y el resumen de la semana los tienes en Hoy sin pagar nada; esta vista completa es parte de Pro.",
        en: "There is nothing extra to write down: it comes straight out of the workouts you tick off. Your streak and the week's summary are on Today at no cost; this full view is part of Pro.",
      },
    ],
  },
  exercises: {
    name: { es: "Ejercicios", en: "Exercises" },
    lead: {
      es: "El catálogo completo, con la ficha de cada movimiento.",
      en: "The full catalogue, with a card for every movement.",
    },
    body: [
      {
        es: "Más de mil trescientos ejercicios, que se recorren buscando por nombre, filtrando por músculo y equipo, o tocando directamente el músculo en un mapa del cuerpo.",
        en: "Over thirteen hundred exercises, which you can search by name, filter by muscle and kit, or reach by tapping the muscle straight on a map of the body.",
      },
      {
        es: "Cada ficha trae la animación del movimiento, qué músculo entrena de verdad y los pasos de la técnica. Es gratis y está entero: sirve tanto para aprender un ejercicio como para buscar con qué cambiarlo.",
        en: "Each card carries the movement animation, the muscle it really trains and the technique steps. It is free and complete: use it to learn a lift, or to find something to replace it with.",
      },
    ],
  },
  calculators: {
    name: { es: "Calculadoras", en: "Calculators" },
    lead: {
      es: "Los números con los que se entrena, explicados.",
      en: "The numbers training runs on, explained.",
    },
    body: [
      {
        es: "Siete herramientas: IMC, gasto en reposo, calorías del día, grasa corporal, reparto de macros, repetición máxima y zonas de frecuencia cardiaca. Cada una explica qué es y qué significa cada dato que te pide.",
        en: "Seven tools: BMI, resting burn, daily calories, body fat, macro split, one-rep max and heart-rate zones. Each one explains what it is and what every figure it asks for means.",
      },
      {
        es: "Tus medidas se escriben una vez y las comparten todas. Se quedan en tu teléfono salvo que pidas guardarlas en tu cuenta, y dan estimaciones para orientarte: no sustituyen a un médico ni a un nutricionista.",
        en: "Your measurements are typed once and shared by all of them. They stay on your phone unless you ask us to save them to your account, and they give estimates to orient you: they do not replace a doctor or a dietitian.",
      },
    ],
  },
  pro: {
    name: { es: "Free y Pro", en: "Free and Pro" },
    lead: {
      es: "Qué tienes sin pagar y qué añade Pro.",
      en: "What you get without paying, and what Pro adds.",
    },
    body: [
      {
        es: "Sin pagar nada tienes el catálogo completo, tu plan de la semana, el registro de entrenamientos sin límite, la racha, el resumen semanal, las calculadoras y el cambio de ejercicios cuantas veces quieras. Eso no es una prueba: es la app.",
        en: "Without paying anything you get the full catalogue, your weekly plan, unlimited workout logging, your streak, the weekly summary, the calculators and as many exercise swaps as you like. That is not a trial: it is the app.",
      },
      {
        es: "Pro añade el panel de progreso completo —tu volumen semana a semana— y tus récords por ejercicio con el 1RM estimado. Cuando te haga falta lo encontrarás; y si algún día Pro se te vence, nada de lo que registraste se borra.",
        en: "Pro adds the full progress dashboard — your volume week by week — and your records per exercise with the estimated 1RM. You will find it when you need it, and if Pro ever lapses, nothing you logged is deleted.",
      },
    ],
  },
};
