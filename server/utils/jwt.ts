import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

/** 签发时传入的业务 payload（仅 userId，jti/iat/exp 由 generateXxx 内部注入） */
interface TokenPayload {
  userId: number | string;
}

/** 校验通过后返回的完整 payload
 *  - jti: token 唯一标识（签发时注入，可用于黑名单撤销）
 *  - iat: 签发时间（秒级时间戳，jsonwebtoken 自动注入）
 *  - exp: 过期时间（秒级时间戳，jsonwebtoken 自动注入）
 */
interface VerifiedTokenPayload {
  userId: number | string;
  jti: string;
  iat: number;
  exp: number;
}

/** 注入 jti 声明，确保即使 payload 和签发时间相同，JWT 也唯一
 *  - 解决同一秒内连续签发产生相同 token 的问题（如快速连点刷新）
 *  - jti 也是 JWT 标准声明，用于唯一标识一个 token
 */
function withJti(payload: TokenPayload): TokenPayload & { jti: string } {
  return { ...payload, jti: uuidv4() };
}

// 生成短期 access_token 2小时
export function generateAccessToken(payload: TokenPayload) {
  const config = useRuntimeConfig();
  return jwt.sign(withJti(payload), config.jwt.accessSecret, {
    expiresIn: "2h",
  });
}

// 生成长期 refresh_token 7天
export function generateRefreshToken(payload: TokenPayload) {
  const config = useRuntimeConfig();
  return jwt.sign(withJti(payload), config.jwt.refreshSecret, {
    expiresIn: "7d",
  });
}

/** 校验 access_token，返回完整 payload（含 jti/iat/exp）或抛出异常
 *  @throws TokenExpiredError token 已过期
 *  @throws JsonWebTokenError 签名无效/格式错误
 */
export function verifyAccessToken(token: string): VerifiedTokenPayload {
  const config = useRuntimeConfig();
  const decoded = jwt.verify(token, config.jwt.accessSecret);
  return decoded as VerifiedTokenPayload;
}

/** 校验 refresh_token，返回完整 payload（含 jti/iat/exp）或抛出异常
 *  @throws TokenExpiredError token 已过期
 *  @throws JsonWebTokenError 签名无效/格式错误
 */
export function verifyRefreshToken(token: string): VerifiedTokenPayload {
  const config = useRuntimeConfig();
  const decoded = jwt.verify(token, config.jwt.refreshSecret);
  return decoded as VerifiedTokenPayload;
}
