import { redis } from "~~/server/utils/redis";

const clientDB = {
  "business-a": {
    client_secret: "xxx-secret-key",
    redirect_uris: ["http://localhost:3000/Callback"],
  },
};

export default defineEventHandler(async (event) => {
  if (!redis) {
    throw createError({
      statusCode: 500,
      statusMessage: "Redis 客户端未配置",
    });
  }
  const query = getQuery(event);
  const { client_id, response_type, redirect_uri, back } = query;

  if (response_type !== "code") return { error: "仅支持 code 模式" };
  const client = clientDB[client_id as keyof typeof clientDB];
  if (!client) return { error: "非法客户端" };
  if (!client.redirect_uris.includes(redirect_uri as string))
    return { error: "非法回调地址" };

  const code = "123456";
  const codeKey = `oauth:code:${code}`;
  // 存入redis，5分钟过期
  await redis.set(codeKey, JSON.stringify({ redirect_uri, userId: 10086 }), {
    ex: 60,
  });

  const url = new URL(redirect_uri as string);
  url.searchParams.set("code", code);
  if (back) url.searchParams.set("back", back as string);
  return sendRedirect(event, url.toString());
});
