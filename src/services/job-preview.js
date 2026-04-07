const cheerio = require("cheerio");
const { EmbedBuilder } = require("discord.js");

function extractMetaContent($, property, attribute = "property") {
  return $(`meta[${attribute}="${property}"]`).attr("content")?.trim() || null;
}

function normalizeImageUrl(imageUrl, pageUrl) {
  if (!imageUrl) {
    return null;
  }

  try {
    return new URL(imageUrl, pageUrl).toString();
  } catch (error) {
    return null;
  }
}

async function fetchJobPreview(job) {
  if (!job.link) {
    return {
      ...job,
      imageUrl: null,
    };
  }

  try {
    const response = await fetch(job.link, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; GuilVagasBot/1.0)",
      },
    });

    if (!response.ok) {
      return {
        ...job,
        imageUrl: null,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const imageUrl = normalizeImageUrl(
      extractMetaContent($, "og:image") ||
        extractMetaContent($, "twitter:image", "name"),
      job.link
    );

    return {
      ...job,
      imageUrl,
    };
  } catch (error) {
    return {
      ...job,
      imageUrl: null,
    };
  }
}

function createJobEmbeds(jobs) {
  return jobs
    .filter((job) => job.imageUrl)
    .map((job) =>
      new EmbedBuilder()
        .setTitle(job.title || "Vaga")
        .setURL(job.link || null)
        .setImage(job.imageUrl)
    );
}

module.exports = {
  createJobEmbeds,
  fetchJobPreview,
};
