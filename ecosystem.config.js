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
        PORT: 3035,
        NEXTAUTH_URL: "https://pobedacargo1.gusar.tj",
        NEXTAUTH_SECRET: "f2bd34091a134dc230894089a8cde"
      }
    }
  ]
};
