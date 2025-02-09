const path = require("path");

module.exports = {
  entry: "./bundle.js",
  output: {
    filename: "xlsx-bundle.js", // Final bundled file
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production"
};
