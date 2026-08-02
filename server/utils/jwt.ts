import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

/** access_token 的 payload 结构 */
interface AccessTokenPayload {
  userId: number | string;
  [key: string]: any;
}

/** refresh_token 的 payload 结构 */
interface RefreshTokenPayload {
  userId: number | string;
  [key: string]: any;
}

/** 注入 jti 声明，确保即使 payload 和签发时间相同，JWT 也唯一
 *  - 解决同一秒内连续签发产生相同 token 的问题（如快速连点刷新）
 *  - jti 也是 JWT 标准声明，用于唯一标识一个 token
 */
function withJti<T extends Record<string, any>>(
  payload: T,
): T & { jti: string } {
  return { ...payload, jti: uuidv4() };
}

// 生成短期 access_token 2小时
export function generateAccessToken(payload: AccessTokenPayload) {
  const config = useRuntimeConfig();
  return jwt.sign(withJti(payload), config.jwt.accessSecret, {
    expiresIn: "2h",
  });
}

// 生成长期 refresh_token 7天
export function generateRefreshToken(payload: RefreshTokenPayload) {
  const config = useRuntimeConfig();
  return jwt.sign(withJti(payload), config.jwt.refreshSecret, {
    expiresIn: "7d",
  });
}

/** 校验 access_token，返回 payload 或抛出异常 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const config = useRuntimeConfig();
  const decoded = jwt.verify(token, config.jwt.accessSecret);
  // jwt.verify 在过期/签名错误时会抛出 JsonWebTokenError / TokenExpiredError
  return decoded as AccessTokenPayload;
}

/** 校验 refresh_token，返回 payload 或抛出异常 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const config = useRuntimeConfig();
  const decoded = jwt.verify(token, config.jwt.refreshSecret);
  return decoded as RefreshTokenPayload;
}
