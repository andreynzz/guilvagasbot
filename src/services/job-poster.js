const config = require("../config");
const { postJobsToChannel } = require("./jobs");
const { getNextRunDate } = require("./job-schedule");

function createJobPoster(client) {
  let isPosting = false;
  let nextRunTimeout = null;

  async function postJobs() {
    if (isPosting) {
      return;
    }

    isPosting = true;

    try {
      const channel = await client.channels.fetch(config.channelId);

      if (!channel || !channel.isTextBased()) {
        throw new Error("O canal configurado nao foi encontrado ou nao aceita mensagens.");
      }

      const sentCount = await postJobsToChannel(channel);

      if (sentCount === 0) {
        console.log("Nenhuma vaga nova encontrada neste ciclo.");
        return;
      }

      console.log(`${sentCount} vaga(s) enviada(s) com sucesso.`);
    } catch (error) {
      console.error("Erro ao buscar ou enviar vagas:", error);
    } finally {
      isPosting = false;
    }
  }

  function scheduleNextRun() {
    if (nextRunTimeout) {
      clearTimeout(nextRunTimeout);
    }

    const nextRun = getNextRunDate();
    const delay = nextRun.getTime() - Date.now();

    console.log(`Proximo envio agendado para ${nextRun.toLocaleString("pt-BR")}.`);

    nextRunTimeout = setTimeout(async () => {
      await postJobs();
      scheduleNextRun();
    }, delay);
  }

  function startSchedule() {
    scheduleNextRun();
  }

  return {
    startSchedule,
  };
}

module.exports = {
  createJobPoster,
};
