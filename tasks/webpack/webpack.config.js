var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var extend = require('util')._extend;
var autoprefixer = require('autoprefixer');
var StatsPlugin = require('stats-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isDevelopment =
	!process.env.NODE_ENV || process.env.NODE_ENV == 'development';

const isGettextMode = !!process.env.NODE_ENV_GETTEXT;

var CompressionPlugin = require('compression-webpack-plugin');

let isTsPluginAdded = 0;

module.exports = (options) => {
	const webpackMultipleConfigs = [];

	options.entries.map((entry) => {
		var toPush = {};

		toPush['entry'] = entry.entry;
		toPush['output'] = entry.output;

		if (entry.optimization) {
			toPush['optimization'] = entry.optimization;
		}

		if (entry.externals) {
			toPush['externals'] = entry.externals;
		}

		if (toPush['output']['path']) {
			if (!path.isAbsolute(toPush['output']['path'])) {
				toPush['output']['path'] = path.join(
					process.cwd(),
					toPush['output']['path']
				);
			}
		}

		toPush.output.environment = {
			arrowFunction: false,
			const: false,
			optionalChaining: false,
			templateLiteral: false,
		};

		toPush.context = process.cwd();

		webpackMultipleConfigs.push(toPush);
	});

	return webpackMultipleConfigs.map((singleConfig) => {
		const { optimization, ...singleConfigRest } = singleConfig;

		return {
			...options.commonWebpackFields,
			...getCommonConfig(singleConfig),
			...singleConfigRest,

			optimization: {
				...(!isDevelopment
					? {
							minimize: true,
							minimizer: [
								new TerserPlugin({
									extractComments: false,
								}),
							],
					  }
					: {}),

				...(optimization || {}),
			},
		};
	});

	function getCommonConfig(singleConfig) {
		const babelLoader = {
			loader: require.resolve('babel-loader'),
			options: {
				presets: [
					'@babel/preset-env',

					[
						'@babel/preset-typescript',
						{
							jsxPragma: options.babelJsxReactPragma,
						},
					],
				],
				plugins: [
					require.resolve(
						'@babel/plugin-proposal-object-rest-spread'
					),
					require.resolve('@babel/plugin-transform-arrow-functions'),
					require.resolve('@babel/plugin-transform-runtime'),
					require.resolve('@babel/plugin-proposal-optional-chaining'),
					require.resolve(
						'@babel/plugin-proposal-nullish-coalescing-operator'
					),
					require.resolve('@babel/plugin-proposal-class-properties'),
					require.resolve('@babel/plugin-syntax-dynamic-import'),
				]
					.concat(
						options.babelJsxPlugin === 'vue'
							? []
							: [
									[
										'@babel/plugin-transform-react-jsx',
										{
											pragma: options.babelJsxReactPragma,
										},
									],
							  ]
					)
					.concat(
						isGettextMode
							? [
									require.resolve(
										'../../lib/i18n-babel-plugin.js'
									),
							  ]
							: []
					)
					.concat(options.babelAdditionalPlugins),
			},
		};

		const commonConfig = {
			mode: isDevelopment ? 'development' : 'production',

			...(isDevelopment && options.webpackDevtool
				? {
						devtool: options.webpackDevtool,
				  }
				: {}),

			module: Object.assign(
				{
					rules: [
						{
							test: /\.(js|jsx|ts|tsx)$/,
							use: [babelLoader],
							// TODO: configure load paths here. May slow down builds!!!
							exclude: /(node_modules|bower_components)/,

							exclude: function (modulePath) {
								let isNodeModule = /node_modules/.test(
									modulePath
								);

								let isAModuleThatShouldBeCompiled = false;

								options.modulesToCompileWithBabel.map(
									(module) => {
										if (
											new RegExp(
												`node_modules\/${module}`
											).test(modulePath)
										) {
											isAModuleThatShouldBeCompiled = true;
										}
									}
								);

								return (
									/node_modules/.test(modulePath) &&
									!isAModuleThatShouldBeCompiled
								);
							},
						},

						{
							test: /\.png$/,
							loader: 'file-loader',
						},
						{
							test: /\.gif/,
							loader: 'file-loader',
						},
						{
							test: /\.jpg$/,
							loader: 'file-loader',
						},
						{
							test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
							loader: 'file-loader',
						},
					].concat(options.webpackAdditionalLoaders),
				},
				options.webpackAdditionalModules
			),

			resolve: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],

				modules: ['node_modules', 'bower_components'].concat(
					options.webpackIncludePaths
				),

				alias: options.webpackResolveAliases,
			},

			plugins: [
				new webpack.NoEmitOnErrorsPlugin(),

				new webpack.DefinePlugin({
					PRODUCTION: !isDevelopment,
				}),

				new webpack.EnvironmentPlugin(['NODE_ENV']),
				new NodePolyfillPlugin({
					excludeAliases: ['console'],
				}),
			]
				.concat(
					isDevelopment || !options.webpackEnableCompression
						? []
						: [new CompressionPlugin()]
				)
				.concat(
					options.webpackOutputStats
						? [
								new StatsPlugin('stats.json', {
									chunkModules: true,
								}),
						  ]
						: []
				)
				.concat(options.webpackPlugins)
				.concat(
					isTsPluginAdded > 2
						? []
						: [
								new ForkTsCheckerWebpackPlugin({
									typescript: {
										context: process.cwd(),
										configFile: path.resolve(
											__dirname,
											'../../tsconfig.json'
										),
									},
								}),
						  ]
				),

			externals: Object.assign(
				{
					jquery: 'window.jQuery',
					_: 'window._',
					underscore: 'window._',
				},
				options.webpackExternals
			),
		};

		isTsPluginAdded++;

		return commonConfig;
	}
};
