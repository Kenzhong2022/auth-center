import { generateAccessToken, generateRefreshToken } from "~~/server/utils/jwt";
import { redeemAuthCode } from "~~/server/utils/oauthCode";
import { saveRefreshToken } from "~~/server/utils/refreshToken";

/**
 * token 接口请求参数
 * @param client_id 客户端ID
 * @param code 授权码
 * @param redirect_uri 回调地址
 */
interface TokenRequest {
  client_id: string;
  code: string;
  redirect_uri: string;
}

/**
 * token 接口成功响应
 * @param access_token 短期访问令牌
 * @param refresh_token 长期刷新令牌
 * @param token_type 令牌类型
 * @param expires_in 过期时间（秒）
 * @param id_token 包含用户信息的ID令牌
 */
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  id_token: string;
}

/**
 * token 接口错误响应
 * @param error 错误码
 */
interface TokenErrorResponse {
  error: "invalid_code";
}

export default defineEventHandler(
  async (event): Promise<TokenResponse | TokenErrorResponse> => {
    const body = await readBody<TokenRequest>(event);
    const { client_id, code, redirect_uri } = body;
    console.log(body, "body");
    const codeInfo = await redeemAuthCode(code, client_id, redirect_uri);
    console.log(codeInfo, "codeInfo");
    if (!codeInfo) {
      console.log("[token] code 无效或已过期:", code);
      setResponseStatus(event, 400);
      return { error: "invalid_code" };
    }
    // 生成JWT长短token
    const payload = { userId: codeInfo.userId };
    console.log("[token] 生成 token, payload:", payload);
    const access_token = generateAccessToken(payload);
    const refresh_token = generateRefreshToken(payload);
    const expires_in = 2 * 60 * 60; // 2小时过期

    await saveRefreshToken(refresh_token, {
      userId: codeInfo.userId,
      clientId: client_id,
      createdAt: Date.now(),
    });
    console.log("[token] refresh_token 已存入 Redis");

    const response: TokenResponse = {
      access_token,
      refresh_token,
      token_type: "Bearer",
      expires_in,
      id_token: JSON.stringify(payload),
    };
    console.log("[token] 返回响应:", {
      ...response,
      access_token: access_token.slice(0, 20) + "...",
      refresh_token: refresh_token.slice(0, 20) + "...",
    });
    return response;
  },
);
