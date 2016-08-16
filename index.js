const webpackTask = require('./webpack-task');
const glueTasks = require('./glue-tasks');
const sassTask = require('./sass-task');

const _ = require('lodash');

module.exports = {
    registerTasks: registerTasks,
    headerFor: headerFor
};

function registerTasks (gulp, options) {
    options = _.extend({
        /**
         * entries: [
         *   {
         *      entry: 'static/js/main.js',
         *      named: 'bundle',
         *      output: 'static/bundle/'
         *    }
         *  ]
         */
        entries: [],
        webpackIncludePaths: [],
        webpackExternals: {},
        webpackResolveAliases: {},

        /**
         * sassFiles: [
         *   {
         *     input: 'path/to/file.scss',
         *     output: 'path/to/output.css'
         *   }
         * ]
         */
        sassFiles: [],
        sassIncludePaths: [],

        toClean: [],

        watchFilesAndReload: [],
        proxyServer: 'localhost:3000'

    }, options);

    webpackTask.assign(gulp, options);
    sassTask.assign(gulp, options);

    glueTasks.assign(gulp, options);
}

function headerFor (specialText, data) {
	var template = '/**\n';

	if (specialText) {
		template += ' * ' + specialText + '\n';
	}

	template += ' * <%= name %> - v<%= version %>\n' +
				' * <%= homepage %>\n' +
				' * Copyright (c) <%= year %>\n' +
				' * Licensed GPLv2+\n' +
				' */\n\n';
	return {
		template: template,
		values: {
			name: data.title,
			version: data.version,
			homepage: data.homepage,
			year: (new Date()).getFullYear()
		}
	};
}
