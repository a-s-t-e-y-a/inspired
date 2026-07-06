module.exports = {
  apps: [
    {
      name: "inspired-backend",
      script: "./dist/main.js",
      cwd: "./apps/backend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "inspired-admin",
      script: "./node_modules/next/dist/bin/next",
      args: "start --port 3001",
      cwd: "./apps/admin",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
