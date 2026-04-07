const fs = require("node:fs");
const path = require("node:path");

const configPath = path.join(__dirname, "..", "config.json");

function parseList(value, fallback) {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildConfigFromEnv() {
  const requiredVars = ["DISCORD_TOKEN", "CHANNEL_ID", "USER_ID"];
  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required Render env vars: ${missingVars.join(", ")}`);
  }

  return {
    discordToken: process.env.DISCORD_TOKEN,
    guildId: process.env.GUILD_ID || undefined,
    channelId: process.env.CHANNEL_ID,
    userId: process.env.USER_ID,
    vagasSearchTerms: parseList(process.env.VAGAS_SEARCH_TERMS, ["facas", "supermercado"]),
    relatedKeywords: parseList(process.env.RELATED_KEYWORDS, [
      "faca",
      "facas",
      "cutelaria",
      "supermercado",
      "mercado",
      "varejo",
    ]),
    maxJobsPerRun: Number(process.env.MAX_JOBS_PER_RUN || 3),
  };
}

const config = buildConfigFromEnv();
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

require("../src/index.js");
