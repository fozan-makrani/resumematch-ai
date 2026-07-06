const mongoose = require('mongoose');

const rateLimitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD' in UTC — partitions counters by day
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// One counter document per user per day
rateLimitSchema.index({ userId: 1, date: 1 }, { unique: true });

// Housekeeping: auto-delete counter docs 2 days after creation so this
// collection doesn't grow unbounded forever. Not load-bearing for the
// rate-limit logic itself (that's driven by the `date` field), just cleanup.
rateLimitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 2 });

module.exports = mongoose.model('RateLimit', rateLimitSchema);