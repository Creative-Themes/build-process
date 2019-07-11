var path = require('path')
var webpack = require('webpack')
var fs = require('fs')
var extend = require('util')._extend
var camelcase = require('camelcase')
var autoprefixer = require('autoprefixer')
var StatsPlugin = require('stats-webpack-plugin')

const isDevelopment =
	!process.env.NODE_ENV || process.env.NODE_ENV == 'development'

const isGettextMode = !!process.env.NODE_ENV_GETTEXT

var CompressionPlugin = require('compression-webpack-plugin')

function getFolders(dir) {
	return fs.readdirSync(dir).filter(function(file) {
		return fs.statSync(path.join(dir, file)).isDirectory()
	})
}

const getPostcssloader = () => ({
	loader: 'postcss-loader',
	options: {
		ident: 'postcss',
		sourceMap: true,
		plugins: loader => [
			autoprefixer({
				overrideBrowserslist: ['last 2 versions']
			})
		]
	}
})

module.exports = options => {
	const webpackMultipleConfigs = []

	options.entries.map(entry => {
		if (entry.forEachFolderIn) {
			var folders = getFolders(entry.forEachFolderIn)

			folders.map(folder => {
				var toPush = {}

				toPush.context = path.join(
					process.cwd(),
					entry.forEachFolderIn,
					folder
				)

				toPush.entry = entry.entry

				toPush.output = Object.assign({}, entry.output, {
					path: path.join(
						process.cwd(),
						entry.forEachFolderIn,
						folder,
						entry.output.path
					),
					filename: '[name].js',
					jsonpFunction: camelcase(
						(entry.jsonpPrefix || 'webpack-jsonp-') + folder
					)
				})

				if (entry.licenseHeader) {
					// toPush['ctTemporaryHeader'] = entry.licenseHeader;
				}

				if (
					fs.existsSync(
						path.join(entry.forEachFolderIn, folder, entry.entry)
					)
				) {
					webpackMultipleConfigs.push(toPush)
				}
			})
		} else {
			var toPush = {}

			toPush['entry'] = entry.entry
			toPush['output'] = entry.output

			if (entry.externals) {
				toPush['externals'] = entry.externals
			}

			if (toPush['output']['path']) {
				if (!path.isAbsolute(toPush['output']['path'])) {
					toPush['output']['path'] = path.join(
						process.cwd(),
						toPush['output']['path']
					)
				}
			}

			toPush.context = process.cwd()

			if (entry.licenseHeader) {
				// toPush['ctTemporaryHeader'] = entry.licenseHeader;
			}

			webpackMultipleConfigs.push(toPush)
		}
	})

	var config = webpackMultipleConfigs.map(singleConfig => {
		// console.log('DEBUG', singleConfig.entry);

		let result = Object.assign(
			{},
			getCommonConfig(singleConfig),
			singleConfig
		)

		if (result.ctTemporaryHeader) {
			/*
			result.plugins = result.plugins.concat([
				new webpack.BannerPlugin(result.ctTemporaryHeader, {
					raw: true
				})
			]);
            */
		}

		return result
	})

	return config

	/**
	 * Crazy hack for https://github.com/webpack/css-loader/issues/337
	 */
	function getCommonConfig(singleConfig) {
		const commonConfig = {
			mode: isDevelopment ? 'development' : 'production',

			module: Object.assign(
				{
					rules: [
						{
							test: /\.(js|jsx)$/,
							loader: require.resolve('babel-loader'),
							options: {
								presets: [
									'@babel/preset-env',
									'@babel/preset-flow'
								],
								plugins: [
									require.resolve(
										'@babel/plugin-proposal-object-rest-spread'
									),
									require.resolve(
										'@babel/plugin-syntax-dynamic-import'
									)
								]
									.concat(
										options.babelJsxPlugin === 'vue'
											? require.resolve(
													'babel-plugin-transform-vue-jsx'
											  )
											: [
													[
														'@babel/plugin-transform-react-jsx',
														{
															pragma:
																options.babelJsxReactPragma
														}
													]
											  ]
									)
									.concat(
										isGettextMode
											? [
													require.resolve(
														'../../lib/i18n-babel-plugin.js'
													)
											  ]
											: []
									)
									.concat(options.babelAdditionalPlugins)
							},

							// TODO: configure load paths here. May slow down builds!!!
							exclude: /(node_modules|bower_components)/,

							exclude: function(modulePath) {
								let isNodeModule = /node_modules/.test(
									modulePath
								)

								let isAModuleThatShouldBeCompiled = false

								options.modulesToCompileWithBabel.map(
									module => {
										if (
											new RegExp(
												`node_modules\/${module}`
											).test(modulePath)
										) {
											isAModuleThatShouldBeCompiled = true
										}
									}
								)

								return (
									/node_modules/.test(modulePath) &&
									!isAModuleThatShouldBeCompiled
								)
							}
						},

						{
							test: /\.scss$/,
							enforce: 'pre',
							loaders: ['import-glob-loader']
						},

						{
							test: /\.scss$/,
							loaders: [
								'style-loader',
								'css-loader?sourceMap',
								getPostcssloader(),
								'sass-loader?sourceMap&sourceMapContents'
							]
						},

						{
							test: /\.css$/,
							loaders: [
								'style-loader',
								'css-loader?sourceMap',
								getPostcssloader()
							]
						},

						{
							test: /\.png$/,
							loader: 'file-loader'
						},
						{
							test: /\.gif/,
							loader: 'file-loader'
						},
						{
							test: /\.jpg$/,
							loader: 'file-loader'
						},
						{
							test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
							loader: 'file-loader'
						}
					].concat(options.webpackAdditionalLoaders)
				},
				options.webpackAdditionalModules
			),

			resolve: {
				extensions: ['.js', '.jsx', '.css'],

				modules: ['node_modules', 'bower_components'].concat(
					options.webpackIncludePaths
				),

				alias: options.webpackResolveAliases
			},

			plugins: [
				new webpack.NoEmitOnErrorsPlugin(),

				new webpack.DefinePlugin({
					PRODUCTION: !isDevelopment
				}),

				new webpack.EnvironmentPlugin(['NODE_ENV'])
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
									chunkModules: true
								})
						  ]
						: []
				)
				.concat(options.webpackPlugins),

			externals: Object.assign(
				{
					jquery: 'window.jQuery',
					_: 'window._',
					underscore: 'window._'
				},
				options.webpackExternals
			)
		}

		return commonConfig
	}
}
