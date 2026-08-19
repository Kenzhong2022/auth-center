declare module "nuxt/schema" {
  interface RuntimeConfig {
    jwt: {
      accessSecret: string;
      refreshSecret: string;
    };
    databaseUrl: string;
  }
}

export {};
