const config = require("../config");
const { formatJobsMessage } = require("./job-message");
const { loadSeenJobs, saveSeenJobs } = require("./job-store");
const { fetchVagasJobs, pickJobId } = require("./vagas-search");

async function fetchNewJobs() {
  const seenJobs = loadSeenJobs();
  const items = await fetchVagasJobs();

  const unseenJobs = items
    .filter((item) => !seenJobs.has(pickJobId(item)))
    .slice(0, config.maxJobsPerRun);

  return { seenJobs, newJobs: unseenJobs };
}

async function postJobsToChannel(channel, options = {}) {
  const { seenJobs, newJobs } = await fetchNewJobs();

  if (newJobs.length === 0) {
    return 0;
  }

  await channel.send(formatJobsMessage(newJobs, options));

  for (const job of newJobs) {
    seenJobs.add(pickJobId(job));
  }

  saveSeenJobs(seenJobs);
  return newJobs.length;
}

module.exports = {
  postJobsToChannel,
};
