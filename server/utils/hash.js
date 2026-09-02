const crypto = require('crypto');
const fs = require('fs');

/**
 * Generates cryptographic SHA-256 hash of a file
 * Used to guarantee evidence file integrity from the exact moment of upload
 */
const generateSHA256 = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
};

module.exports = { generateSHA256 };
