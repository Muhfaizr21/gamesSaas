const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error using our new logger
    logger.error(`${req.method} ${req.url} - ${message}`);
    if (err.stack && process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;
