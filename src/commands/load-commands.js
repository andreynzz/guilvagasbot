const fs = require("node:fs");
const path = require("node:path");

const commandsPath = path.join(__dirname);

function loadCommands() {
  const commands = new Map();
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"))
    .filter((file) => file !== "load-commands.js");

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    if (!command.data || !command.data.name || typeof command.execute !== "function") {
      console.warn(`Comando ignorado por estar incompleto: ${file}`);
      continue;
    }

    commands.set(command.data.name, command);
  }

  return commands;
}

module.exports = {
  loadCommands,
};
