const fs = require('fs');
const path = './dist/index.html';

if (fs.existsSync(path)) {
  let html = fs.readFileSync(path, 'utf8');
  html = html.replace('<script src="/_expo', '<script type="module" src="/_expo');
  fs.writeFileSync(path, html);
  console.log('✅ Patched index.html with type="module" to fix import.meta syntax error');
} else {
  console.log('⚠️ dist/index.html not found. Skipping patch.');
}
