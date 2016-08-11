const gulp = require('gulp');
const buildProcess = require('build-process');

buildProcess.registerTasks(gulp, {
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
});

