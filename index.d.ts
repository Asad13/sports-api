declare enum ErrorCode {
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

declare enum ErrorType {
  SERVER = 'Internal Server Error',
  DATABASE = 'Database Error',
  CLIENT = 'Client Error',
  NOT_FOUND = 'Resource Not Found Error',
  CORS = 'CORS Error',
}

interface ICustomError extends Error {
  name: ErrorType;
  code: ErrorCode;
}
