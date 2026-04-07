const { t } = require("../i18n");

function registerInteractionHandler({ client, commands, config }) {
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
}

module.exports = {
  registerInteractionHandler,
};
