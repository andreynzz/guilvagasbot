const {
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require("discord.js");
const { replyEphemeral } = require("../discord/interaction-response");
const { t } = require("../i18n");
const { clearSeenJobs } = require("../services/job-store");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearhistory")
    .setNameLocalizations({
      "pt-BR": "limparhistorico",
      "es-ES": "limpiarhistorial",
      "es-419": "limpiarhistorial",
    })
    .setDescription("Admin only: clear the history of sent jobs.")
    .setDescriptionLocalizations({
      "en-GB": "Admin only: clear the history of sent jobs.",
      "pt-BR": "Apenas admin: limpa o historico de vagas enviadas.",
      "es-ES": "Solo admin: limpia el historial de vacantes enviadas.",
      "es-419": "Solo admin: limpia el historial de vacantes enviadas.",
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    clearSeenJobs();

    await replyEphemeral(interaction, t(interaction.locale, "historyCleared"));
  },
};
