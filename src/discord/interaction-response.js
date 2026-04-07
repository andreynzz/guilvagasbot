const { MessageFlags } = require("discord.js");

function isUnknownInteractionError(error) {
  return error?.code === 10062;
}

async function deferEphemeralReply(interaction) {
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    return true;
  } catch (error) {
    if (isUnknownInteractionError(error)) {
      console.warn(`Interacao expirou antes do deferReply para /${interaction.commandName}.`);
      return false;
    }

    throw error;
  }
}

async function replyEphemeral(interaction, content) {
  try {
    await interaction.reply({
      content,
      flags: MessageFlags.Ephemeral,
    });
    return true;
  } catch (error) {
    if (isUnknownInteractionError(error)) {
      console.warn(`Interacao expirou antes do reply para /${interaction.commandName}.`);
      return false;
    }

    throw error;
  }
}

module.exports = {
  deferEphemeralReply,
  isUnknownInteractionError,
  replyEphemeral,
};
