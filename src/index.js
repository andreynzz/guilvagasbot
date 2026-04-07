const fs = require("node:fs");
const path = require("node:path");
const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./config");
const { t } = require("./i18n");
const { postJobsToChannel } = require("./services/jobs");

const commandsPath = path.join(__dirname, "commands");

function loadCommands() {
  const commands = new Map();
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    if (!command.data || !command.data.name || typeof command.execute !== "function") {
      console.warn(`Comando ignorado por estar incompleto: ${file}`);
      continue;
    }

    commands.set(command.data.name, command);
  }

  return commands;
}

const commands = loadCommands();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

let isPosting = false;

async function registerCommands() {
  const payload = [...commands.values()].map((command) => command.data.toJSON());

  if (config.guildId) {
    const guild = await client.guilds.fetch(config.guildId);
    await guild.commands.set(payload);
    console.log(`Comandos registrados no servidor ${guild.name} (${guild.id}).`);
    return;
  }

  await client.application.commands.set(payload);
  console.log("Comandos registrados globalmente.");
}

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

    const sentCount = await postJobsToChannel(channel);

    if (sentCount === 0) {
      console.log("Nenhuma vaga nova encontrada neste ciclo.");
      return;
    }

    console.log(`${sentCount} vaga(s) enviada(s) com sucesso.`);
  } catch (error) {
    console.error("Erro ao buscar ou enviar vagas:", error);
  } finally {
    isPosting = false;
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commands.get(interaction.commandName.toLowerCase());

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction, { client, commands, config });
  } catch (error) {
    console.error(`Erro ao executar o comando ${interaction.commandName}:`, error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(t(interaction.locale, "commandFailed"));
      return;
    }

    await interaction.reply({
      content: t(interaction.locale, "commandFailed"),
      ephemeral: true,
    });
  }
});

client.once("ready", async () => {
  console.log(`Bot conectado como ${client.user.tag}.`);
  await registerCommands();
  console.log(`Comandos carregados: ${[...commands.keys()].join(", ") || "nenhum"}.`);
  await postJobs();

  const intervalMs = config.postIntervalMinutes * 60 * 1000;
  setInterval(() => {
    postJobs();
  }, intervalMs);
});

client.login(config.discordToken);
