const { SlashCommandBuilder } = require("discord.js");
const { t } = require("../i18n");
const { postJobsToChannel } = require("../services/jobs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("postjobs")
    .setNameLocalizations({
      "pt-BR": "postarvagas",
      "pt-PT": "publicarvagas",
      "es-ES": "publicarvacantes",
      "es-419": "publicarvacantes",
    })
    .setDescription("Fetch new jobs and post them in the current channel.")
    .setDescriptionLocalizations({
      "en-GB": "Fetch new jobs and post them in the current channel.",
      "pt-BR": "Busca vagas novas e publica no canal atual.",
      "pt-PT": "Procura novas vagas e publica-as no canal atual.",
      "es-ES": "Busca nuevas vacantes y las publica en el canal actual.",
      "es-419": "Busca nuevas vacantes y las publica en el canal actual.",
    }),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const sentCount = await postJobsToChannel(interaction.channel);

    if (sentCount === 0) {
      await interaction.editReply(t(interaction.locale, "noNewJobs"));
      return;
    }

    await interaction.editReply(t(interaction.locale, "postedJobs", { sentCount }));
  },
};
