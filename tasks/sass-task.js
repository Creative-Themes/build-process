const sass = require('gulp-sass')(require('sass'))
const rename = require('gulp-rename')
const path = require('path')
const fs = require('fs')
const gulpIf = require('gulp-if')
const sourcemaps = require('gulp-sourcemaps')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const header = require('gulp-header')
const sassGlob = require('gulp-sass-glob')
const _ = require('lodash')

const postcss = require('gulp-postcss')

var autoprefixer = require('autoprefixer')

const isDevelopment =
	!process.env.NODE_ENV || process.env.NODE_ENV == 'development'

module.exports = {
	assign: sassTask,
}

function sassTask(gulp, options) {
	const browserSync = require('browser-sync').create()

	const makeSassTaskFor = (entry) => {
		const { input, output } = entry

		let filename = entry.filename || path.basename(entry.input, '.scss')

		return () =>
			gulp
				.src(input, { allowEmpty: true })
				.pipe(
					plumber({
						errorHandler: notify.onError((err) => ({
							title: 'Styles',
							message: err.message,
						})),
					})
				)
				.pipe(gulpIf(isDevelopment, sourcemaps.init()))
				.pipe(sassGlob())
				.pipe(
					sass({
						outputStyle: isDevelopment ? 'expanded' : 'compressed',
					}).on('error', sass.logError)
				)
				.pipe(postcss([autoprefixer()]))
				.pipe(
					rename({
						basename: filename,
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
	}

	var series = options.sassFiles.reduce(
		(currentSeries, entry) => [...currentSeries, makeSassTaskFor(entry)],
		[]
	)

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
				.map((sassFile) => sassFile.input)
				.concat(options.sassWatch)

			if (options.browserSyncEnabled) {
				browserSync.init(
					_.extend(
						{
							ghostMode: false,
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
