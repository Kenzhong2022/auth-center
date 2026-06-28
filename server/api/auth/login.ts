import { setupDatabase } from "~~/server/utils/database";
import bcrypt from "bcrypt";
import { createError } from "h3";
import { generateAccessToken, generateRefreshToken } from "~~/server/utils/jwt";
import type { UserDbRow } from "~~/types/database/user.type";
import type { LoginUserVO, LoginData, LoginResp } from "~~/types/dto/auth.dto";
import { generateCode, storeCode } from "~~/server/utils/oauthCode";
export default defineEventHandler(async (event): Promise<LoginResp> => {
  const body = await readBody(event);
  const { sql } = setupDatabase();
  const { email, password, client_id, redirect_uri } = body;
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: "邮箱或密码不能为空",
    });
  }

  // 验证客户端参数
  if (!body.client_id || !body.redirect_uri) {
    throw createError({
      statusCode: 400,
      message: "缺少 client_id 或 redirect_uri 参数",
    });
  }

  // 查询数据库
  const res: UserDbRow[] =
    (await sql`SELECT * FROM users WHERE email = ${email}  AND deleted_at IS NULL`) as UserDbRow[];
  console.log(res);
  const saltRounds = 10; // 和你之前的哈希轮次保持一致
  bcrypt.hash(password, saltRounds).then((hash: string) => {
    console.log("加密后的哈希：", hash);
  });
  // 不存在用户
  if (!res.length) {
    throw createError({
      statusCode: 400,
      message: "用户不存在",
    });
  }

  const user = res[0] as UserDbRow;
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw createError({
      statusCode: 400,
      message: "密码错误",
    });
  } // ========== 密码匹配成功，后续逻辑写这里 ==========
  // 3. 更新最后登录时间 last_login_at
  await sql`
    UPDATE users 
    SET last_login_at = NOW() 
    WHERE id = ${user.id}
  `;

  // 4. 生成双 Token（access短期，refresh长期）
  const accessToken = generateAccessToken({
    sub: String(user.id),
    uuid: user.uuid,
  });
  const refreshToken = generateRefreshToken({
    sub: String(user.id),
    uuid: user.uuid,
  });
  // 生成授权码（可选）
  // 5. 存储授权码到 Redis
  const code = generateCode();
  await storeCode(code, {
    clientId: body.client_id,
    redirectUri: body.redirect_uri,
    userId: String(user.id),
    createdAt: new Date(),
  });
  return {
    code: 200,
    msg: "登录成功",
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_in: 1209600,
      code,
      user: {
        uuid: user.uuid,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email,
        phone: user.phone,
        status: user.status,
      },
    },
  };
});
