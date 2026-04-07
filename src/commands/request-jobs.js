const {
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require("discord.js");
const { t } = require("../i18n");
const { postJobsToChannel } = require("../services/jobs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("requestjobs")
    .setNameLocalizations({
      "pt-BR": "solicitarvagas",
      "es-ES": "solicitarvacantes",
      "es-419": "solicitarvacantes",
    })
    .setDescription("Admin only: post jobs mentioning a selected person.")
    .setDescriptionLocalizations({
      "en-GB": "Admin only: post jobs mentioning a selected person.",
      "pt-BR": "Apenas admin: publica vagas marcando a pessoa selecionada.",
      "es-ES": "Solo admin: publica vacantes mencionando a la persona seleccionada.",
      "es-419": "Solo admin: publica vacantes mencionando a la persona seleccionada.",
    })
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          "pt-BR": "usuario",
          "es-ES": "usuario",
          "es-419": "usuario",
        })
        .setDescription("The person who should be mentioned in the job post.")
        .setDescriptionLocalizations({
          "en-GB": "The person who should be mentioned in the job post.",
          "pt-BR": "A pessoa que deve ser marcada na mensagem de vagas.",
          "es-ES": "La persona que debe ser mencionada en el mensaje de vacantes.",
          "es-419": "La persona que debe ser mencionada en el mensaje de vacantes.",
        })
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const selectedUser = interaction.options.getUser("user", true);
    const sentCount = await postJobsToChannel(interaction.channel, {
      targetUserId: selectedUser.id,
    });

    if (sentCount === 0) {
      await interaction.editReply(t(interaction.locale, "noNewJobs"));
      return;
    }

    await interaction.editReply(
      t(interaction.locale, "postedJobsForUser", {
        sentCount,
        userMention: `<@${selectedUser.id}>`,
      })
    );
  },
};
