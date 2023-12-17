import {HttpException} from "./http-exception";

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super("not-found", 404, message);
  }
}