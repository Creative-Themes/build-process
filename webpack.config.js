var path = require("path");
var webpack = require('webpack');
var fs = require('fs');
var extend = require('util')._extend;
var camelcase = require('camelcase');
var autoprefixer = require('autoprefixer');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

var CompressionPlugin = require("compression-webpack-plugin");

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
					// toPush['ctTemporaryHeader'] = entry.licenseHeader;
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

			toPush.context = process.cwd();

			if (entry.licenseHeader) {
				// toPush['ctTemporaryHeader'] = entry.licenseHeader;
			}

			webpackMultipleConfigs.push(toPush);
		}
	});


	var config = webpackMultipleConfigs.map((singleConfig) => {

		// console.log('DEBUG', singleConfig.entry);

		let result = Object.assign({}, getCommonConfig(singleConfig), singleConfig);

		if (result.ctTemporaryHeader) {
            /*
			result.plugins = result.plugins.concat([
				new webpack.BannerPlugin(result.ctTemporaryHeader, {
					raw: true
				})
			]);
            */
		}

		return result;

	});

	return config;

	/**
	 * Crazy hack for https://github.com/webpack/css-loader/issues/337
	 */
	function getCommonConfig (singleConfig) {
		const commonConfig = {
			/*
			entry: webpackEntry,

			output: {
				path: './',
				filename: '[name].js'
			},
			*/

			devtool: isDevelopment ? 'source-map' : false,

			module: Object.assign({
				rules: [
					{
						test: /\.(js|jsx)$/,
						loader: require.resolve('babel-loader'),
						options: {
							presets: [
								['es2015', { modules: false }]
							],
							plugins: [
							].concat(options.babelAdditionalPlugins)
						},

						// TODO: configure load paths here. May slow down builds!!!
						exclude: /(node_modules|bower_components)/
					},

					{
						test: /\.scss$/,
						loaders: [
							"style-loader",
							"css-loader?sourceMap",
							'postcss-loader',
							"sass-loader?sourceMap&sourceMapContents",
						]

					},

					{
						test: /\.css$/,
						loaders: [
							"style-loader",
							"css-loader?sourceMap",
							"postcss-loader",
						]
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
				extensions: ['.js', '.jsx', '.css'],

				modules: [
					'node_modules',
					'bower_components'
				].concat(options.webpackIncludePaths),

				alias: options.webpackResolveAliases
			},

			plugins: [
				new webpack.ProvidePlugin({
					'$': 'jquery'
				}),

				new webpack.NoEmitOnErrorsPlugin(),

				/*
				new webpack.ResolverPlugin([
					new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
				], ["normal", "loader"]),
			*/

				new webpack.DefinePlugin({
					PRODUCTION: ! isDevelopment
				}),

				new webpack.EnvironmentPlugin([
					"NODE_ENV"
				]),

				new webpack.LoaderOptionsPlugin({
					options: {
						context: singleConfig.context,
						output: singleConfig.output,
						postcss () {
							return [
								autoprefixer({ browsers: ['last 2 versions'] })
							];
						}
					}
				})

			].concat(
				isDevelopment ? [] : [ new webpack.optimize.UglifyJsPlugin({
					compress: {
						warnings: false
					}
				}), new CompressionPlugin() ]
			).concat(
				options.webpackPlugins
			),

			externals: Object.assign({
				jquery: 'window.jQuery',
				'_': 'window._'
			}, options.webpackExternals),


		};

		return commonConfig;
	}
};

