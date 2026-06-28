// import type { BaseSoftDelete } from "../common/base.types";
// import { UserStatus } from "../enums/user.enum";
/** 带时间戳、软删除基础字段 */
export interface BaseSoftDelete {
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
export enum UserStatus {
  Normal = 1,
  Disabled = 2,
  Locked = 3,
}

/** PostgreSQL users 数据库原始行，包含bigint等数据库专属类型 */
export interface UserDbRow extends BaseSoftDelete {
  id: bigint;
  uuid: string;
  email: string | null;
  phone: string | null;
  password_hash: string;
  nickname: string | null;
  avatar: string | null;
  status: UserStatus;
  last_login_at: Date | null;
}

/** 后端对外返回、前端接收的干净实体（bigint转string，剔除密码） */
export interface UserVO extends Omit<UserDbRow, "id" | "passwordHash"> {
  id: string;
}
