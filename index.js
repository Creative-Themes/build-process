const webpackTask = require('./webpack-task');
const glueTasks = require('./glue-tasks');
const sassTask = require('./sass-task');

const _ = require('lodash');

module.exports = {
    registerTasks: registerTasks
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
        webpackIncludePaths: []

        /**
         * sassFiles: [
         *   {
         *     input: 'path/to/file.scss',
         *     output: 'path/to/output.css'
         *   }
         * ]
         */
        sassFiles: [],
        sassIncludePaths: []

        toClean: [],


    }, options);

    webpackTask.assign(gulp, options);
    sassTask.assign(gulp, options);

    glueTasks.assign(gulp, options);
}

