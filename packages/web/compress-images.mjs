import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceDir = 'c:/Users/alexi/Desktop/panaderia/imagenes';
const targetDir = 'c:/Users/alexi/Desktop/panaderia/pasele-guerita/packages/web/public/imagenes';

const imageMap = {
    'hogaza-natural.jpg': 'hogaza-natural.webp',
    'hogaza-centeno.jpg': 'hogaza-centeno.webp',
    'hogaza-semillas.jpg': 'hogaza-semillas.webp',
    'hogaza-natural-dos.jpg': 'hogaza-natural-2.webp',
    'hogaza-semillas-2.jpg': 'hogaza-semillas-2.webp',
    'hogaza-fermentando.jpg': 'hogaza-proceso.webp'
};

async function processImages() {
    for (const [src, dest] of Object.entries(imageMap)) {
        const srcPath = path.join(sourceDir, src);
        const destPath = path.join(targetDir, dest);
        
        if (fs.existsSync(srcPath)) {
            console.log(`Processing ${src} -> ${dest}...`);
            await sharp(srcPath)
                .resize(1200, null, { withoutEnlargement: true }) // Hero/Detail size
                .webp({ quality: 80 })
                .toFile(destPath);
        } else {
            console.warn(`Source ${src} not found!`);
        }
    }
}

// Also handle the logo separately for high res but small size
async function processLogo() {
    const logoSrc = path.join(sourceDir, 'logo-pasele-guerita.png');
    const logoDest = 'c:/Users/alexi/Desktop/panaderia/pasele-guerita/packages/web/public/logo.png';
    
    if (fs.existsSync(logoSrc)) {
        console.log(`Processing Logo...`);
        await sharp(logoSrc)
            .resize(800, null, { withoutEnlargement: true }) // Large but reasonable
            .png({ compressionLevel: 9 })
            .toFile(logoDest);
    }
}

async function run() {
    await processImages();
    await processLogo();
    console.log('All images processed successfully.');
}

run().catch(console.error);
