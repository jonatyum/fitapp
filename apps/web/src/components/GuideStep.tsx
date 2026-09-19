import { useEffect, useRef } from "react";
import { GUIDE } from "../i18n/guide";
import { useI18n } from "../i18n/I18nContext";
import { useAuth } from "../auth/AuthContext";
import { navigate } from "../router";
import { GUIDE_TOPICS, PATHS, guidePath, type GuideTopic, type View } from "../routes";
import { Icon, type IconName } from "./ui/Icon";

/** Reutilizados de la navegación real: si una pestaña cambia de icono, la guía cambia sola. */
const ICONS: Record<GuideTopic, IconName> = {
  today: "home",
  plan: "calendar",
  swap: "swap",
  workout: "play",
  streak: "flame",
  progress: "chart",
  exercises: "grid",
  calculators: "calculator",
  pro: "sparkle",
};

/**
 * Probar la función bate a leer sobre ella. Los temas que no están aquí no
 * tienen adónde llevar, y los que exigen cuenta se callan sin sesión: tocar
 * «Probarlo» para aterrizar en un candado o en otra pantalla es la peor forma
 * posible de enseñar.
 */
const TRY: Partial<Record<GuideTopic, { view: View; needsAuth?: boolean }>> = {
  today: { view: "today" },
  plan: { view: "wizard" },
  exercises: { view: "exercises" },
  progress: { view: "progress", needsAuth: true },
  calculators: { view: "calculators", needsAuth: true },
  pro: { view: "billing" },
};

export function GuideStep({ id }: { id: GuideTopic }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const heading = useRef<HTMLHeadingElement>(null);

  const topic = GUIDE[id];
  const index = GUIDE_TOPICS.indexOf(id);
  const previous = GUIDE_TOPICS[index - 1];
  const next = GUIDE_TOPICS[index + 1];
  const destination = TRY[id];

  // Cambiar de paso cambia de ruta, y el router no anuncia nada: llevar el
  // foco al título es lo que hace que el lector lea el paso nuevo en vez de
  // quedarse en un botón «Siguiente» que ya no es el mismo. De paso sube el
  // scroll, que el router tampoco restaura.
  useEffect(() => {
    heading.current?.focus();
  }, [id]);

  return (
    <div className="guide">
      <div className="guide-head">
        <button className="btn ghost" onClick={() => navigate(PATHS.guide)}>
          <Icon name="chevron-left" size={18} />
          {t("back")}
        </button>
        <p className="guide-progress t-num">
          {t("guideStepOf", { n: String(index + 1), total: String(GUIDE_TOPICS.length) })}
        </p>
      </div>

      <span className="badge soft guide-topic">
        <Icon name={ICONS[id]} size={14} />
        {topic.name[lang]}
      </span>

      <h1 ref={heading} tabIndex={-1}>
        {topic.name[lang]}
      </h1>
      <p className="guide-lead">{topic.lead[lang]}</p>

      <div className="guide-body">
        {topic.body.map((paragraph, i) => (
          <p key={i}>{paragraph[lang]}</p>
        ))}
      </div>

      {destination && (!destination.needsAuth || user) && (
        <button
          className="btn secondary block"
          onClick={() => navigate(PATHS[destination.view])}
        >
          {t("guideTryIt")}
        </button>
      )}

      <div className="guide-nav">
        {previous && (
          <button className="btn ghost lg" onClick={() => navigate(guidePath(previous))}>
            {t("guidePrev")}
          </button>
        )}
        <button
          className="btn primary lg"
          onClick={() => navigate(next ? guidePath(next) : PATHS.today)}
        >
          {next ? t("guideNext") : t("guideFinish")}
        </button>
      </div>
    </div>
  );
}
