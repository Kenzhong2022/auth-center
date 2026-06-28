import { generateAccessToken, generateRefreshToken } from "~~/server/utils/jwt";
import { redis } from "~~/server/utils/redis";
import { consumeCode } from "~~/server/utils/oauthCode";

const refreshStore = new Map(); // refresh_token生产也换redis，这里先测试用内存

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const client_id = body.client_id;
  const code = body.code;
  const redirect_uri = body.redirect_uri;
  console.log(body, "body");
  const codeInfo = await consumeCode(
    code as string,
    client_id as string,
    redirect_uri as string,
  );
  console.log(codeInfo, "codeInfo");
  if (!codeInfo) {
    console.log("[token] code 无效或已过期:", code as string);
    setResponseStatus(event, 400);
    return { error: "invalid_code" };
  }
  // 生成JWT长短token
  const payload = { userId: codeInfo.userId };
  console.log("[token] 生成 token, payload:", payload);
  const access_token = generateAccessToken(payload);
  const refresh_token = generateRefreshToken(payload);
  const expires_in = 2 * 60 * 60; // 2小时过期

  refreshStore.set(refresh_token, {
    userId: codeInfo.userId,
    createTime: Date.now(),
  });
  console.log("[token] refresh_token 已存入 store, 总数:", refreshStore.size);

  const response = {
    access_token,
    refresh_token,
    token_type: "Bearer",
    expires_in,
    id_token: JSON.stringify(payload),
  };
  console.log("[token] 返回响应:", {
    ...response,
    access_token: access_token?.slice(0, 20) + "...",
    refresh_token: refresh_token?.slice(0, 20) + "...",
  });
  return response;
});
