const fs = require("node:fs");
const path = require("node:path");

const configPath = path.join(__dirname, "..", "config.json");

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error(
      "O arquivo config.json nao foi encontrado. Crie-o a partir de config.json.example."
    );
  }

  const raw = fs.readFileSync(configPath, "utf-8");
  const parsed = JSON.parse(raw);

  const requiredFields = ["discordToken", "channelId", "userId"];

  for (const field of requiredFields) {
    if (!parsed[field]) {
      throw new Error(`O campo ${field} em config.json e obrigatorio.`);
    }
  }

  const rawSearchTerms = Array.isArray(parsed.vagasSearchTerms)
    ? parsed.vagasSearchTerms
    : [parsed.vagasSearchTerm || "supermercado"];

  const vagasSearchTerms = rawSearchTerms
    .map((term) => String(term || "").trim())
    .filter(Boolean);

  if (vagasSearchTerms.length === 0) {
    throw new Error("config.json precisa ter vagasSearchTerm ou vagasSearchTerms.");
  }

  const rawKeywords = Array.isArray(parsed.relatedKeywords)
    ? parsed.relatedKeywords
    : ["faca", "facas", "cutelaria", "supermercado", "mercado", "varejo"];

  const relatedKeywords = rawKeywords
    .map((keyword) => String(keyword || "").trim().toLowerCase())
    .filter(Boolean);

  if (relatedKeywords.length === 0) {
    throw new Error("relatedKeywords precisa ter pelo menos uma palavra-chave.");
  }

  const config = {
    discordToken: parsed.discordToken,
    channelId: parsed.channelId,
    userId: parsed.userId,
    guildId: parsed.guildId ? String(parsed.guildId).trim() : null,
    vagasSearchTerms,
    relatedKeywords,
    postIntervalMinutes: Number(parsed.postIntervalMinutes || 60),
    maxJobsPerRun: Number(parsed.maxJobsPerRun || 3),
  };

  if (Number.isNaN(config.postIntervalMinutes) || config.postIntervalMinutes <= 0) {
    throw new Error("postIntervalMinutes precisa ser um numero maior que zero.");
  }

  if (Number.isNaN(config.maxJobsPerRun) || config.maxJobsPerRun <= 0) {
    throw new Error("maxJobsPerRun precisa ser um numero maior que zero.");
  }

  return config;
}

module.exports = loadConfig();
