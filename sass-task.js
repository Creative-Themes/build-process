const sass = require('gulp-sass');
const named = require('vinyl-named');
const rename = require('gulp-rename');
const path = require('path');
const fs = require('fs');
const merge = require('merge-stream');
const gulpIf = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const header = require('gulp-header');
const autoprefixer = require('gulp-autoprefixer');

const browserSync = require('browser-sync').create();

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

module.exports = {
    assign: sassTask
};

function sassTask (gulp, options) {
    /*
    var series = options.sassFiles.map(function (sassFile) {
        return function (callback) {
            return gulp.src({cwd: 'shortcode/*'}, '')
                .pipe(sass().on('error', sass.logError))
                .pipe(gulp.dest('bundle'));
        };
    });
    */

    function getFolders(dir) {
        return fs.readdirSync(dir)
            .filter(function(file) {
                return fs.statSync(path.join(dir, file)).isDirectory();
            });
    }

    var series = options.sassFiles.map(function (entry) {
        if (entry.forEachFolderIn) {
            var folders = getFolders(entry.forEachFolderIn);

            var tasks = folders.map(function (folder) {
                return function () {
                    return sassProcess(
                        path.join(entry.forEachFolderIn, folder, entry.input),
                        path.join(entry.forEachFolderIn, folder, entry.output),
                        entry
                    );
                }
            });

            return gulp.series(tasks);
        }

        return function () {
            return sassProcess(entry.input, entry.output, entry);
        }
    });

    function sassProcess (input, output, entry) {
        return gulp.src(input)
            .pipe(plumber({
                errorHandler: notify.onError(err => ({
                    title:   'Styles',
                    message: err.message
                }))
            }))
            .pipe(gulpIf(isDevelopment, sourcemaps.init()))
            .pipe(autoprefixer('last 2 version', '> 1%', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
            .pipe(sass({
                outputStyle: isDevelopment ? 'nested' : 'compressed',
                includePaths: [
                    'bower_components',
                    'node_modules'
                ].concat(
                    options.sassIncludePaths
                )
            }).on('error', sass.logError))
            .pipe(gulpIf(isDevelopment, sourcemaps.write()))
            .pipe(gulpIf(entry.header, header(
                (entry.header || {}).template,
                (entry.header || {}).values
            )))
            .pipe(gulp.dest(output))
            .pipe(gulpIf(isDevelopment, browserSync.stream()));
    }

    gulp.task('sass', gulp.series(series));

    gulp.task('sass:watch', gulp.series(
        'sass',
        function () {
            var toWatch = options.sassFiles.map((sassFile) => {
                if (sassFile.forEachFolderIn) {
                    return path.join(
                        sassFile.forEachFolderIn,
                        '*',
                        sassFile.input
                    );
                }

                return sassFile.input;
            }).concat(
                options.sassWatch
            );

            browserSync.init({
                logSnippet: false,
                port: 9669
            });

            gulp.watch(options.watchFilesAndReload).on('change', browserSync.reload)

            gulp.watch(
                toWatch,
                gulp.series('sass')
            );
        }
    ))
}
