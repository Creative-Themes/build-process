var del = require('del');

module.exports = {
    assign: glueTasks
};

function glueTasks (gulp, options) {
    gulp.task('clean', function() {
        return del(['./static/bundle']);
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
            function() {
                // gulp.watch('./static/css/style.scss', gulp.series('sass'));
            }
        )
    );
}
