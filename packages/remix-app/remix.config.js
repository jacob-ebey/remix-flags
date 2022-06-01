let { flatRoutes } = require("remix-flat-routes");

/** @type {import("@remix-run/dev").AppConfig} */
let config = {
  serverBuildTarget: "cloudflare-workers",
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: ["**/*"],
  routes: async (defineRoutes) => {
    return flatRoutes("routes", defineRoutes);
  },
};

module.exports = config;
