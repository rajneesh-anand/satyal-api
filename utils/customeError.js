class CustomeError extends Error {
  constructor(statusCode, message = "somethings went wrong") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.data = null;
  }
}

module.exports = CustomeError;
