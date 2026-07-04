const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  devServer: (devServerConfig) => {
    // Remove deprecated/removed webpack-dev-server v5 options
    // that react-scripts 5.0.1 still tries to pass
    const deprecated = [
      "onAfterSetupMiddleware",
      "onBeforeSetupMiddleware",
      "https",
    ];

    const onBefore = devServerConfig.onBeforeSetupMiddleware;
    const onAfter = devServerConfig.onAfterSetupMiddleware;

    deprecated.forEach((key) => {
      delete devServerConfig[key];
    });

    // Remap deprecated middleware hooks to setupMiddlewares
    if (onBefore || onAfter) {
      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        if (onBefore) onBefore(devServer);
        if (onAfter) onAfter(devServer);
        return middlewares;
      };
    }

    return devServerConfig;
  },
};
