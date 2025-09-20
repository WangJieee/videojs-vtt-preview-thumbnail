const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const port = 3000

module.exports = {
    mode: 'development',
		devtool: "inline-source-map",
    entry: path.resolve(__dirname, 'src') + '/plugin.js',
		resolve: {
			extensions: ['.js'],
			fallback: { 
				"crypto": false,
				"stream": false,
				"vm": false
			},
			alias: {
				'@src': path.join(__dirname, '../src'),
			}
		},
    output: {
			path: path.resolve(__dirname, './dist'),
			filename: 'bundle.js'
    },
    module: {
			rules: [
				{
					test: /\.js$/,
					use: ['babel-loader']
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				},
				{
					test: /\.(jpe?g|png|gif)$/,
					use: ['file-loader'],
				},
			]
    },
    plugins: [
			new HtmlWebpackPlugin({
				template: './dist/index.html',
				inject: 'head',
			})
    ],
    devServer: {
			host: 'localhost',
			port: port,
			historyApiFallback: true,
			open: true
    }
}