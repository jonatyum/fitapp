import { useEffect } from "react";
import { GUIDE } from "../i18n/guide";
import { useI18n } from "../i18n/I18nContext";
import { markGuideSeen } from "../guide";
import { navigate, usePath } from "../router";
import { GUIDE_TOPICS, guidePath, guideTopicOf } from "../routes";
import { GuideStep } from "./GuideStep";
import { Icon } from "./ui/Icon";

export function GuideView() {
  const { t, lang } = useI18n();
  const open = guideTopicOf(usePath());

  // Abrirla cuenta como verla: quien ya llegó aquí no necesita que se lo
  // vuelvan a ofrecer en Hoy.
  useEffect(markGuideSeen, []);

  if (open) return <GuideStep id={open} />;

  return (
    <div className="guide">
      <h1>{t("guideTitle")}</h1>
      <p className="guide-lead">{t("guideLead")}</p>

      <button
        className="btn primary lg block"
        onClick={() => navigate(guidePath(GUIDE_TOPICS[0]))}
      >
        {t("guideStart")}
      </button>

      <ul className="guide-grid">
        {GUIDE_TOPICS.map((id, i) => (
          <li key={id}>
            <button className="card interactive guide-card" onClick={() => navigate(guidePath(id))}>
              <span className="guide-card-num t-num">{i + 1}</span>
              <strong>{GUIDE[id].name[lang]}</strong>
              <small>{GUIDE[id].lead[lang]}</small>
              <Icon name="chevron-right" size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
