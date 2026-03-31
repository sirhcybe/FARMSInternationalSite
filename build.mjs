import { transform } from 'esbuild';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

const VERSION = '1.4';
const DIST = join('src', 'dist');

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

async function build() {
  mkdirSync(DIST, { recursive: true });

  // Bundle + minify JS
  const jsContent = jsFiles.map(f => readFileSync(f, 'utf8')).join(';\n');
  const { code: minJs } = await transform(jsContent, { minify: true, loader: 'js' });
  writeFileSync(join(DIST, `farms.${VERSION}.min.js`), minJs);
  console.log(`  farms.${VERSION}.min.js  (${(minJs.length / 1024).toFixed(0)} KB)`);

  // Bundle + minify CSS
  const cssContent = cssFiles.map(f => readFileSync(f, 'utf8')).join('\n');
  const { code: minCss } = await transform(cssContent, { minify: true, loader: 'css' });
  writeFileSync(join(DIST, `farms.${VERSION}.min.css`), minCss);
  console.log(`  farms.${VERSION}.min.css (${(minCss.length / 1024).toFixed(0)} KB)`);
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
