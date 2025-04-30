//middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
    if(err.message === 'Nur .3mf-Dateien sind erlaubt!') {
        return res.status(500).json({ message: "Nur 3mf-Dateien sind erlaubt." });
    }
    res.status(500).json({
        error: {
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : {},
        },
    });
}

export default errorHandler;