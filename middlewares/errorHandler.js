
// middlewares/errorHandler.js
exports.notFoundHandler = (req, res, next) => {
    const error = new Error(`La ressource demandée n'a pas été trouvée - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
  };
  
  exports.errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };