const config = require("../config");
const { formatJobsMessage } = require("./job-message");
const { createJobEmbeds, fetchJobPreview } = require("./job-preview");
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

  const jobsWithPreview = await Promise.all(newJobs.map((job) => fetchJobPreview(job)));
  const embeds = createJobEmbeds(jobsWithPreview);

  await channel.send({
    content: formatJobsMessage(jobsWithPreview, options),
    embeds,
  });

  for (const job of jobsWithPreview) {
    seenJobs.add(pickJobId(job));
  }

  saveSeenJobs(seenJobs);
  return newJobs.length;
}

module.exports = {
  postJobsToChannel,
};
