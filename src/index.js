const config = require("./config");
const { loadCommands } = require("./commands/load-commands");
const { createDiscordClient } = require("./discord/create-client");
const { registerCommands } = require("./discord/register-commands");
const { registerInteractionHandler } = require("./discord/interaction-handler");
const { createJobPoster } = require("./services/job-poster");

const commands = loadCommands();
const client = createDiscordClient();
const jobPoster = createJobPoster(client);

registerInteractionHandler({ client, commands, config });

client.once("ready", async () => {
  console.log(`Bot conectado como ${client.user.tag}.`);
  await registerCommands({ client, commands, guildId: config.guildId });
  console.log(`Comandos carregados: ${[...commands.keys()].join(", ") || "nenhum"}.`);
  await jobPoster.postJobs();
  jobPoster.startSchedule();
});

client.login(config.discordToken);
