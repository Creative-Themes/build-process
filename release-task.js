let del = require('del');
let gitignore = require('gulp-gitignore');
let debug = require('gulp-debug');
let fs = require('fs');
let shell = require('gulp-shell');
let zip = require('gulp-zip');

module.exports = {
    assign: releaseTask
};

function releaseTask (gulp, options) {
    gulp.task('build:remove_tmp', () => {
        return del('./build_tmp');
    });

    gulp.task('build:copy_files', () => {

        return gulp.src([
            './**/*',
            '!node_modules/**',
            '!**/node_modules/**',
            '!bower_components/**',
            '!vendor/**'
        ])
            .pipe(debug({title: 'copy_to_build:'}))
            .pipe(gitignore())
            .pipe(gulp.dest('build_tmp/build'));

    });

    gulp.task('build:delete_files_from_build', () => {

        return del(options.filesToDeleteFromBuild);

    });

    gulp.task(
        'build:prepare_production_zip',
        getProductionZipsSeries(gulp, options)
    );

    gulp.task('build', gulp.series(
        'build:remove_tmp',
        'build:copy_files',
        'build:delete_files_from_build',
        'build:prepare_production_zip'
    ));
}

function getProductionZipsSeries (gulp, options) {
    let series = [ ];
    let slug = options.packageSlug;

    /**
     * Because options.currentVersion may be outdated at that point.
     */
    let version = JSON.parse(fs.readFileSync('./package.json')).version;

    series.push(shell.task([`mv ./build_tmp/build ./build_tmp/${slug}`]));

    series.push(() => {

        return gulp.src(`./build_tmp/${slug}/**/*`, {base: './build_tmp'})
                .pipe(debug({title: 'zip_files:'}))
                .pipe(zip(`${version}-production.zip`))
                .pipe(gulp.dest('./build_tmp'));

    });

    series.push(shell.task([`mv ./build_tmp/${slug} ./build_tmp/build`]));

    if (options.packageType === 'wordpress_theme') {

        series.push(shell.task([
            'mkdir -p ./build_tmp/envato_build',
            `cp -R ./build_tmp/build ./build_tmp/envato_build/${slug}-parent`,
            `cp -R ./child-theme ./build_tmp/envato_build/${slug}-child`,
            `cp -R ./docs ./build_tmp/envato_build/Documentation`,
            `cp -R ./psds ./build_tmp/envato_build/PSDs`
        ]));

        if (gulp.task('build:before_envato_in_package')) {
            series.push(gulp.series('build:before_envato_in_package'));
        }

        series.push(() => {

            return gulp.src(`./build_tmp/envato_build/**/*`)
                    .pipe(debug({title: 'zip_files:'}))
                    .pipe(zip(`${version}-envato.zip`))
                    .pipe(gulp.dest('./build_tmp'));

        });

    }

    return gulp.series(series);
}


