export class HttpException {
  isHttpError: boolean;
    errorCode: string;
    errorStatus: number;
    message: string;

    constructor(errorCode: string, statusCode: number, message: string) {
      this.isHttpError = true;
      this.errorCode = errorCode;
      this.errorStatus = statusCode;
      this.message = message;
    }
}