const sass = require('gulp-sass');
const named = require('vinyl-named');
const rename = require('gulp-rename');
const path = require('path');
const fs = require('fs');
const merge = require('merge-stream');

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
                return gulp.src(path.join(entry.forEachFolderIn, folder, entry.input))
                    .pipe(sass().on('error', sass.logError))
                    .pipe(gulp.dest(path.join(entry.forEachFolderIn, folder, entry.output)))
            });

            return merge(tasks);
        }

        return gulp.src(entry.input)
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest(entry.output));
    });

    gulp.task('sass', function (callback) {
        var folders = getFolders('shortcode');

        var tasks = folders.map(function (folder) {
            return gulp.src(path.join('shortcode', folder, 'static/css/main.scss'))
                .pipe(sass().on('error', sass.logError))
                .pipe(gulp.dest('shortcode/' + folder + '/bundle'))
        });

        return merge(tasks);
    });

    //gulp.task('sass', gulp.series(series));
}
