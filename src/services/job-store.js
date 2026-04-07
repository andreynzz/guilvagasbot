const fs = require("node:fs");
const path = require("node:path");

const dataDir = path.join(__dirname, "..", "..", "data");
const seenJobsPath = path.join(dataDir, "seen-jobs.json");

function ensureDataFile() {
  fs.mkdirSync(dataDir, { recursive: true });

  if (!fs.existsSync(seenJobsPath)) {
    fs.writeFileSync(seenJobsPath, JSON.stringify([], null, 2));
  }
}

function loadSeenJobs() {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(seenJobsPath, "utf-8");
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.warn("Nao foi possivel ler o historico de vagas. Um novo arquivo sera criado.");
    fs.writeFileSync(seenJobsPath, JSON.stringify([], null, 2));
    return new Set();
  }
}

function saveSeenJobs(seenJobs) {
  fs.writeFileSync(seenJobsPath, JSON.stringify([...seenJobs], null, 2));
}

module.exports = {
  loadSeenJobs,
  saveSeenJobs,
};
