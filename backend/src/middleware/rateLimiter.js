const RateLimit = require("../models/RateLimit");

const DAILY_LIMIT = parseInt(process.env.FREE_DAILY_MATCH_LIMIT, 10) || 10;

const getTodayUTC = () => new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

const getResetTimestamp = () => {
  const now = new Date();
  // Next UTC midnight — matches the UTC date string used as the partition key,
  // so "resets at" is always consistent with when the counter actually rolls over.
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
    ),
  );
};

const rateLimiter = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = getTodayUTC();

    // Atomic increment-and-fetch. Using findOneAndUpdate with $inc (rather than
    // "read count, check limit, then write") avoids a race condition where two
    // near-simultaneous requests both read count=9 and both get approved.
    const record = await RateLimit.findOneAndUpdate(
      { userId, date: today },
      { $inc: { count: 1 } },
      { upsert: true, new: true },
    );

    if (record.count > DAILY_LIMIT) {
      // Roll back this increment so a user hammering the endpoint after being
      // blocked doesn't inflate the counter to arbitrarily large numbers —
      // it stays pinned at limit+1 worth of "attempts" at most per check.
      await RateLimit.updateOne(
        { userId, date: today },
        { $inc: { count: -1 } },
      );

      return res.status(429).json({
        error: `Daily match limit of ${DAILY_LIMIT} reached.`,
        limit: DAILY_LIMIT,
        resetsAt: getResetTimestamp().toISOString(),
      });
    }

    // Attach usage info so the response can tell the frontend "3 of 10 used"
    req.rateLimit = {
      remaining: DAILY_LIMIT - record.count,
      limit: DAILY_LIMIT,
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = rateLimiter;