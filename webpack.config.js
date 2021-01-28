module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  devtool: "inline-source-map",
  output: { filename: "index.js" },
  resolve: { extensions: [".ts", ".js"] },
  module: { rules: [{ test: /\.ts/, loader: "ts-loader" }] },
};
