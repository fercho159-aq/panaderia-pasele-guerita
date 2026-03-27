import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.resolve(__dirname, '../public/imagenes');

async function compress() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Directory not found: ${IMAGES_DIR}`);
    return;
  }

  const files = fs.readdirSync(IMAGES_DIR);
  let totalSaved = 0;

  console.log(`Scanning ${files.length} files in ${IMAGES_DIR}...\n`);

  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const ext = path.extname(file).toLowerCase();

    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      continue;
    }

    const stats = fs.statSync(filePath);
    const originalSize = stats.size;

    try {
      const buffer = fs.readFileSync(filePath);
      let pipeline = sharp(buffer);

      // Metadata to check dimensions
      const metadata = await pipeline.metadata();
      
      // Resize if too large (e.g., > 1920 width)
      if (metadata.width > 2000) {
        pipeline = pipeline.resize({ width: 2000, withoutEnlargement: true });
      }

      // Compress based on format
      if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: 80, effort: 6 });
      } else if (ext === '.png') {
        pipeline = pipeline.png({ quality: 80, palette: true });
      } else {
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
      }

      const outputBuffer = await pipeline.toBuffer();
      const newSize = outputBuffer.length;

      if (newSize < originalSize) {
        fs.writeFileSync(filePath, outputBuffer);
        const saved = originalSize - newSize;
        totalSaved += saved;
        console.log(`✅ ${file}: ${(originalSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB (Saved ${(saved / 1024).toFixed(1)}KB)`);
      } else {
        console.log(`ℹ️ ${file}: Already optimal.`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }

  console.log(`\n🎉 Done! Total space saved: ${(totalSaved / (1024 * 1024)).toFixed(2)}MB`);
}

compress();
