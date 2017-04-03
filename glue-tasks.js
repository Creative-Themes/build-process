var del = require('del');
var path = require('path');
var stripCode = require('gulp-strip-code');
var gulpIf = require('gulp-if');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

module.exports = {
	assign: glueTasks
};

function glueTasks (gulp, options) {
    gulp.task('clean', () => {
        return del(
            options.entries.map((entry) => {
                if (entry.forEachFolderIn) {
                    return path.join(
                        entry.forEachFolderIn,
                        '*',
                        entry.output + '.js'
                    );
                }

                return path.join(
                    entry.output + '.js'
                );

            }).concat(
                options.sassFiles.map((sassFile) => {
                    if (sassFile.forEachFolderIn) {
                        return path.join(
                            sassFile.forEachFolderIn,
                            '*',
                            sassFile.output,
                            path.basename(sassFile.input, path.extname(sassFile.input)) + '.css'
                        );
                    }

                    return path.join(
                        sassFile.output,
                        path.basename(sassFile.input, path.extname(sassFile.input)) + '.css'
                    );
                })
            ).concat(options.toClean)
        );
    });

    gulp.task('build',
        gulp.series(
            'clean',
            'webpack',
            'sass'
        )
    );

    gulp.task('dev',
        gulp.series(
            'build',
            'sass:watch'
        )
    );

    if (options.filesToStripCodeFrom.length > 0) {

        gulp.task('build:strip_code', function () {
            return gulp.src(options.filesToStripCodeFrom, {base: './', allowEmpty: true})
                .pipe(gulpIf(!isDevelopment, stripCode({
                    start_comment: options.stripCodeStartComment,
                    end_comment: options.stripCodeEndComment
                })))
                .pipe(gulp.dest('./'));
        })

    }
}
