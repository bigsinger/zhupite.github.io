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

const source = fs.readFileSync(sourcePath, 'utf8');
fs.writeFileSync(targetPath, minifyCss(source) + '\n');
