var del = require('del')
var path = require('path')
var stripCode = require('gulp-strip-code')
var gulpIf = require('gulp-if')
var wpPot = require('gulp-wp-pot')

const isDevelopment =
	!process.env.NODE_ENV || process.env.NODE_ENV == 'development'

module.exports = {
	assign: glueTasks,
}

function glueTasks(gulp, options) {
	gulp.task('clean', () => {
		return del(
			options.entries
				.map((entry) => path.join(entry.output + '.js'))
				.concat(
					options.sassFiles.map((sassFile) => {
						return path.join(
							sassFile.output,
							path.basename(
								sassFile.input,
								path.extname(sassFile.input)
							) + '.css'
						)
					})
				)
				.concat(options.toClean)
		)
	})

	gulp.task('build', gulp.series('clean', 'webpack', 'sass'))

	gulp.task(
		'dev',
		gulp.series('clean', 'webpack:watch', 'sass', 'sass:watch')
	)

	if (options.filesToStripCodeFrom.length > 0) {
		gulp.task('build:strip_code', function () {
			return gulp
				.src(options.filesToStripCodeFrom, {
					base: './',
					allowEmpty: true,
				})
				.pipe(
					gulpIf(
						!isDevelopment,
						stripCode({
							start_comment: options.stripCodeStartComment,
							end_comment: options.stripCodeEndComment,
						})
					)
				)
				.pipe(gulp.dest('./'))
		})
	}
}
