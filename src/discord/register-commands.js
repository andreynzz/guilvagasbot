async function registerCommands({ client, commands, guildId }) {
  const payload = [...commands.values()].map((command) => command.data.toJSON());

  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    await guild.commands.set(payload);
    console.log(`Comandos registrados no servidor ${guild.name} (${guild.id}).`);
    return;
  }

  await client.application.commands.set(payload);
  console.log("Comandos registrados globalmente.");
}

module.exports = {
  registerCommands,
};
