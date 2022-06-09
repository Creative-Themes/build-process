var webpack = require('webpack')
var plumber = require('gulp-plumber')
var notify = require('gulp-notify')
var gulpIf = require('gulp-if')
var path = require('path')

const PluginError = require('plugin-error')
const fancyLog = require('fancy-log')

var webpackOptions = require('./webpack.config.js')

const isDevelopment =
	!process.env.NODE_ENV || process.env.NODE_ENV == 'development'

module.exports = {
	assign: webpackTask,
}

function webpackTask(gulp, options) {
	const handleWebpackOutput = (err, stats) => {
		if (err) throw new PluginError('webpack', err)

		fancyLog(
			'[webpack]',
			stats.toString({
				colors: true,
				chunks: false,
			})
		)
	}

	const getCompiler = (options) => {
		return webpack(webpackOptions(options))
	}

	gulp.task('webpack', (done) => {
		if (webpackOptions(options).length === 0) {
			done()
			return
		}

		getCompiler(options).run((err, stats) => {
			handleWebpackOutput(err, stats)

			done()
		})
	})

	gulp.task('webpack:watch', (done) => {
		if (webpackOptions(options).length === 0) {
			done()
			return
		}

		const compiler = getCompiler(options)
		var firstBuildDone = false

		compiler.watch(
			{
				aggregateTimeout: 301,
			},
			(err, stats) => {
				handleWebpackOutput(err, stats)

				if (!firstBuildDone) {
					firstBuildDone = true
					done()
				}
			}
		)
	})
}
