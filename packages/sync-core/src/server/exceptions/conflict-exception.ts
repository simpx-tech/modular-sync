import {HttpException} from "./http-exception";

export class ConflictException extends HttpException {
  constructor(message: string) {
    super("conflict", 409, message);
  }
}