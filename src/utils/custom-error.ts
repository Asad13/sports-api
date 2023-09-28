export enum ErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

export enum ErrorType {
  SERVER = 'Internal Server Error',
  DATABASE = 'Database Error',
  CLIENT = 'Client Error',
  NOT_FOUND = 'Resource Not Found Error',
  CORS = 'CORS Error',
}

class CustomError implements ICustomError {
  message: string;
  code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;
  name: ErrorType = ErrorType.SERVER;
  stack?: string | undefined;

  constructor(
    message: string,
    code = ErrorCode.INTERNAL_SERVER_ERROR,
    name = ErrorType.SERVER,
    stack?: string | undefined
  ) {
    this.message = message;
    this.code = code;
    this.name = name;
    this.stack = stack;
  }
}

export default CustomError;
