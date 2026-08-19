# auth-center

认证中心：独立部署的登录服务（Netlify），为业务应用提供 OAuth 2.0 授权码模式登录。

## 功能

- 用户注册 / 登录（bcrypt 密码加密）
- OAuth 2.0 授权码发放与兑换（`/api/auth/authorize`、`/api/auth/token`）
- JWT access / refresh 双令牌签发与刷新
- Upstash Redis 存储授权码与刷新令牌白名单

## 启动

```bash
pnpm install
pnpm dev --port 3001
```

> 端口必须显式指定为 3001（默认 3000 会与业务应用 my-nuxt-app 冲突）。

## 环境变量（.env）

| 变量 | 说明 |
|---|---|
| `NUXT_DATABASE_URL` | Neon PostgreSQL 连接串 |
| `NUXT_JWT_ACCESS_SECRET` | access token 签名密钥（需与业务应用一致） |
| `NUXT_JWT_REFRESH_SECRET` | refresh token 签名密钥 |

## 业务应用对接

业务应用（my-nuxt-app）通过 `LOGIN_BASE` 指向本服务：

- 线上：`https://auth-center.netlify.app`
- 本地联调：`http://localhost:3001`
