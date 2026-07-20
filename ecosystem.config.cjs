module.exports = {
  apps: [
    {
      name: "alliance-website",
      script: "./server/index.js",
      cwd: "/var/www/alliance-website",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
