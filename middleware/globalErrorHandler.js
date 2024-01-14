const sendError = (res, err) => {
  let message = err.message;
  return res.status(err.statusCode).json({
    message,
    status: "error",
    data: err.data,
    statusCode: err.statusCode,
  });
};

const globalErrorHandeler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  sendError(res, err);
};

module.exports = globalErrorHandeler;
