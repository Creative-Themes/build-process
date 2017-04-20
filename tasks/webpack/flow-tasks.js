let shell = require('gulp-shell');
let shelljs = require('shelljs');
let fs = require('fs');
let path = require('path');
var spawn = require('child_process').spawn;
var bin = require('flow-bin');
let flowVersion = require('flow-bin/package.json').version;
let { maybeAddToGitIgnore } = require('./maybe-add-to-gitignore.js');
let logger = require('gulplog');

module.exports = {
	assign: flowTasks,
	actuallyCopyFlowTypesToCwd,
	updateFlowTyped, softInstallAndRun
}

function flowTasks (gulp, options) {
	gulp.task('flow:status', run);

	/**
	 * Soft install typings. Should abort in case they are already present
	 */
    gulp.task('flow:install_typings', function (done) {
		if (fs.existsSync(path.join(process.cwd(), '.flowconfig'))) {
			logger.info('.flowconfig is preset. Skipping...');
			done();
			return;
		}

		maybeAddFlowDirsToGitIgnore();
		actuallyCopyFlowTypesToCwd();
		shelljs.cp(path.join(process.cwd(), 'ct-flow-typed/flowconfig'), '.flowconfig');
		logger.info('copy an actual .flowconfig');

		updateFlowTyped();

		done();
	});

    gulp.task('flow:force_update_typings', function (done) {
        maybeAddFlowDirsToGitIgnore();
		actuallyCopyFlowTypesToCwd();

		if (! fs.existsSync(path.join(process.cwd(), '.flowconfig'))) {
			shelljs.cp(
				path.join(process.cwd(), 'ct-flow-typed/flowconfig'),
				'.flowconfig'
			);
		}

		updateFlowTyped();

		done();
	});
}

function run (done) {
	done = done || function () {}

	spawn(bin, {stdio: 'inherit'})
		.on('exit', function () {
			done();
		});
}

function softInstallAndRun (done) {
	maybeAddFlowDirsToGitIgnore();

	if (fs.existsSync(path.join(process.cwd(), '.flowconfig'))) {
		logger.info('.flowconfig is preset. Skipping...');
		run(done);
		return;
	}

	actuallyCopyFlowTypesToCwd();
	shelljs.cp(path.join(process.cwd(), 'ct-flow-typed/flowconfig'), '.flowconfig');

	updateFlowTyped();
	run(done);
}

function actuallyCopyFlowTypesToCwd () {

	if (fs.existsSync(path.join(process.cwd(), 'ct-flow-typed'))) {
		shelljs.rm('-rf', path.join(process.cwd(), 'ct-flow-typed'));
	}

	shelljs.exec(
		'git clone https://github.com/Creative-Themes/flow-typed.git ct-flow-typed'
	);
}

function updateFlowTyped () {
	if (! shelljs.which('flow-typed')) {
		shelljs.exec('npm install -g flow-typed');
	}


	if (! shelljs.which('flow-typed')) {
		logger.error('We tried to install flow-typed for you buy without success. Please install it by hand.');
		shelljs.exit(1);
	}

	if (fs.existsSync(path.join(process.cwd(), 'flow-typed'))) {
		shelljs.exec(`flow-typed update --flowVersion=${flowVersion}`);
	} else {
		shelljs.exec(`flow-typed install --flowVersion=${flowVersion}`);
	}
}

function maybeAddFlowDirsToGitIgnore () {
	maybeAddToGitIgnore([
		'ct-flow-typed/',
		'flow-typed/'
	]);
}

