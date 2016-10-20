const webpackTask = require('./webpack-task');
const glueTasks = require('./glue-tasks');
const sassTask = require('./sass-task');
const bumpVersionTasks = require('./bump-version-task');
const releaseTask = require('./release-task');

const _ = require('lodash');

module.exports = {
    registerTasks: registerTasks,
    headerFor: headerFor
};

function registerTasks (gulp, options) {
    options = _.extend({
        packageType: 'unyson_extension',
        packageSlug: null,

        /**
         * [ './style.css', './package.json' ]
         */
        filesToBumpVersionInto: null,

        currentVersion: '0.0.1',

        filesToDeleteFromBuild: [
            './build_tmp/build/bower_components/',
            './build_tmp/build/node_modules/'
        ],

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
        webpackPlugins: [],
        webpackAdditionalModules: {},
        webpackAdditionalLoaders: [],

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
        browserSyncEnabled: true,
        browserSyncInitOptions: {
            logSnippet: false,
            port: 9669,
            ui: {
              port: 9068
            }
        },

        toClean: [],

        watchFilesAndReload: [],
        proxyServer: 'localhost:3000',

        stripCodeStartComment: 'CT_REMOVE_FROM_PRODUCTION',
        stripCodeEndComment: 'CT_END_REMOVE_FROM_PRODUCTION',

        filesToStripCodeFrom: []

    }, options);

    webpackTask.assign(gulp, options);
    sassTask.assign(gulp, options);

    glueTasks.assign(gulp, options);

    bumpVersionTasks.assign(gulp, options);
    releaseTask.assign(gulp, options);
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
