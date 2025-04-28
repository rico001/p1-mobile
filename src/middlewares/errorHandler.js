//middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: {
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : {},
        },
    });
}

export default errorHandler;