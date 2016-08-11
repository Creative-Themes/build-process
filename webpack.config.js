var path = require("path");
var webpack = require('webpack');
var fs = require('fs');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

function getFolders(dir) {
	return fs.readdirSync(dir)
		.filter(function(file) {
			return fs.statSync(path.join(dir, file)).isDirectory();
		});
}

module.exports = (options) => {
	const webpackEntry = {

	};

	options.entries.map((entry) => {
		if (entry.forEachFolderIn) {
			var folders = getFolders(entry.forEachFolderIn);

			folders.map((folder) => {
				var entryKey = './' + path.join(
					entry.forEachFolderIn,
					folder,
					entry.entry
				);

				var entryValue = path.join(
					entry.forEachFolderIn,
					folder,
					entry.output
				);

				webpackEntry[entryValue] = entryKey;
			});
		} else {
			webpackEntry[entry.output] = entry.entry;
		}
	});

const config = {
	entry: webpackEntry,

	output: {
		path: './',
		filename: '[name].js'
	},

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
			'node_modules'
		]
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

	externals: {
		jquery: 'window.jQuery',
		'_': 'window._'
	},

	watch: isDevelopment
}

	return config;
};

