module.exports = {
  apps: [
    {
      name: "pobeda-bot",
      script: "npx",
      args: "tsx src/index.ts",
      cwd: "./",
      watch: false,
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "pobeda-admin-panel",
      script: "npm",
      args: "run start",
      cwd: "./admin-panel",
      watch: false,
      env: {
        NODE_ENV: "production",
        // Истифодаи порти 3035 барои халал нарасондан ба лоиҳаи дигар дар сервер
        PORT: 3035 
      }
    }
  ]
};
