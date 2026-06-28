declare module "nuxt/schema" {
  interface RuntimeConfig {
    jwt: {
      accessSecret: string;
      refreshSecret: string;
    };
    deepseek: {
      apiKey: string;
      baseURL: string;
    };
    databaseUrl: string;
  }
}

export {};
