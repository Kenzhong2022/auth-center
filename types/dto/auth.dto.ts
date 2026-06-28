import { UserStatus } from "../database/user.type";
import type { ApiResponse } from "../api/response.types";
export interface LoginUserVO {
  uuid: string;
  nickname: string | null;
  avatar: string | null;
  email: string | null;
  phone: string | null;
  status: UserStatus;
}

export interface LoginData {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  code: string;
  user: LoginUserVO;
}

// 登录完整返回 = 外层通用壳 + 业务data
export type LoginResp = ApiResponse<LoginData | null>;
