const { SlashCommandBuilder } = require("discord.js");
const { resolveLocale, t } = require("../i18n");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setNameLocalizations({
      "pt-BR": "ajuda",
      "pt-PT": "ajuda",
      "es-ES": "ayuda",
      "es-419": "ayuda",
    })
    .setDescription("Show the available commands.")
    .setDescriptionLocalizations({
      "en-GB": "Show the available commands.",
      "pt-BR": "Mostra os comandos disponiveis.",
      "pt-PT": "Mostra os comandos disponiveis.",
      "es-ES": "Muestra los comandos disponibles.",
      "es-419": "Muestra los comandos disponibles.",
    }),
  async execute(interaction, context) {
    const locale = resolveLocale(interaction.locale);
    const commandsList = [...context.commands.values()]
      .map((command) => {
        const commandJson = command.data.toJSON();
        const localizedName = commandJson.name_localizations?.[locale] || commandJson.name;
        const localizedDescription =
          commandJson.description_localizations?.[locale] || commandJson.description;

        return `/${localizedName} - ${localizedDescription}`;
      })
      .join("\n");

    await interaction.reply({
      content: t(interaction.locale, "commandsAvailable", { commandsList }),
      ephemeral: true,
    });
  },
};
