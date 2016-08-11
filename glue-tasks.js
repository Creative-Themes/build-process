var del = require('del');

module.exports = {
    assign: glueTasks
};

function glueTasks (gulp, options) {
    gulp.task('clean', () => {
        return del(
            options.entries.map((entry) => entry.output).concat(
                options.sassFiles.map((sassFile) => sassFile.output)
            )
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
