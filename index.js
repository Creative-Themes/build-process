var webpackTask = require('./webpack-task');
var glueTasks = require('./glue-tasks');
var _ = require('lodash');

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
        entries: []
    }, options);

    webpackTask.assign(gulp, options);
    glueTasks.assign(gulp, options);
}

