const { SlashCommandBuilder } = require("discord.js");
const { replyEphemeral } = require("../discord/interaction-response");
const { resolveLocale, t } = require("../i18n");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setNameLocalizations({
      "pt-BR": "ajuda",
      "es-ES": "ayuda",
      "es-419": "ayuda",
    })
    .setDescription("Show the available commands.")
    .setDescriptionLocalizations({
      "en-GB": "Show the available commands.",
      "pt-BR": "Mostra os comandos disponiveis.",
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

    await replyEphemeral(
      interaction,
      t(interaction.locale, "commandsAvailable", { commandsList })
    );
  },
};
