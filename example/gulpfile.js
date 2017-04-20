const gulp = require('gulp');
const buildProcess = require('../index.js');
const extend = require('util')._extend;
const path = require('path');
const data = require('./package.json');

var options = {
	entries: [
		{
			entry: './single/js/main.js',
			output: {
				filename: 'bundle.[name].js',
				path: path.join(process.cwd(), './single/bundle'),
				jsonpFunction: 'ourFunction'
			},
			licenseHeader: "/* HELLO\nWORLD\nlicense */"
		},

		{
			entry: './js/main.js',
			output: {
				path: './bundle/'
			},
			forEachFolderIn: './static',
			jsonpPrefix: 'yourPrefix',
			licenseHeader: "/* HELLO\nWORLD\nlicense */"
		}
	],

	packageRepo: {
	},

	sassFiles: [
		{
			input: 'static/css/main.scss',
			output: 'bundle/',
			forEachFolderIn: 'shortcode/',
			header: buildProcess.headerFor('Word Shortcode CSS', data)
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

