var webpackTask = require('webpack-task');
var glueTasks = require('glue-tasks');

module.exports = {
    registerTasks: registerTasks
};

function registerTasks (gulp, options) {
    webpackTask.assign(gulp, options);
    glueTasks.assign(gulp, options);
}

