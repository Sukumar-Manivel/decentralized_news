const fs = require('fs');
const exifParser = require('exif-parser');

/**
 * Extracts EXIF camera, GPS, and timestamp metadata from image files
 */
const extractEXIF = async (filePath) => {
  try {
    const buffer = await fs.promises.readFile(filePath);
    
    // Only JPEG formats contain standard EXIF segments
    const parser = exifParser.create(buffer);
    const result = parser.parse();

    if (!result || !result.tags) {
      return { hasExif: false, data: null };
    }

    const tags = result.tags;
    const hasData = Boolean(tags.Make || tags.Model || tags.DateTimeOriginal || tags.GPSLatitude);

    return {
      hasExif: hasData,
      data: {
        make: tags.Make || null,
        model: tags.Model || null,
        software: tags.Software || null,
        dateTime: tags.DateTimeOriginal ? new Date(tags.DateTimeOriginal * 1000).toISOString() : null,
        gps: (tags.GPSLatitude && tags.GPSLongitude) ? {
          latitude: tags.GPSLatitude,
          longitude: tags.GPSLongitude
        } : null
      }
    };
  } catch (error) {
    // Non-JPEG images or files without EXIF header
    return { hasExif: false, data: null, error: error.message };
  }
};

module.exports = { extractEXIF };
