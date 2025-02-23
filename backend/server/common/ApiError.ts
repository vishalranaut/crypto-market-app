export class ApiError extends Error {
  public status: number;
  public error: boolean;
  public stack?: string;

  constructor(
    status: number,
    message: string,
    error: boolean = true,
    stack: string = ''
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.error = error;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export default ApiError;
