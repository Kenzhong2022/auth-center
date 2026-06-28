import jwt from "jsonwebtoken";

// 生成短期 access_token 2小时
export function generateAccessToken(payload: Record<any, any>) {
  const config = useRuntimeConfig();
  console.log("config.jwt.accessSecret", config.jwt.accessSecret);
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: "2h" });
}

// 生成长期 refresh_token 7天
export function generateRefreshToken(payload: Record<any, any>) {
  const config = useRuntimeConfig();
  console.log("config.jwt.refreshSecret", config.jwt.refreshSecret);
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: "7d" });
}
