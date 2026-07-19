/**
 * Custom error handler middleware
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode || 500).json({
            status: err.status || 'error',
            message: err.message
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || res.statusCode;
    if (err.statusCode === 200) err.statusCode = 500;

    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;
        error.name = err.name;
        
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            error = new Error('Invalid token. Please log in again!');
            error.statusCode = 401;
            error.isOperational = true;
        }
        if (error.name === 'TokenExpiredError') {
            error = new Error('Your token has expired! Please log in again.');
            error.statusCode = 401;
            error.isOperational = true;
        }

        // Simple default to operational for app-thrown errors if they have a message
        if (error.isOperational === undefined && err.message) {
            error.isOperational = true; 
        }

        sendErrorProd(error, res);
    }
};

module.exports = { errorHandler };
