/** 全局标准接口返回格式 */
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T | null;
}

/** 空数据成功响应简写（增删改无返回data时用） */
export type ApiEmptyResp = ApiResponse<null>;
