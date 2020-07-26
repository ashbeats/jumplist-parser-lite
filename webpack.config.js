const nodeExternals = require("webpack-node-externals");
const path = require("path");

module.exports = {
  target: "node", // in order to ignore built-in modules like path, fs, etc.
  // externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  mode: "production",
  // libraryTarget: "commonjs2",
  entry: {
    app: ["./src/index.js"]
  },
  output: {
    path: path.resolve(__dirname, "dist/"),
    filename: "index.js",
    library: "jumplistParserLite",
    libraryTarget: "umd"
  }
};

// npx webpack --config webpack.config.js
