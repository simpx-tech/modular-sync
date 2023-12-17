import {HttpException} from "./http-exception";

export class UnprocessableEntityException extends HttpException {
  constructor(message: string) {
    super("unprocessable-entity", 422, message);
  }
}