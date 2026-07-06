module.exports = {
  apps: [
    {
      name: "inspired-backend",
      script: "pnpm",
      args: "run start:prod",
      cwd: "./apps/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "inspired-admin",
      script: "pnpm",
      args: "run start",
      cwd: "./apps/admin",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
