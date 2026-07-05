const mongoose = require("mongoose");

const matchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // fast lookup for "get my history"
    },
    resumeText: {
      type: String,
      required: true,
    },
    jobDescriptionText: {
      type: String,
      required: true,
    },
    inputHash: {
      type: String,
      required: true,
      index: true, // used for cache lookups
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    fromCache: {
      type: Boolean,
      default: false, // true if this result was served from cache, not a fresh LLM call
    },
    llmProvider: {
      type: String,
      default: "gemini",
    },
    llmModel: {
      type: String,
    },
  },
  { timestamps: true },
);

// Compound index: fast "has this user already matched this exact pair" lookups
matchHistorySchema.index({ userId: 1, inputHash: 1 });

module.exports = mongoose.model("MatchHistory", matchHistorySchema);