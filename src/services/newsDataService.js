import axios from "axios";
import Article from "../models/Article.js";

const BASE_URL = "https://newsdata.io/api/1/latest";

export async function fetchAndStoreNews() {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    console.error("NEWSDATA_API_KEY is not set");
    return;
  }

  let nextPage = null;
  let totalStored = 0;

  try {
    do {
      const params = new URLSearchParams({ apikey: apiKey });
      params.set("size", 10);
      if (nextPage) params.set("page", nextPage);

      const { data } = await axios.get(`${BASE_URL}?${params.toString()}`);

      if (data.status === "error") {
        console.error("NewsData.io API error:", data.message);
        break;
      }

      const results = data.results || [];
      for (const item of results) {
        const article = mapApiResponseToArticle(item);
        if (article) {
          await Article.findOneAndUpdate(
            { article_id: article.article_id },
            article,
            { upsert: true, new: true }
          );
          totalStored++;
        }
      }

      nextPage = data.nextPage || null;
      if (nextPage) await sleep(1000); // Rate limit: wait between pages
    } while (nextPage);

    console.log(`Cron: Stored ${totalStored} articles`);
  } catch (err) {
    console.error("Cron fetch error:", err.message);
  }
}

function mapApiResponseToArticle(item) {
  if (!item.article_id) return null;

  // NewsData.io API format: creator/country are arrays; category is array
  const creator = Array.isArray(item.creator)
    ? item.creator[0] || item.creator.join(", ")
    : item.creator;
  const country = Array.isArray(item.country)
    ? item.country[0]
    : item.country;
  const category = Array.isArray(item.category) ? item.category : [item.category].filter(Boolean);

  return {
    article_id: item.article_id,
    title: item.title,
    link: item.link,
    content: item.content === "ONLY AVAILABLE IN PAID PLANS" ? null : item.content,
    description: item.description,
    pubDate: item.pubDate ? new Date(item.pubDate) : null,
    language: item.language,
    country: country || null,
    category,
    creator: creator || null,
    source_id: item.source_id,
    source_name: item.source_name,
    source_url: item.source_url,
    datatype: item.datatype,
    image_url: item.image_url || null,
    video_url: item.video_url || null,
    keywords: Array.isArray(item.keywords) ? item.keywords : [],
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
