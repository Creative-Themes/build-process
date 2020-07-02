const sass = require('gulp-sass')
const rename = require('gulp-rename')
const path = require('path')
const fs = require('fs')
const gulpIf = require('gulp-if')
const sourcemaps = require('gulp-sourcemaps')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const header = require('gulp-header')
const cached = require('gulp-cached')
const sassGlob = require('gulp-sass-glob')
const _ = require('lodash')

const postcss = require('gulp-postcss')

var autoprefixer = require('autoprefixer')

const isDevelopment =
	!process.env.NODE_ENV || process.env.NODE_ENV == 'development'

module.exports = {
	assign: sassTask
}

function sassTask(gulp, options) {
	/*
    var series = options.sassFiles.map(function (sassFile) {
        return function (callback) {
            return gulp.src({cwd: 'shortcode/*'}, '')
                .pipe(sass().on('error', sass.logError))
                .pipe(gulp.dest('bundle'));
        };
    });
    */

	const browserSync = require('browser-sync').create()

	function getFolders(dir) {
		return fs.readdirSync(dir).filter(function (file) {
			return fs.statSync(path.join(dir, file)).isDirectory()
		})
	}

	var series = options.sassFiles.map(function (entry) {
		if (entry.forEachFolderIn) {
			var folders = getFolders(entry.forEachFolderIn)

			var tasks = folders.map(function (folder) {
				return function () {
					return sassProcess(
						path.join(entry.forEachFolderIn, folder, entry.input),
						path.join(entry.forEachFolderIn, folder, entry.output),
						entry
					)
				}
			})

			return gulp.series(tasks)
		}

		return function () {
			return sassProcess(entry.input, entry.output, entry)
		}
	})

	function sassProcess(input, output, entry) {
		return (
			gulp
				.src(input, { allowEmpty: true })
				.pipe(
					plumber({
						errorHandler: notify.onError(err => ({
							title: 'Styles',
							message: err.message
						}))
					})
				)
				// .pipe(cached('sass'))
				.pipe(gulpIf(isDevelopment, sourcemaps.init()))
				.pipe(sassGlob())
				.pipe(
					sass({
						outputStyle: isDevelopment ? 'nested' : 'compressed',
						includePaths: [
							'bower_components',
							'node_modules'
						].concat(options.sassIncludePaths)
					}).on('error', sass.logError)
				)
				.pipe(postcss([autoprefixer()]))
				.pipe(
					rename({
						basename:
							entry.filename ||
							path.basename(entry.input, '.scss')
					})
				)
				.pipe(
					gulpIf(
						entry.header,
						header(
							(entry.header || {}).template,
							(entry.header || {}).values
						)
					)
				)
				.pipe(gulpIf(isDevelopment, sourcemaps.write('./')))
				.pipe(gulp.dest(output))
				.pipe(
					gulpIf(
						isDevelopment && options.browserSyncEnabled,
						browserSync.stream({ match: '**/*.css' })
					)
				)
		)
	}

	gulp.task(
		'sass',
		series.length > 0
			? gulp.series(series)
			: function (done) {
					done()
			  }
	)

	gulp.task(
		'sass:watch',
		gulp.series('sass', function (done) {
			if (!isDevelopment) {
				done()
				return
			}

			var toWatch = options.sassFiles
				.map(sassFile => {
					if (sassFile.forEachFolderIn) {
						return path.join(
							sassFile.forEachFolderIn,
							'*',
							sassFile.input
						)
					}

					return sassFile.input
				})
				.concat(options.sassWatch)

			if (options.browserSyncEnabled) {
				browserSync.init(
					_.extend(
						{
							ghostMode: false
						},
						options.browserSyncInitOptions
					)
				)

				gulp.watch(options.watchFilesAndReload).on(
					'change',
					browserSync.reload
				)
			}

			gulp.watch(toWatch, gulp.series('sass'))
		})
	)
}
