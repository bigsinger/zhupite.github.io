const fs = require('fs');
const path = require('path');

const siteRoot = path.resolve(process.argv[2] || '_site');
const siteOrigin = 'https://zhupite.com';
const failures = [];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function decodePathname(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function localTargetFor(value, currentFile) {
  if (!value || value === '#') return null;
  if (/^(mailto|tel|javascript|data):/i.test(value)) return null;
  if (/^\/\//.test(value)) return null;

  let pathname = value;
  if (/^https?:\/\//i.test(value)) {
    const parsed = new URL(value);
    if (parsed.origin !== siteOrigin) return null;
    pathname = parsed.pathname + parsed.search + parsed.hash;
  }

  pathname = pathname.split('#')[0].split('?')[0];
  if (!pathname) return null;
  pathname = decodePathname(pathname);

  if (pathname.startsWith('/')) {
    return path.join(siteRoot, pathname);
  }
  return path.resolve(path.dirname(currentFile), pathname);
}

function candidates(target) {
  const list = [target];
  if (target.endsWith(path.sep)) {
    list.push(path.join(target, 'index.html'));
  } else if (!path.extname(target)) {
    list.push(path.join(target, 'index.html'));
    list.push(target + '.html');
  }
  return list;
}

function existsTarget(target) {
  return candidates(target).some(candidate => fs.existsSync(candidate));
}

if (!fs.existsSync(siteRoot)) {
  console.error(`Site output not found: ${siteRoot}`);
  process.exit(1);
}

const htmlFiles = walk(siteRoot).filter(file => file.endsWith('.html'));
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const attrPattern = /\b(?:href|src)=["']([^"']+)["']/gi;
  let match;
  while ((match = attrPattern.exec(html))) {
    const target = localTargetFor(match[1], file);
    if (!target) continue;
    if (!existsTarget(target)) {
      failures.push(`${path.relative(siteRoot, file)} -> ${match[1]}`);
    }
  }
}

if (failures.length) {
  console.error('Broken local links/assets found:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files. No broken local links/assets found.`);
