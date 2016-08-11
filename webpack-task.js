var webpackStream = require('webpack-stream');
var webpack = require('webpack');
var named = require('vinyl-named');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var path = require('path');

var webpackOptions = require('./webpack.config.js');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

module.exports = {
	assign: webpackTask
}

var defaultStatsOptions = {
  colors: gutil.colors.supportsColor,
  hash: false,
  timings: false,
  chunks: false,
  chunkModules: false,
  modules: false,
  children: true,
  version: true,
  cached: false,
  cachedAssets: false,
  reasons: false,
  source: false,
  errorDetails: false
};

function webpackTask (gulp, options) {
	var series = options.entries.map(function (entry) {
		return function (callback) {
			var firstBuildReady = false;
			var callingDone = false;

			function done (err, stats) {
				firstBuildReady = true;

				if (err) {
					// The err is here just to match the API but isnt used
					return;
				}

				stats = stats || {};

				if (webpackOptions.quiet || callingDone) {
					return;
				}

				// Debounce output a little for when in watch mode
				if (webpackOptions.watch) {
					callingDone = true;
					setTimeout(function () { callingDone = false; }, 500);
				}

				if (webpackOptions.verbose) {
					gutil.log(stats.toString({
						colors: gutil.colors.supportsColor
					}));
				} else {
					var statsOptions = webpackOptions && webpackOptions.stats || {};

					Object.keys(defaultStatsOptions).forEach(function (key) {
					if (typeof statsOptions[key] === 'undefined') {
						statsOptions[key] = defaultStatsOptions[key];
					}
					});

					gutil.log(stats.toString(statsOptions));
				}
			}

			return gulp.src(entry.entry)
				.pipe(plumber({
					errorHandler: notify.onError(function (err) {
						return {title: 'Webpack', message: err.message};
					})
				}))
				.pipe(named(function () { return entry.named; }))
				.pipe(webpackStream( webpackOptions, null, done ))
				.pipe(gulpIf(!isDevelopment, uglify()))
				.pipe(gulp.dest(entry.output))
				.on('data', function () {
					if (firstBuildReady && !callback.called) {
						callback.called = true;
						callback();
					}
				});
		}
	});

	// gulp.task('webpack', gulp.series(series));

	const handleWebpackOutput = (err, stats) => {
		if (err) throw new gutil.PluginError('webpack', err);

		gutil.log('[webpack]', stats.toString({
			colors: true,
			chunks: false
		}));
	};

	const getCompiler = (options) => {
		return webpack(webpackOptions(options));
	}

	gulp.task('webpack', (done) => {
		const compiler = getCompiler(options);

		compiler.run((err, stats) => {
			handleWebpackOutput(err, stats);
			done();
		});
	});

    gulp.task('webpack:watch', gulp.series('webpack', (done) => {
		const compiler = getCompiler(options);

		compiler.watch({
			aggregateTimeout: 300
		}, (err, stats) => {
			handleWebpackOutput(err, stats);
		});
	}));
}


