"use strict";
const path = require("path");

module.exports = {
	target: "web",
	entry: "./src/index.ts",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
		library: { name: "WebRTCSignaling", type: "umd", export: "default" }
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader"
			}
		]
	},
	resolve: {
		extensions: [".ts"]
	}
};
