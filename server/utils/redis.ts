import { Redis } from "@upstash/redis";

// 懒加载单例：Worker 冷启动时 env 尚未注入（首次请求时才可用），
// 必须延迟到请求内再创建，顶层创建会永远拿到 undefined
let redisClient: Redis | null = null;

// 获取 Redis 单例客户端（仅在请求上下文中调用）
export function useRedis(): Redis {
  if (!redisClient) {
    const config = useRuntimeConfig();
    const url = config.upstashRedisRestUrl;
    const token = config.upstashRedisRestToken;

    if (!url || !token) {
      throw new Error(
        "[Redis] NUXT_UPSTASH_REDIS_REST_URL / NUXT_UPSTASH_REDIS_REST_TOKEN 未配置",
      );
    }
    redisClient = new Redis({ url, token });
  }
  return redisClient;
}
