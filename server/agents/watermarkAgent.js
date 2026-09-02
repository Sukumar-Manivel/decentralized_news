const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * 🤖 WATERMARK AGENT (Visible Watermark Generator)
 * Applies a diagonal semi-transparent protective watermark overlay on previews
 * to prevent unauthorized reproduction or screenshot theft prior to license purchase.
 */
const generateVisibleWatermark = async (originalFilename) => {
  const inputPath = path.join(__dirname, '../uploads/originals', originalFilename);
  const previewDir = path.join(__dirname, '../uploads/previews');

  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  const previewFilename = `preview-${path.parse(originalFilename).name}.jpg`;
  const outputPath = path.join(previewDir, previewFilename);

  try {
    const metadata = await sharp(inputPath).metadata();
    const width = metadata.width || 1280;
    const height = metadata.height || 720;

    // Generate dynamic SVG watermark pattern scaled to image dimensions
    const svgOverlay = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .wm-text {
            fill: rgba(255, 255, 255, 0.45);
            font-size: ${Math.max(24, Math.round(width / 24))}px;
            font-weight: 800;
            font-family: Arial, sans-serif;
            letter-spacing: 2px;
          }
          .wm-sub {
            fill: rgba(233, 69, 96, 0.65);
            font-size: ${Math.max(16, Math.round(width / 38))}px;
            font-weight: bold;
            font-family: Arial, sans-serif;
          }
        </style>
        <g transform="rotate(-30, ${width / 2}, ${height / 2})">
          <text x="${width * 0.1}" y="${height * 0.4}" class="wm-text">CITIZENLENS PROTECTED PREVIEW</text>
          <text x="${width * 0.15}" y="${height * 0.45}" class="wm-sub">UNLICENSED REPRODUCTION PROHIBITED</text>

          <text x="${width * 0.1}" y="${height * 0.7}" class="wm-text">CITIZENLENS PROTECTED PREVIEW</text>
          <text x="${width * 0.15}" y="${height * 0.75}" class="wm-sub">PURCHASE OFFICIAL LICENSE TO UNLOCK</text>
        </g>
      </svg>
    `;

    // Composite the SVG watermark overlay over the image
    await sharp(inputPath)
      .resize(Math.min(1920, width), null, { withoutEnlargement: true })
      .composite([{
        input: Buffer.from(svgOverlay),
        gravity: 'center'
      }])
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    console.log(`   🛡️ [WatermarkAgent] Generated protected preview: ${previewFilename}`);
    return previewFilename;
  } catch (error) {
    console.error(`[WatermarkAgent] Failed to watermark ${originalFilename}:`, error.message);
    return originalFilename; // Fallback to original if non-image/video
  }
};

module.exports = { generateVisibleWatermark };
