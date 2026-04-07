const config = require("../config");

function formatJobsMessage(items, options = {}) {
  const targetUserId = options.targetUserId || config.userId;
  const mention = `<@${targetUserId}>`;
  const links = items
    .map((item) => item.link || "Link nao informado")
    .join("\n");

  return [
    `@everyone ${mention} está trabalhando???`,
    "**NÃO**, MAS TEM VAGA NOVA!!!",
    "",
    "RECEBA A VAGA:",
    "",
    links,
  ].join("\n");
}

module.exports = {
  formatJobsMessage,
};
