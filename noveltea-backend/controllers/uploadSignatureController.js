const crypto = require('crypto');

// @desc  Generate a Cloudinary signed upload signature
// @route GET /api/books/upload-signature
// @access Private
exports.getUploadSignature = (req, res) => {
  const cloudName  = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey     = process.env.CLOUDINARY_API_KEY;
  const apiSecret  = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ message: 'Cloudinary not configured on server' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder    = 'noveltea-books';

  // Sign: folder + timestamp + secret  (alphabetical order)
  const toSign    = `folder=${folder}&resource_type=raw&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha256').update(toSign).digest('hex');

  res.json({ signature, timestamp, cloud_name: cloudName, api_key: apiKey, folder });
};
