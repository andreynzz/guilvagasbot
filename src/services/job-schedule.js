const SCHEDULED_HOURS = [10, 20];

function getNextRunDate(now = new Date()) {
  const nextRun = new Date(now);
  nextRun.setSeconds(0, 0);

  for (const hour of SCHEDULED_HOURS) {
    const candidate = new Date(now);
    candidate.setHours(hour, 0, 0, 0);

    if (candidate > now) {
      return candidate;
    }
  }

  nextRun.setDate(nextRun.getDate() + 1);
  nextRun.setHours(SCHEDULED_HOURS[0], 0, 0, 0);
  return nextRun;
}

module.exports = {
  getNextRunDate,
};
