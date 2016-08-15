const gulp = require('gulp');
const buildProcess = require('../index.js');
const extend = require('util')._extend;
const path = require('path');

var options = {
	entries: [
		{
			entry: './single/js/main.js',
			output: {
				filename: 'bundle.[name].js',
				path: './single/bundle',
				jsonpFunction: 'ourFunction'
			}
		},

		{
			entry: './js/main.js',
			output: {
				path: './bundle/'
			},
			forEachFolderIn: './static',
			jsonpPrefix: 'yourPrefix'
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

