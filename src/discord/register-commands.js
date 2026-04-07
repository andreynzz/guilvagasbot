async function registerCommands({ client, commands, guildId }) {
  const payload = [...commands.values()].map((command) => command.data.toJSON());

  if (guildId) {
    try {
      const guild = await client.guilds.fetch(guildId);
      await guild.commands.set(payload);
      console.log(`Comandos registrados no servidor ${guild.name} (${guild.id}).`);
      return;
    } catch (error) {
      if (error?.code === 10004) {
        console.warn(
          `guildId ${guildId} nao foi encontrado ou o bot nao tem acesso. Registrando comandos globalmente.`
        );
      } else {
        throw error;
      }
    }
  }

  await client.application.commands.set(payload);
  console.log("Comandos registrados globalmente.");
}

module.exports = {
  registerCommands,
};
