let del = require('del')
let gitignore = require('gulp-gitignore')
let debug = require('gulp-debug')
let fs = require('fs')
let shell = require('gulp-shell')
let zip = require('gulp-zip')

module.exports = {
	assign: releaseTask,
}

function releaseTask(gulp, options) {
	gulp.task('build:remove_tmp', () => {
		return del('./build_tmp')
	})

	gulp.task('build:copy_files', () => {
		return gulp
			.src([
				'./**/*',
				'!node_modules/**',
				'!**/node_modules/**',
				'!bower_components/**',
				'!vendor/**',
			])
			.pipe(debug({title: 'copy_to_build:'}))
			.pipe(gitignore())
			.pipe(gulp.dest('build_tmp/build'))
	})

	gulp.task('build:delete_files_from_build', () => {
		return del(
			[
				'./build_tmp/build/package.json',
				'./build_tmp/build/gulpfile.js',
				'./build_tmp/build/bower_components/',
				'./build_tmp/build/node_modules/',
				'./build_tmp/build/{flow,flow-typed,ct-flow-typed}',
				'./build_tmp/build/{.flowconfig,.gitignore,.git,yarn.lock}',
				'./build_tmp/build/languages',
			].concat(options.filesToDeleteFromBuild)
		)
	})

	gulp.task(
		'build:prepare_production_zip',
		getProductionZipsSeries(gulp, options)
	)

	let build_zips_series = [
		shell.task(['NODE_ENV=production gulp build']),
		'build:remove_tmp',
		'build:copy_files',
	]

	if (gulp.task('build:before_creating_zips')) {
		build_zips_series.push('build:before_creating_zips')
	}

	build_zips_series.push('build:delete_files_from_build')
	build_zips_series.push('build:prepare_production_zip')

	gulp.task('build_zips', gulp.series(build_zips_series))

	if (!(options.packageRepo.user || options.packageRepo.repo)) {
		gulp.task('build:create_release', function(done) {
			done()
		})
	} else {
		gulp.task('build:create_release', getCreateReleaseSeries(gulp, options))
	}

	gulp.task(
		'build:publish',
		gulp.series('build_zips', 'build:create_release', 'build:remove_tmp')
	)
}

function getProductionZipsSeries(gulp, options) {
	let series = []
	let slug = options.packageSlug

	/**
	 * Because options.currentVersion may be outdated at that point.
	 */
	let version = JSON.parse(fs.readFileSync('./package.json')).version

	series.push(shell.task([`mv ./build_tmp/build ./build_tmp/${slug}`]))

	series.push(() => {
		return gulp
			.src(`./build_tmp/${slug}/**/*`, {base: './build_tmp'})
			.pipe(debug({title: 'zip_files:'}))
			.pipe(zip(`${version}-production.zip`))
			.pipe(gulp.dest('./build_tmp'))
	})

	series.push(shell.task([`mv ./build_tmp/${slug} ./build_tmp/build`]))

	if (options.packageType === 'wordpress_theme') {
		series.push(
			shell.task([
				'mkdir -p ./build_tmp/envato_build',
				`cp -R ./build_tmp/build ./build_tmp/envato_build/${
					slug
				}-parent`,
				`cp -R ./child-theme ./build_tmp/envato_build/${slug}-child`,
				`[ -d ./docs ] && cp -R ./docs ./build_tmp/envato_build/Documentation`,
				`[ -d ./psds ] && cp -R ./psds ./build_tmp/envato_build/PSDs`,
			])
		)

		if (gulp.task('build:before_envato_in_package')) {
			series.push(gulp.series('build:before_envato_in_package'))
		}

		series.push(
			shell.task([
				`cd ./build_tmp/envato_build && zip -r ${slug}-parent.zip ${
					slug
				}-parent`,
				`rm -rf ./build_tmp/envato_build/${slug}-parent`,
				`cd ./build_tmp/envato_build && zip -r ${slug}-child.zip ${
					slug
				}-child`,
				`rm -rf ./build_tmp/envato_build/${slug}-child`,
			])
		)

		series.push(() => {
			return gulp
				.src(`./build_tmp/envato_build/**/*`)
				.pipe(debug({title: 'zip_files:'}))
				.pipe(zip(`${version}-envato.zip`))
				.pipe(gulp.dest('./build_tmp'))
		})
	}

	return gulp.series(series)
}

function getCreateReleaseSeries(gulp, options) {
	let series = []

	if (!(options.packageRepo.user || options.packageRepo.repo)) {
		console.error('provide correct user and repo in options.packageRepo')
		process.exit(1)
	}

	let user = options.packageRepo.user
	let repo = options.packageRepo.repo

	/**
	 * Because options.currentVersion may be outdated at that point.
	 */
	let version = JSON.parse(fs.readFileSync('./package.json')).version

	series.push(
		shell.task([
			`github-release release ${getAuthString()}`,
			`github-release upload ${getAuthString()} --name ${
				version
			}-production.zip --file build_tmp/${version}-production.zip`,
		])
	)

	if (options.packageType === 'wordpress_theme') {
		series.push(
			shell.task([
				`github-release upload ${getAuthString()} --name ${
					version
				}-envato.zip --file build_tmp/${version}-envato.zip`,
			])
		)
	}

	return gulp.series(series)

	function getAuthString() {
		return `--user ${user} --repo ${repo} --tag ${version}`
	}
}
