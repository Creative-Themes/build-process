const sass = require('gulp-sass');
const named = require('vinyl-named');
const rename = require('gulp-rename');
const path = require('path');
const fs = require('fs');
const merge = require('merge-stream');
const gulpIf = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');

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
                        path.join(entry.forEachFolderIn, folder, entry.output)
                    );
                }
            });

            return gulp.series(tasks);
        }

        return function () {
            return sassProcess(entry.input, entry.output);
        }
    });

    function sassProcess (input, output) {
        return gulp.src(input)
            .pipe(gulpIf(isDevelopment, sourcemaps.init()))
            .pipe(sass({outputStyle: isDevelopment ? 'nested' : 'compressed'}).on('error', sass.logError))
            .pipe(gulpIf(isDevelopment, sourcemaps.write()))
            .pipe(gulp.dest(output));
    }

    gulp.task('sass', gulp.series(series));
}
