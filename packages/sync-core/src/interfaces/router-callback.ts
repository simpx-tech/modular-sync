export type RouterCallback = (req: RouterRequest) => Promise<any>;

export interface RouterRequest {
  query?: string | Record<string, any>;
  body?: Record<string, any>;
  path?: string;
  rawRequest?: any;
}