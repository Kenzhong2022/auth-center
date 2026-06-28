// 生成uuid
// server/utils/oauthCode.ts
import { v4 as uuidv4 } from "uuid";
import { redis } from "./redis";

/**
 * 授权码数据结构
 * @param userId 用户ID
 * @param clientId 客户端ID
 * @param issuer 发布者
 * @param redirectUri 回调地址
 * @param scope 授权范围
 * @param createdAt 创建时间
 */
interface OAuthCodeData {
  userId: number | string;
  clientId: string;
  issuer?: string;
  redirectUri: string;
  scope?: string;
  createdAt: Date;
}

const CODE_PREFIX = "oauth:code:";
const CODE_EXPIRE = 3000; // 5分钟过期

/** 生成授权码 */
export function generateCode(): string {
  return uuidv4();
}

/** 存储授权码 */
export async function storeCode(
  code: string,
  data: OAuthCodeData,
): Promise<void> {
  const key = `${CODE_PREFIX}${code}`;
  await redis.set(key, JSON.stringify(data), { ex: CODE_EXPIRE });
}

/** 验证并消费授权码（一次性）
 * @param code 授权码
 * @param clientId 客户端ID
 * @param redirectUri 回调地址
 * @returns 授权码数据或null
 */
export async function consumeCode(
  code: string,
  clientId: string,
  redirectUri: string,
): Promise<OAuthCodeData | null> {
  const key = `${CODE_PREFIX}${code}`;
  const raw = await redis.get(key);
  if (!raw) return null; // 授权码不存在
  const data: OAuthCodeData = raw as OAuthCodeData;
  // 校验客户端和回调地址
  if (data.clientId !== clientId || data.redirectUri !== redirectUri) {
    // 抛出异常，客户端ID或回调地址不匹配
    throw new Error("client_id or redirect_uri not match");
  }
  // 一次性使用，立即删除
  // await redis.del(key);
  return data;
}

/** 手动撤销授权码 */
export async function revokeCode(code: string): Promise<void> {
  await redis.del(`${CODE_PREFIX}${code}`);
}
