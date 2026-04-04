import { createHash } from 'crypto';
import { transform } from 'esbuild';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'fs';
import { join, resolve } from 'path';

const DIST = join('src', 'dist');

// HTML pages that reference the bundles
const HTML_FILES = [
  'src/index.html',
  'src/404.html',
  'src/gala.html',
  'src/resources.html',
  'src/brand-guide.html',
];

// JS files in load order (vendor first, then custom)
const jsFiles = [
  'src/vendor/jquery/jquery.min.js',
  'src/vendor/bootstrap/js/bootstrap.bundle.min.js',
  'src/vendor/jquery-fancybox/jquery.fancybox.min.js',
  'src/vendor/jquery-easing/jquery.easing.min.js',
  'src/vendor/jqBootstrapValidation.js',
  ...readdirSync('src/js').filter(f => f.endsWith('.js')).sort().map(f => join('src', 'js', f)),
];

// CSS files in load order (vendor first, then custom)
const cssFiles = [
  'src/vendor/bootstrap/css/bootstrap.min.css',
  'src/vendor/jquery-fancybox/jquery_fancybox_min.css',
  ...readdirSync('src/css').filter(f => f.endsWith('.css')).sort().map(f => join('src', 'css', f)),
];

function fingerprint(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 8);
}

async function build() {
  // Clean old dist files
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  // Bundle + minify JS
  const jsContent = jsFiles.map(f => readFileSync(f, 'utf8')).join(';\n');
  const { code: minJs } = await transform(jsContent, { minify: true, loader: 'js' });
  const jsHash = fingerprint(minJs);
  const jsName = `farms.${jsHash}.min.js`;
  writeFileSync(join(DIST, jsName), minJs);
  console.log(`  ${jsName}  (${(minJs.length / 1024).toFixed(0)} KB)`);

  // Bundle + minify CSS
  const cssContent = cssFiles.map(f => readFileSync(f, 'utf8')).join('\n');
  const { code: minCss } = await transform(cssContent, { minify: true, loader: 'css' });
  const cssHash = fingerprint(minCss);
  const cssName = `farms.${cssHash}.min.css`;
  writeFileSync(join(DIST, cssName), minCss);
  console.log(`  ${cssName} (${(minCss.length / 1024).toFixed(0)} KB)`);

  // Update HTML references
  const jsPattern = /farms\.[a-f0-9]+\.min\.js|farms\.\d+\.\d+\.min\.js/g;
  const cssPattern = /farms\.[a-f0-9]+\.min\.css|farms\.\d+\.\d+\.min\.css/g;

  for (const file of HTML_FILES) {
    try {
      let html = readFileSync(file, 'utf8');
      html = html.replace(jsPattern, jsName);
      html = html.replace(cssPattern, cssName);
      writeFileSync(file, html);
    } catch (e) {
      // Skip missing files (e.g. brand-guide.html may not exist)
    }
  }
  console.log(`  Updated ${HTML_FILES.length} HTML files`);
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
