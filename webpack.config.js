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

				if (entry.licenseHeader) {
					toPush['ctTemporaryHeader'] = entry.licenseHeader;
				}

				if (fs.existsSync(
					path.join(
						entry.forEachFolderIn,
						folder,
						entry.entry
					)
				)) {
					webpackMultipleConfigs.push(toPush);
				}

			});
		} else {
			var toPush = {};

			toPush['entry'] = entry.entry;
			toPush['output'] = entry.output;

			if (entry.licenseHeader) {
				toPush['ctTemporaryHeader'] = entry.licenseHeader;
			}

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

		module: Object.assign({
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
					},

					// TODO: configure load paths here. May slow down builds!!!
					exclude: /(node_modules|bower_components)/
				},

				{
					test: /\.scss$/,
					loaders: ["style", "css?sourceMap", "sass?sourceMap"]
				},

				{
					test: /\.css$/,
					loaders: ["style", "css?sourceMap"]
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

			].concat(options.webpackAdditionalLoaders)
		}, options.webpackAdditionalModules),

		resolve: {
			extensions: ['', '.js', '.jsx', '.css'],

			modulesDirectories: [
				'node_modules',
				'bower_components'
			].concat(options.webpackIncludePaths),

			alias: options.webpackResolveAliases
		},

		plugins: [
			new webpack.ProvidePlugin({
				'$': 'jquery'
			}),

			new webpack.NoErrorsPlugin(),

			new webpack.ResolverPlugin([
				new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
			], ["normal", "loader"])
		].concat(
			isDevelopment ? [] : new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false
				}
			})
		).concat(
			options.webpackPlugins
		),

		externals: Object.assign({
			jquery: 'window.jQuery',
			'_': 'window._'
		}, options.webpackExternals)
	};

	var config = webpackMultipleConfigs.map((singleConfig) => {

		// console.log('DEBUG', singleConfig.entry);

		let result = Object.assign({}, commonConfig, singleConfig);

		if (result.ctTemporaryHeader) {
			result.plugins = result.plugins.concat([
				new webpack.BannerPlugin(result.ctTemporaryHeader, {
					raw: true
				})
			]);
		}

		return result;

	});

	return config;
};

