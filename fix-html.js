const fs = require('fs');

const indexPath = './dist/index.html';
const iconSrc = './assets/icon.png';
const iconDest = './dist/icon.png';
const manifestDest = './dist/manifest.json';

if (fs.existsSync(indexPath)) {
  // 1. Copy icon
  if (fs.existsSync(iconSrc)) {
    fs.copyFileSync(iconSrc, iconDest);
    console.log('✅ Copied icon.png to dist/');
  }

  // 2. Create basic web manifest for Android
  const manifest = {
    "short_name": "CampusRaid",
    "name": "CampusRaid",
    "icons": [
      {
        "src": "/icon.png",
        "type": "image/png",
        "sizes": "1024x1024"
      }
    ],
    "start_url": "/",
    "background_color": "#000000",
    "display": "standalone",
    "theme_color": "#000000"
  };
  fs.writeFileSync(manifestDest, JSON.stringify(manifest, null, 2));

  // 3. Patch index.html
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Fix import.meta issue
  html = html.replace('<script src="/_expo', '<script type="module" src="/_expo');
  
  // Inject PWA tags into <head>
  const headInjection = `
    <link rel="apple-touch-icon" href="/icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="CampusRaid">
  `;
  html = html.replace('</head>', `${headInjection}</head>`);
  
  fs.writeFileSync(indexPath, html);
  console.log('✅ Patched index.html with PWA tags and module script');
} else {
  console.log('⚠️ dist/index.html not found. Skipping patch.');
}
