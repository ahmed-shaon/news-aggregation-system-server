import express from "express";
import Article from "../models/Article.js";

const router = express.Router();

// GET /api/news - List articles with filters
router.get("/", async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      author,
      language,
      country,
      category,
      datatype,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (dateFrom || dateTo) {
      filter.pubDate = {};
      if (dateFrom) filter.pubDate.$gte = new Date(dateFrom);
      if (dateTo) filter.pubDate.$lte = new Date(dateTo);
    }
    if (author) filter.creator = new RegExp(author, "i");
    if (language) filter.language = language;
    if (country) filter.country = country;
    if (category) {
      const categories = category.split(",").map((c) => c.trim());
      filter.category = { $in: categories };
    }
    if (datatype) {
      const types = datatype.split(",").map((t) => t.trim());
      filter.datatype = { $in: types };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [articles, total] = await Promise.all([
      Article.find(filter).sort({ pubDate: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
      Article.countDocuments(filter),
    ]);

    res.json({
      articles,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/news/:articleId - Single article detail
router.get("/:articleId", async (req, res) => {
  try {
    const article = await Article.findOne({ article_id: req.params.articleId }).lean();
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
