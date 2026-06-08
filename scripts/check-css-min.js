const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'assets', 'css', 'theme-modern.css');
const targetPath = path.join(root, 'assets', 'css', 'theme-modern.min.css');

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

const expected = minifyCss(fs.readFileSync(sourcePath, 'utf8')) + '\n';
const actual = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';

if (actual !== expected) {
  console.error('assets/css/theme-modern.min.css is out of date. Run: node scripts/minify-css.js');
  process.exit(1);
}
