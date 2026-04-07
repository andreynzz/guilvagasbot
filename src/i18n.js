const DEFAULT_LOCALE = "en-US";

const DISCORD_FALLBACK_LOCALES = {
  "en-US": "en-GB",
  "en-GB": "en-US",
  "pt-PT": "pt-BR",
  "es-419": "es-ES",
};

const messages = {
  "en-US": {
    commandsAvailable: "Available commands:\n{commandsList}",
    noNewJobs: "I couldn't find any new jobs related to knives or supermarkets.",
    postedJobs: "I posted {sentCount} new job(s) in this channel.",
    commandFailed: "I couldn't run that command right now.",
  },
  "en-GB": {
    commandsAvailable: "Available commands:\n{commandsList}",
    noNewJobs: "I couldn't find any new jobs related to knives or supermarkets.",
    postedJobs: "I posted {sentCount} new job(s) in this channel.",
    commandFailed: "I couldn't run that command right now.",
  },
  "pt-BR": {
    commandsAvailable: "Comandos disponiveis:\n{commandsList}",
    noNewJobs: "Nao encontrei vagas novas relacionadas a facas ou supermercado.",
    postedJobs: "Publiquei {sentCount} vaga(s) nova(s) neste canal.",
    commandFailed: "Nao consegui executar esse comando agora.",
  },
  "es-ES": {
    commandsAvailable: "Comandos disponibles:\n{commandsList}",
    noNewJobs: "No encontre nuevas vacantes relacionadas con cuchillos o supermercados.",
    postedJobs: "Publique {sentCount} vacante(s) nueva(s) en este canal.",
    commandFailed: "No pude ejecutar ese comando ahora mismo.",
  },
  "es-419": {
    commandsAvailable: "Comandos disponibles:\n{commandsList}",
    noNewJobs: "No encontre nuevas vacantes relacionadas con cuchillos o supermercados.",
    postedJobs: "Publique {sentCount} vacante(s) nueva(s) en este canal.",
    commandFailed: "No pude ejecutar ese comando ahora mismo.",
  },
};

function resolveLocale(locale) {
  if (locale && messages[locale]) {
    return locale;
  }

  const fallbackLocale = DISCORD_FALLBACK_LOCALES[locale];

  if (fallbackLocale && messages[fallbackLocale]) {
    return fallbackLocale;
  }

  const baseLocale = locale?.split("-")[0];
  const matchingLocale = Object.keys(messages).find((item) => item.split("-")[0] === baseLocale);

  return matchingLocale || DEFAULT_LOCALE;
}

function t(locale, key, variables = {}) {
  const resolvedLocale = resolveLocale(locale);
  const template = messages[resolvedLocale]?.[key] || messages[DEFAULT_LOCALE][key] || key;

  return Object.entries(variables).reduce(
    (text, [variable, value]) => text.replaceAll(`{${variable}}`, String(value)),
    template
  );
}

module.exports = {
  DEFAULT_LOCALE,
  resolveLocale,
  t,
};
