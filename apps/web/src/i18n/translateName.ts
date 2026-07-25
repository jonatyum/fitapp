import type { Lang } from "./languages";
import { VOCAB } from "./vocab";
import { NAME_TOKENS } from "./nameTokens";

// Languages that don't separate words with spaces.
const NO_SPACE = new Set<Lang>(["zh"]);

type NonEn = Exclude<Lang, "en">;

/** Look up a single lowercase token, with a naive plural fallback. */
function lookup(token: string, lang: NonEn): string | null {
  const t = token.toLowerCase();
  if (NAME_TOKENS[t]?.[lang]) return NAME_TOKENS[t]![lang]!;
  if (VOCAB[t]?.[lang]) return VOCAB[t]![lang]!;
  if (NAME_TOKENS[t]?.[lang] === "") return ""; // explicit drop
  if (t.endsWith("s")) {
    const sing = t.slice(0, -1);
    if (NAME_TOKENS[sing]?.[lang]) return NAME_TOKENS[sing]![lang]!;
    if (VOCAB[sing]?.[lang]) return VOCAB[sing]![lang]!;
  }
  return null;
}

/** Translate the alphanumeric core of a token (handles hyphenated compounds). */
function translateCore(core: string, lang: NonEn): string {
  const whole = lookup(core, lang);
  if (whole !== null) return whole;
  if (core.includes("-")) {
    return core
      .split("-")
      .map((p) => lookup(p, lang) ?? p)
      .filter(Boolean)
      .join(NO_SPACE.has(lang) ? "" : "-");
  }
  return core; // fallback: keep English
}

const TOKEN_RE = /^([^\p{L}\p{N}]*)([\p{L}\p{N}][\p{L}\p{N}'/-]*)?([^\p{L}\p{N}]*)$/u;

/**
 * Compose a translated exercise name from a per-word token dictionary.
 * Word-by-word gloss: unknown/proper tokens (e.g. "arnold") stay in English,
 * surrounding punctuation like "(kneeling)" is preserved. Grammar is
 * approximate by design — this is an offline, dictionary-based translation.
 */
export function translateName(name: string, lang: Lang): string {
  if (lang === "en") return name;
  const l = lang as NonEn;

  const out = name
    .split(/\s+/)
    .map((word): string => {
      const m = word.match(TOKEN_RE);
      if (!m || !m[2]) return word; // no alphanumeric core (pure punctuation)
      const [, pre, core, post] = m;
      const translated = translateCore(core, l);
      if (translated === "") return (pre + post).trim(); // dropped word
      return pre + translated + post;
    })
    .filter(Boolean);

  const joined = out.join(NO_SPACE.has(lang) ? "" : " ");
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}
