const {
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp');

// Load plugins
const uglify       = require('gulp-uglify');
const rename       = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cssnano      = require('gulp-cssnano');
const concat       = require('gulp-concat');
// const clean        = require('gulp-clean');
// const imagemin     = require('gulp-imagemin');
const changed      = require('gulp-changed');
const browsersync  = require('browser-sync').create();

// // Clean assets
// function clear() {
    // return src('./assets/*', {
    //         read: false
    //     })
    //     .pipe(clean());
// }

// JS function 

function js() {
    const source = './src/js/*.js';

    return src(source)
        .pipe(changed(source))
        .pipe(concat('farms.js'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest('./src/js/'))
        .pipe(browsersync.stream());
}

// CSS function 
function css() {
    const source = './src/css/*.css';

    return src(source)
        .pipe(changed(source))
        .pipe(concat('farms.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(cssnano())
        .pipe(dest('./src/css/'))
        .pipe(browsersync.stream());
}

// // Optimize images
// function img() {
//     return src('./src/img/*')
//         .pipe(imagemin())
//         .pipe(dest('./assets/img'));
// }

// Watch files

function watchFiles() {
    watch('./src/css/*', css);
    watch('./src/js/*', js);
    // watch('./src/img/*', img);
}

// BrowserSync
function browserSync() {
    browsersync.init({
        server: {
            baseDir: './'
        },
        port: 3000
    });
}

// Tasks to define the execution of the functions simultaneously or in series
exports.watch = parallel(watchFiles, browserSync);
//exports.default = series(clear, parallel(js, css, img));
exports.default = series(parallel(js, css));