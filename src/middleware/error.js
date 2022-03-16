const errorMiddleware = (err, req, res, next) => {
  const code = err.code ? err.code : 500;
  const message = code >= 500 ? 'Something failed on the server.' : err.message;
  console.error(err);
  res.status(code).json({ ERROR: message });
};

module.exports = errorMiddleware;