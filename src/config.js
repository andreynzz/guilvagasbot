require("dotenv").config();

function parseList(value, fallback) {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadConfig() {
  const requiredEnvVars = ["DISCORD_TOKEN", "CHANNEL_ID", "USER_ID"];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`A variavel de ambiente ${envVar} e obrigatoria.`);
    }
  }

  const vagasSearchTerms = parseList(process.env.VAGAS_SEARCH_TERMS, ["facas", "supermercado"]);

  if (vagasSearchTerms.length === 0) {
    throw new Error("VAGAS_SEARCH_TERMS precisa ter pelo menos um termo.");
  }

  const relatedKeywords = parseList(process.env.RELATED_KEYWORDS, [
    "faca",
    "facas",
    "cutelaria",
    "supermercado",
    "mercado",
    "varejo",
  ]).map((keyword) => keyword.toLowerCase());

  if (relatedKeywords.length === 0) {
    throw new Error("RELATED_KEYWORDS precisa ter pelo menos uma palavra-chave.");
  }

  const config = {
    discordToken: process.env.DISCORD_TOKEN,
    channelId: process.env.CHANNEL_ID,
    userId: process.env.USER_ID,
    guildId: process.env.GUILD_ID ? String(process.env.GUILD_ID).trim() : null,
    vagasSearchTerms,
    relatedKeywords,
    maxJobsPerRun: Number(process.env.MAX_JOBS_PER_RUN || 3),
  };

  if (Number.isNaN(config.maxJobsPerRun) || config.maxJobsPerRun <= 0) {
    throw new Error("maxJobsPerRun precisa ser um numero maior que zero.");
  }

  return config;
}

module.exports = loadConfig();
