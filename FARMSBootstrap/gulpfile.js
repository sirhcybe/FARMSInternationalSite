var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
//var pump = require('pump');
//var concat = require('gulp-concat');
var useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-clean-css');
    lazypipe = require('lazypipe');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    var files = require('glob').sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath)
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('clean', function (done) {
    require('del')([
        dirs.archive,
        dirs.dist
    ], done);
});

gulp.task('copy', [
    'copy:html',
    'copy:license',
    'copy:main.css',
    'copy:misc',
    'copy:img',
    'copy:normalize'
]);

//gulp.task('copy:.htaccess', function () {
//    return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
//               .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
//               .pipe(gulp.dest(dirs.dist));
//});

//gulp.task('copy:index.html', function () {
//    return gulp.src(dirs.src + '/index.html')
//               .pipe(plugins.replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery))
//               .pipe(gulp.dest(dirs.dist));
//});

var cssprefixer = lazypipe()
               .pipe(plugins.autoprefixer({
                   browsers: ['last 2 versions', 'ie >= 8', '> 1%'],
                   cascade: false
               }))
               .pipe(minifyCss());

gulp.task('copy:html', function () {
    return gulp.src(dirs.src + '/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cssprefixer()))
        .pipe(gulp.dest(dirs.dist));
});

//Not needed since we are loading this from a CDN
//gulp.task('copy:normalize', function () {
//    return gulp.src('node_modules/normalize.css/normalize.css')
//               .pipe(gulp.dest(dirs.dist + '/css'));
//});

//gulp.task('copy:jquery', function () {
//    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
//               .pipe(plugins.rename('jquery-' + pkg.devDependencies.jquery + '.min.js'))
//               .pipe(gulp.dest(dirs.dist + '/js/vendor'));
//});

//gulp.task('copy:js', function (cb) {
//  return gulp.src(['node_modules/jquery/dist/jquery.min.js', 'src/js/**/*.js'])
//    .pipe(concat('scripts.min.js'))
//    .pipe(plugins.uglify())
//    .pipe(gulp.dest('dist/js'));
//});

gulp.task('copy:license', function () {
    return gulp.src('LICENSE.txt')
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:img', function () {
    return gulp.src([dirs.src + '/img/*']).pipe(gulp.dest(dirs.dist + '/img'));
});

gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        dirs.src + '/404.html',
        dirs.src + '/apple-touch-icon.png',
        dirs.src + '/favicon.ico',
        dirs.src + '/favicon.png',
        dirs.src + '/giving.html',
        dirs.src + '/tile.png',
        dirs.src + '/tile-wide.png',
        dirs.src + '/browserconfig.xml',
        dirs.src + '/crossdomain.xml',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/css/main.css',
        '!' + dirs.src + '/index.html'

    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));
});

gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/*.js',
        dirs.test + '/*.js'
    ]).pipe(plugins.jscs())
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter('fail'));
});


// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
    done);
});

gulp.task('build', function (done) {
    runSequence(
        ['clean'],
        'copy',
    done);
});

gulp.task('default', ['build']);
