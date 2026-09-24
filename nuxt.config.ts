// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  routeRules: {
    "/": { redirect: "/login" },
  },

  runtimeConfig: {
    // 私有配置：只有服务端能访问，客户端永远看不到
    databaseUrl: process.env.NUXT_DATABASE_URL,

    // 公共配置：客户端也能访问（这里不要放任何敏感信息！）
    public: {
      // 比如你的网站标题、版本号等
      title: "My Nuxt App",
      version: "1.0.0",
    },
    jwt: {
      accessSecret: process.env.NUXT_JWT_ACCESS_SECRET,
      refreshSecret: process.env.NUXT_JWT_REFRESH_SECRET,
    },
  },
  modules: ["@pinia/nuxt", "@element-plus/nuxt", "@nuxtjs/tailwindcss"],
  elementPlus: {
    // 自动导入所有组件
    importStyle: "scss",
  },
  // 部署到 Cloudflare Worker（dev 不受影响）
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      // 构建时生成 .output/server/wrangler.json（含 nodejs_compat 等绑定信息）
      deployConfig: true,
      // 启用 Node 兼容层：process.env / Buffer 等，@upstash/redis、@neondatabase/serverless、jose 需要
      nodeCompat: true,
    },
  },
});
