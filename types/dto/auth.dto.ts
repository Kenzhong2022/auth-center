import { UserStatus, type RoleCode } from "../database/user.type";
import type { ApiResponse } from "../api/response.types";

export interface LoginUserVO {
  uuid: string;
  nickname: string | null;
  avatar: string | null;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  /** 角色编码（roles.code），与 access_token payload 中的 role 一致 */
  role: RoleCode;
}

/**
 * 登录响应 data（纯认证，不含业务 token）
 * OAuth 授权码模式下 access_token/refresh_token 由 /api/auth/token 签发，
 * 授权码由 /api/auth/authorize 发放，登录接口只负责认证 + 种会话 cookie
 */
export interface LoginData {
  user: LoginUserVO;
}

// 登录完整返回 = 外层通用壳 + 业务data
export type LoginResp = ApiResponse<LoginData | null>;
