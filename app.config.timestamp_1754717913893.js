// app.config.ts
import { defineConfig } from "@tanstack/start/config";
var app_config_default = defineConfig({
  routers: {
    client: {
      entry: "./app/client.tsx"
    },
    server: {
      entry: "./app/server.tsx"
    }
  }
});
export {
  app_config_default as default
};
