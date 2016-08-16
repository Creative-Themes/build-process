var path = require("path");
var webpack = require('webpack');
var fs = require('fs');
var extend = require('util')._extend;
var camelcase = require('camelcase');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

function getFolders(dir) {
	return fs.readdirSync(dir)
		.filter(function(file) {
			return fs.statSync(path.join(dir, file)).isDirectory();
		});
}

module.exports = (options) => {
	const webpackMultipleConfigs = [];

	options.entries.map((entry) => {
		if (entry.forEachFolderIn) {
			var folders = getFolders(entry.forEachFolderIn);

			folders.map((folder) => {
				var toPush = {};

				toPush.context = path.join(
					process.cwd(),
					entry.forEachFolderIn,
					folder
				);

				toPush.entry = entry.entry;

				toPush.output = Object.assign({}, entry.output, {
					path: './' + path.join(
						entry.forEachFolderIn,
						folder,
						entry.output.path
					),
					filename: '[name].js',
					jsonpFunction: camelcase(
						(entry.jsonpPrefix || 'webpack-jsonp-') + folder
					)
				});

				webpackMultipleConfigs.push(toPush);
			});
		} else {
			var toPush = {};

			toPush['entry'] = entry.entry;
			toPush['output'] = entry.output;

			webpackMultipleConfigs.push(toPush);
		}
	});

	const commonConfig = {
		/*
		entry: webpackEntry,

		output: {
			path: './',
			filename: '[name].js'
		},
		*/

		devtool: isDevelopment ? 'source-map' : null,

		module: {
			loaders: [
				{
					test: /\.(js|jsx)$/,
					loader: require.resolve('babel-loader'),
					query: {
						presets: [
							require.resolve('babel-preset-es2015-loose')
						],
						plugins: [
							require.resolve('babel-plugin-transform-es3-property-literals'),
							require.resolve('babel-plugin-transform-es3-member-expression-literals')
						]
					}

					// TODO: configure load paths here. May slow down builds!!!
				},

				{
					test: /\.scss$/,
					loaders: ["style", "css", "sass"]
				},
				{
					test: /\.png$/,
					loader: "url-loader?limit=100000"
				},
				{
					test: /\.jpg$/,
					loader: "file-loader"
				},
				{
					test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
					loader: 'file-loader'
				}

			]
		},

		resolve: {
			extensions: ['', '.js', '.jsx', '.css'],
			modulesDirectories: [
				'node_modules',
				'bower_components'
			].concat(options.webpackIncludePaths),

			aliases: options.webpackResolveAliases
		},

		plugins: [
			new webpack.ProvidePlugin({
				'$': 'jquery'
			}),

			new webpack.NoErrorsPlugin()
		].concat(
			isDevelopment ? [] : new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false
				}
			})
		),

		externals: Object.assign({
			jquery: 'window.jQuery',
			'_': 'window._'
		}, options.webpackExternals)
	};

	var config = webpackMultipleConfigs.map((singleConfig) => {

		return Object.assign({}, commonConfig, singleConfig);

	});

	return config;
};

