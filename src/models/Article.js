import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    article_id: { type: String, required: true, unique: true },
    title: String,
    link: String,
    content: String,
    description: String,
    pubDate: Date,
    language: String,
    country: String, 
    category: [String],
    creator: String,
    source_id: String,
    source_name: String,
    source_url: String,
    datatype: String,
    image_url: String,
    video_url: String,
    keywords: [String],
  },
  { timestamps: true }
);

// article_id already has unique: true in schema - no need for explicit index
articleSchema.index({ pubDate: -1 });
articleSchema.index({ creator: 1 });
articleSchema.index({ language: 1 });
articleSchema.index({ country: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ datatype: 1 });

export default mongoose.model("Article", articleSchema);
