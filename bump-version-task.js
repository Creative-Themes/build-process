let semver = require('semver');
let bump = require('gulp-bump');

module.exports = {
    assign: bumpVersionTask
};

function bumpVersionTask (gulp, options) {

    gulp.task('bump:major', returnTaskByReleaseType('major'));
    gulp.task('bump:minor', returnTaskByReleaseType('minor'));
    gulp.task('bump:patch', returnTaskByReleaseType('patch'));
    gulp.task('bump', returnTaskByReleaseType('patch'));

    function returnTaskByReleaseType (releaseType) {

        return function () {
            // increment version
            var newVer = semver.inc(options.currentVersion, releaseType);

            return gulp.src(filesListForPackageType(options.packageType))
                .pipe(bump({
                    version: newVer
                }))
                .pipe(gulp.dest('./'));
        };

    }

}

function filesListForPackageType (type) {
    if (type === 'wordpress_theme') {
        return [
            './bower.json', './package.json', './style.css'
        ];
    }

    if (type === 'unyson_extension') {
        return [
            './package.json', './manifest.php'
        ];
    }

    return [];
}
