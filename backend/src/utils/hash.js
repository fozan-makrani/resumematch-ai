const crypto = require('crypto');

// Normalizes whitespace before hashing so trivial formatting differences
// (extra spaces, line breaks from copy-paste) don't cause cache misses
// on what is semantically the same input.
const normalize = (text) => text.trim().replace(/\s+/g, ' ').toLowerCase();

const generateInputHash = (resumeText, jobDescriptionText) => {
  const combined = `${normalize(resumeText)}|||${normalize(jobDescriptionText)}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
};

module.exports = generateInputHash;