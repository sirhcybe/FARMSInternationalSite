const { src, dest, watch, parallel } = require('gulp');
const minifyJs = require('gulp-uglify');
const concat = require('gulp-concat');
const cleanCss = require('gulp-clean-css');

// Increment before pushing and update in index.html
var minifiedJs = 'farms.1.4.min.js';
var minifiedCss = 'farms.1.4.min.css';

const bundleJs = () => {
    return src(['src/vendor/jquery/jquery.min.js',
                'src/vendor/bootstrap/js/bootstrap.bundle.min.js', 
                'src/vendor/jquery-fancybox/jquery.fancybox.min.js', 
                'src/vendor/jquery-easing/jquery.easing.min.js',
                'src/vendor/jqBootstrapValidation.js',
                'src/js/*.js'
                ])
            .pipe(minifyJs())
            .pipe(concat(minifiedJs))
            .pipe(dest('src/dist/'));
}
const bundleCss = () => {
    return src(['src/vendor/bootstrap/css/bootstrap.min.css',
                'src/vendor/jquery-fancybox/jquery_fancybox_min.css',
                'src/css/*.css'
                ])
    .pipe(concat(minifiedCss))
    .pipe(cleanCss())
    .pipe(dest('src/dist/'));
}
const devWatch = () => {
    watch('./js/*.js', bundleJs);
}
exports.bundleJs  = bundleJs;
exports.bundleCss = bundleCss;
exports.devWatch  = devWatch;
exports.build = parallel(bundleJs, bundleCss);