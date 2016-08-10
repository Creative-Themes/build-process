var path = require("path");
var webpack = require('webpack');

module.exports = {
	/*
	entry: './static/js/main.js',

	output: {
		path: path.join(__dirname, 'static', 'bundle'),
		filename: 'bundle.js'
	},
   */

	devtool: 'source-map',

	module: {
		loaders: [
			/*
			{
				test: /\.js$/,
				loader: 'babel',
				include: [
				]
			},
			*/
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
	],

	externals: {
		jquery: 'window.jQuery',
		'_': 'window._'
	},

	watch: true
};

