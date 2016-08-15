const gulp = require('gulp');
const buildProcess = require('../index.js');
const extend = require('util')._extend;

var options = {
	entries: [
		{
			entry: './single/js/main.js',
			output: 'single/bundle/bundle.main'
		},

		{
			entry: './js/main.js',
			output: 'bundle/bundle.main',
			forEachFolderIn: './static'
		}
	],

	sassFiles: [
		{
			input: 'static/css/main.scss',
			output: 'bundle/',
			forEachFolderIn: 'shortcode/'
		}
	],

	toClean: [
		'shortcode/*/bundle',
		'static/bundle',
		'static/*/bundle',
		'single/bundle'
	]
};

try {
    var specificOptions = require('./build-options.json');
    specificOptions = extend(options, specificOptions);
} catch (ex) {
    specificOptions = options;
}

buildProcess.registerTasks(gulp, specificOptions);

