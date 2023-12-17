import {HttpException} from "./http-exception";

export class ForbiddenException extends HttpException {
  constructor(message: string) {
    super("forbidden", 403, message);
  }
}