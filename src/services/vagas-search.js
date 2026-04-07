const cheerio = require("cheerio");
const config = require("../config");

function pickJobId(item) {
  return item.id || item.link || `${item.title || "sem-titulo"}-${item.publishedAt || Date.now()}`;
}

function slugifySearchTerm(searchTerm) {
  return searchTerm
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildVagasSearchUrl(searchTerm) {
  const slug = slugifySearchTerm(searchTerm);
  return `https://www.vagas.com.br/vagas-de-${slug}`;
}

function extractCardText($card, selector) {
  return $card.find(selector).first().text().replace(/\s+/g, " ").trim();
}

function isRelatedJob(job) {
  const haystack = [job.title, job.company, job.level, job.location, job.summary]
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return config.relatedKeywords.some((keyword) =>
    haystack.includes(
      keyword
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    )
  );
}

async function fetchVagasJobsBySearchTerm(searchTerm) {
  const response = await fetch(buildVagasSearchUrl(searchTerm), {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; GuilVagasBot/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar o Vagas. Status: ${response.status}.`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const jobs = [];

  $("h2 a[href*='/vagas/']").each((_, element) => {
    const anchor = $(element);
    const card = anchor.closest("li, article, div");
    const title = anchor.text().replace(/\s+/g, " ").trim();
    const href = anchor.attr("href");

    if (!title || !href) {
      return;
    }

    const link = href.startsWith("http") ? href : `https://www.vagas.com.br${href}`;
    const jobIdMatch = link.match(/\/v(\d+)\//i);
    const company =
      extractCardText(card, "img[alt]") ||
      extractCardText(card, "h2 + *") ||
      "Empresa nao informada";

    const rawTexts = card
      .text()
      .split("\n")
      .map((item) => item.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .filter((item) => item !== title && item !== company && item !== "Publicidade");

    const level = rawTexts[0] || "Nivel nao informado";
    const location =
      rawTexts.find((item) => item.includes("/")) || rawTexts[1] || "Localizacao nao informada";
    const publishedAt =
      rawTexts.find((item) => /hoje|ontem|há \d+ dias|\d{2}\/\d{2}\/\d{4}/i.test(item)) ||
      "Data nao informada";
    const summary = rawTexts.join(" | ");

    jobs.push({
      id: jobIdMatch ? `v${jobIdMatch[1]}` : link,
      title,
      company,
      level,
      location,
      publishedAt,
      summary,
      link,
    });
  });

  return jobs;
}

async function fetchVagasJobs() {
  const jobsById = new Map();

  for (const searchTerm of config.vagasSearchTerms) {
    const jobs = await fetchVagasJobsBySearchTerm(searchTerm);

    for (const job of jobs) {
      if (isRelatedJob(job)) {
        jobsById.set(pickJobId(job), job);
      }
    }
  }

  return [...jobsById.values()];
}

module.exports = {
  fetchVagasJobs,
  pickJobId,
};
