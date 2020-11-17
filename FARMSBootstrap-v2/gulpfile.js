const {series, parallel} = require('gulp');

// Increment before pushing and update in index.html
var counter  = 1;
var gulp     = require('gulp');
var concat   = require('gulp-concat');
var minify   = require('gulp-minify');
var cleanCss = require('gulp-clean-css');
var del      = require('del');
 
async function packjs () {
    return gulp.src(['src/vendor/jquery/jquery.min.js',
                     'src/vendor/bootstrap/js/bootstrap.bundle.min.js', 
                     'src/vendor/jquery-fancybox/jquery.fancybox.min.js', 
                     'src/vendor/jquery-easing/jquery.easing.min.js',
                     'src/vendor/jqBootstrapValidation.js',
                     'src/js/*.js'
                    ])
        .pipe(concat('farms.1.' + counter + '.min.js'))
        .pipe(minify({
            ext:{
                min:'.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest('src/dist'));
}
 
async function packcss () {    
    return gulp.src(['src/vendor/bootstrap/css/bootstrap.min.css',
                     'src/vendor/jquery-fancybox/jquery_fancybox_min.css',
                     'src/css/*.css'
                     ])
        .pipe(concat('farms.1.' + counter + '.min.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('src/dist'));
}

async function clean() {
    return del(['src/dist']);
}

exports.default = series(clean, parallel(packjs, packcss));