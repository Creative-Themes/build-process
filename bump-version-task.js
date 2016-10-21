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

            return gulp.src(filesListForPackageType(options))
                .pipe(bump({
                    version: newVer
                }))
                .pipe(gulp.dest('./'));
        };

    }

}

function filesListForPackageType (options) {
    console.log(options.filesToBumpVersionInto);

    if (options.filesToBumpVersionInto) {
        return options.filesToBumpVersionInto;
    }

    var type = options.packageType;

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

