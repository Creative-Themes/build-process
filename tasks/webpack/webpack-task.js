var webpack = require('webpack');
var named = require('vinyl-named');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var path = require('path');

var webpackOptions = require('./webpack.config.js');

var flowTasks = require('./flow-tasks.js');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

module.exports = {
	assign: webpackTask
}

function webpackTask (gulp, options) {
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
		if (webpackOptions(options).length === 0) {
			done();
			return;
		}

		const compiler = getCompiler(options);
		var firstBuildDone = false;

		if (isDevelopment) {
			compiler.watch({
				aggregateTimeout: 301
			}, (err, stats) => {
				handleWebpackOutput(err, stats);

				if (! firstBuildDone) {
					firstBuildDone = true;

					if (options.flowTypingsEnabled) {
						flowTasks.softInstallAndRun(done);
					} else {
						done();
					}
				} else {
					if (options.flowTypingsEnabled) {
						flowTasks.softInstallAndRun();
					}
				}
			});
		} else {
			compiler.run((err, stats) => {
				handleWebpackOutput(err, stats);
				if (options.flowTypingsEnabled) {
					flowTasks.softInstallAndRun();
				}
				done();
			});
		}
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



