const { getMatchResult } = require("../services/llmService");
const MatchHistory = require("../models/MatchHistory");

// @route  POST /api/match
const submitMatch = async (req, res, next) => {
  try {
    const { resumeText, jobDescriptionText } = req.body;

    if (!resumeText || !jobDescriptionText) {
      return res.status(400).json({
        error: "Both resumeText and jobDescriptionText are required",
      });
    }

    // Basic sanity bounds — protects against empty/junk submissions
    // wasting an LLM call, and against pathologically huge pastes.
    const MIN_LENGTH = 50;
    const MAX_LENGTH = 15000;

    if (
      resumeText.length < MIN_LENGTH ||
      jobDescriptionText.length < MIN_LENGTH
    ) {
      return res.status(400).json({
        error: `Resume and job description must each be at least ${MIN_LENGTH} characters`,
      });
    }
    if (
      resumeText.length > MAX_LENGTH ||
      jobDescriptionText.length > MAX_LENGTH
    ) {
      return res.status(400).json({
        error: `Resume and job description must each be under ${MAX_LENGTH} characters`,
      });
    }

    const result = await getMatchResult(
      req.user._id,
      resumeText,
      jobDescriptionText,
    );

    res.status(200).json({
      ...result,
      usage: req.rateLimit, // { remaining, limit } — attached by rateLimiter middleware
    });
  } catch (err) {
    next(err); // llmService errors already carry statusCode (502/504)
  }
};

// @route  GET /api/match/history
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      MatchHistory.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-resumeText -jobDescriptionText"), // list view doesn't need full text, keeps payload small
      MatchHistory.countDocuments({ userId: req.user._id }),
    ]);

    res.status(200).json({
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/match/history/:id
const getHistoryDetail = async (req, res, next) => {
  try {
    const record = await MatchHistory.findOne({
      _id: req.params.id,
      userId: req.user._id, // scoped to owner — prevents one user reading another's record by guessing an ID
    });

    if (!record) {
      return res.status(404).json({ error: "Match record not found" });
    }

    res.status(200).json({ record });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitMatch, getHistory, getHistoryDetail };