/** 带时间戳、软删除基础字段（对应 users 表公共列） */
export interface BaseSoftDelete {
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at: Date | string | null;
}

/**
 * 用户状态（对应 users.status smallint，实际取值 0/1）
 * 与 my-nuxt-app 侧定义保持一致
 */
export enum UserStatus {
  /** 禁用 */
  Disabled = 0,
  /** 正常 */
  Active = 1,
}

/**
 * 角色编码（对应 roles.code 列）
 * 签发 JWT payload 与服务端鉴权均使用此编码
 */
export type RoleCode = "admin" | "operator" | "guest";

/** PostgreSQL users 数据库原始行（bigint 由 Neon 驱动返回 string） */
export interface UserDbRow extends BaseSoftDelete {
  id: number | string;
  uuid: string;
  email: string | null;
  phone: string | null;
  password_hash: string;
  nickname: string | null;
  avatar: string | null;
  status: UserStatus;
  last_login_at: Date | string | null;
  /** 角色 ID（FK → roles.id），可为 NULL（默认视为 guest） */
  role_id: number | string | null;
}

/** users LEFT JOIN roles 的联查行（登录时获取角色编码用） */
export interface UserWithRoleRow extends UserDbRow {
  /** roles.code，role_id 为 NULL 或角色被删时为 NULL */
  role_code: RoleCode | null;
}

/** 后端对外返回、前端接收的干净实体（剔除密码，id 统一为字符串） */
export interface UserVO extends Omit<UserDbRow, "id" | "password_hash"> {
  id: string;
}
