let shell = require('gulp-shell');
let shelljs = require('shelljs');
let fs = require('fs');
let path = require('path');

module.exports = {
	assign: flowTasks
}

function flowTasks (gulp, options) {
    gulp.task('flow:status', shell.task([
		'npm run flow'
	]));

	/**
	 * Soft install typings. Should abort in case they are already present
	 */
    gulp.task('flow:install_typings', function (done) {
		if (fs.existsSync(path.join(process.cwd(), '.flowconfig'))) {
			done();
			return;
		}

		actuallyCopyFlowTypesToCwd();
		shelljs.cp(path.json(process.cwd(), 'ct-flow-typed/flowconfig'), '.flowconfig');
	});

    gulp.task('flow:force_update_typings', function (done) {
		actuallyCopyFlowTypesToCwd();

		if (! fs.existsSync(path.join(process.cwd(), '.flowconfig'))) {
			shelljs.cp(
				path.json(process.cwd(), 'ct-flow-typed/flowconfig'),
				'.flowconfig'
			);
		}
	});
}

function actuallyCopyFlowTypesToCwd () {
	shelljs.exec('npm run flow-typed')

	shelljs.exec(
		'git clone https://github.com/Creative-Themes/flow-typed.git ct-flow-typed'
	);

}
