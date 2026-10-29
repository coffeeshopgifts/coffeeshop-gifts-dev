import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.name.endsWith('.html')) {
      continue;
    }
    if (entry.name === 'index.html' || entry.name === '404.html' || entry.name === '500.html') {
      continue;
    }
    const stem = entry.name.slice(0, -5);
    const destDir = path.join(dir, stem);
    const dest = path.join(destDir, 'index.html');
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(full, dest);
    }
  }
}

walk(path.join(process.cwd(), 'out'));
