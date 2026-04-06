const fs = require("node:fs");
const path = require("node:path");
const Parser = require("rss-parser");
const { Client, GatewayIntentBits } = require("discord.js");

const parser = new Parser();

const dataDir = path.join(__dirname, "..", "data");
const seenJobsPath = path.join(dataDir, "seen-jobs.json");
const configPath = path.join(__dirname, "..", "config.json");

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error(
      "O arquivo config.json nao foi encontrado. Crie-o a partir de config.json.example."
    );
  }

  const raw = fs.readFileSync(configPath, "utf-8");
  const parsed = JSON.parse(raw);

  const requiredFields = ["discordToken", "channelId", "userId", "jobsFeedUrl"];

  for (const field of requiredFields) {
    if (!parsed[field]) {
      throw new Error(`O campo ${field} em config.json e obrigatorio.`);
    }
  }

  const config = {
    discordToken: parsed.discordToken,
    channelId: parsed.channelId,
    userId: parsed.userId,
    jobsFeedUrl: parsed.jobsFeedUrl,
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

const config = loadConfig();

function ensureDataFile() {
  fs.mkdirSync(dataDir, { recursive: true });

  if (!fs.existsSync(seenJobsPath)) {
    fs.writeFileSync(seenJobsPath, JSON.stringify([], null, 2));
  }
}

function loadSeenJobs() {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(seenJobsPath, "utf-8");
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.warn("Nao foi possivel ler o historico de vagas. Um novo arquivo sera criado.");
    fs.writeFileSync(seenJobsPath, JSON.stringify([], null, 2));
    return new Set();
  }
}

function saveSeenJobs(seenJobs) {
  fs.writeFileSync(seenJobsPath, JSON.stringify([...seenJobs], null, 2));
}

function pickJobId(item) {
  return (
    item.guid ||
    item.id ||
    item.link ||
    `${item.title || "sem-titulo"}-${item.pubDate || item.isoDate || Date.now()}`
  );
}

function formatJobMessage(item) {
  const mention = `<@${config.userId}>`;
  const title = item.title || "Nova vaga";
  const company = item.creator || item.author || "Empresa nao informada";
  const link = item.link || "Link nao informado";
  const publishedAt = item.isoDate || item.pubDate;

  const publishedLabel = publishedAt
    ? new Date(publishedAt).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "Data nao informada";

  return [
    `${mention} achei uma vaga nova para voce!`,
    `**${title}**`,
    `Empresa: ${company}`,
    `Publicada em: ${publishedLabel}`,
    `Link: ${link}`,
  ].join("\n");
}

async function fetchNewJobs(seenJobs) {
  const feed = await parser.parseURL(config.jobsFeedUrl);
  const items = Array.isArray(feed.items) ? feed.items : [];

  const unseenJobs = items
    .filter((item) => !seenJobs.has(pickJobId(item)))
    .slice(0, config.maxJobsPerRun);

  return unseenJobs;
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

let isPosting = false;

async function postJobs() {
  if (isPosting) {
    return;
  }

  isPosting = true;

  try {
    const channel = await client.channels.fetch(config.channelId);

    if (!channel || !channel.isTextBased()) {
      throw new Error("O canal configurado nao foi encontrado ou nao aceita mensagens.");
    }

    const seenJobs = loadSeenJobs();
    const newJobs = await fetchNewJobs(seenJobs);

    if (newJobs.length === 0) {
      console.log("Nenhuma vaga nova encontrada neste ciclo.");
      return;
    }

    for (const job of newJobs) {
      await channel.send(formatJobMessage(job));
      seenJobs.add(pickJobId(job));
    }

    saveSeenJobs(seenJobs);
    console.log(`${newJobs.length} vaga(s) enviada(s) com sucesso.`);
  } catch (error) {
    console.error("Erro ao buscar ou enviar vagas:", error);
  } finally {
    isPosting = false;
  }
}

client.once("ready", async () => {
  console.log(`Bot conectado como ${client.user.tag}.`);
  await postJobs();

  const intervalMs = config.postIntervalMinutes * 60 * 1000;
  setInterval(() => {
    postJobs();
  }, intervalMs);
});

client.login(config.discordToken);
