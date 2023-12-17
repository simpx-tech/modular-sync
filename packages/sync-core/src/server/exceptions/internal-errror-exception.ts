import {HttpException} from "./http-exception";

export class InternalServerErrorException extends HttpException {
  constructor(message: string) {
    super("internal-server-error", 500, message);
  }
}