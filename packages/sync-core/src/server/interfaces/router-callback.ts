import jwt from "jsonwebtoken"

export type RouterCallback = (req: RouterRequest) => Promise<any>;

export interface RouterRequest {
  query?: Record<string, any>;
  body?: Record<string, any>;
  path?: string;
  rawRequest?: any;
  headers: Record<string, any>;
  token: string | null;
  decodedToken: jwt.JwtPayload | Record<string, any>;
}