const path = require("path");

module.exports = {
	entry: './src/main.js',
	output: {
		filename: 'main.bundle.js',
		path: path.join(__dirname, 'build/js')
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	},
	devtool: 'sourcemap',
	mode: 'development'
}
