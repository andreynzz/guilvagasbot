const config = require("../config");
const { postJobsToChannel } = require("./jobs");

function createJobPoster(client) {
  let isPosting = false;

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

  function startSchedule() {
    const intervalMs = config.postIntervalMinutes * 60 * 1000;
    setInterval(() => {
      postJobs();
    }, intervalMs);
  }

  return {
    postJobs,
    startSchedule,
  };
}

module.exports = {
  createJobPoster,
};
