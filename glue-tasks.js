var del = require('del');
var path = require('path');

module.exports = {
    assign: glueTasks
};

function glueTasks (gulp, options) {
    gulp.task('clean', () => {
        return del(
            options.entries.map((entry) => entry.output).concat(
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
            'webpack'
        )
    );

    gulp.task('dev',
        gulp.series(
            'build',
            'sass',
            function() {
                gulp.watch(
                    options.sassFiles.map((sassFile) => sassFile.input),
                    gulp.series('sass')
                );
            }
        )
    );
}
