import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceDir = 'c:/Users/alexi/Desktop/panaderia/imagenes';
const targetDir = 'c:/Users/alexi/Desktop/panaderia/pasele-guerita/packages/web/public/imagenes';

const imageMap = {
    'abuelita.png': 'cookie-abuelita.webp',
    'abuelita 2.png': 'cookie-abuelita-2.webp',
    'choconuts 4.png': 'cookie-choconuts.webp',
    'choconuts5  .png': 'cookie-choconuts-2.webp',
    'galleta dragon.png': 'cookie-dragon.webp',
    'chai.png': 'cookie-chai.webp'
};

async function processImages() {
    for (const [src, dest] of Object.entries(imageMap)) {
        const srcPath = path.join(sourceDir, src);
        const destPath = path.join(targetDir, dest);
        
        if (fs.existsSync(srcPath)) {
            console.log(`Processing ${src} -> ${dest}...`);
            await sharp(srcPath)
                .resize(1000, null, { withoutEnlargement: true }) // Cookie detail size
                .webp({ quality: 85 })
                .toFile(destPath);
        } else {
            console.warn(`Source ${src} not found!`);
        }
    }
}

async function run() {
    await processImages();
    console.log('All cookie images processed successfully.');
}

run().catch(console.error);
