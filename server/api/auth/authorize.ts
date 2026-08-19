import { verifyAccessToken } from "~~/server/utils/jwt";
import { generateAuthCode, saveAuthCode } from "~~/server/utils/oauthCode";
import { isSessionActive } from "~~/server/utils/session";

/** 认证中心自身会话 cookie 名（登录接口种下，见 server/api/auth/login.ts） */
const SESSION_COOKIE = "auth_session";

const clientDB = {
  "business-a": {
    client_secret: "xxx-secret-key",
    redirect_uris: ["http://localhost:3000/CallBack"],
  },
};

/**
 * 未登录时跳转登录页，原样携带 OAuth 参数，
 * 登录成功后登录页会带着参数回跳本接口继续发放授权码
 */
function redirectToLogin(
  event: Parameters<Parameters<typeof defineEventHandler>[0]>[0],
  params: { client_id: string; redirect_uri: string; redirect?: string },
) {
  const url = new URL("/login", getRequestURL(event).origin);
  url.searchParams.set("client_id", params.client_id);
  url.searchParams.set("redirect_uri", params.redirect_uri);
  url.searchParams.set("response_type", "code");
  if (params.redirect) url.searchParams.set("redirect", params.redirect);
  return sendRedirect(event, url.toString());
}

/**
 * OAuth 2.0 授权码发放入口
 * url: /api/auth/authorize?client_id=&redirect_uri=&response_type=code&redirect=
 *
 * 流程:
 *   1. 校验客户端与回调地址
 *   2. 读取认证中心会话 cookie：无效/缺失 → 跳登录页（保留 OAuth 参数）
 *   3. 会话有效 → 用会话中真实的 userId/role 生成随机授权码存 Redis，
 *      302 回业务方回调（redirect 参数透传，业务方 CallBack 登录后回跳用）
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { client_id, response_type, redirect_uri, redirect } = query;

  if (response_type !== "code") return { error: "仅支持 code 模式" };
  const client = clientDB[client_id as keyof typeof clientDB];
  if (!client) return { error: "非法客户端" };
  if (!client.redirect_uris.includes(redirect_uri as string))
    return { error: "非法回调地址" };

  // 读取会话：过期/伪造/缺失/已被吊销统一视为未登录
  const session = getCookie(event, SESSION_COOKIE);
  let payload: Awaited<ReturnType<typeof verifyAccessToken>> | null = null;
  if (session) {
    try {
      const verified = verifyAccessToken(session);
      // 验签通过后还需 Redis 会话存在（登出即删键，即时失效）
      payload = (await isSessionActive(verified.jti)) ? verified : null;
    } catch {
      payload = null;
    }
  }
  if (!payload) {
    return redirectToLogin(event, {
      client_id: client_id as string,
      redirect_uri: redirect_uri as string,
      redirect: redirect as string | undefined,
    });
  }

  // 用会话中的真实用户信息发放授权码（随机码，redis 内统一过期策略）
  const code = generateAuthCode();
  await saveAuthCode(code, {
    userId: payload.userId,
    role: payload.role ?? "guest",
    clientId: client_id as string,
    redirectUri: redirect_uri as string,
    createdAt: new Date(),
  });

  const url = new URL(redirect_uri as string);
  url.searchParams.set("code", code);
  if (redirect) url.searchParams.set("redirect", redirect as string);
  return sendRedirect(event, url.toString());
});
