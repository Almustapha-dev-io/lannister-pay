class ApiError extends Error {
  constructor(message, code = 500) {
    if (typeof code !== 'number') throw new Error('"code" must be a number');
    if (typeof message !== 'string') throw new Error('"message" must be a string');
    super(message);
    this.code = code;
    Error.captureStackTrace(this);
  }
}

module.exports = ApiError;