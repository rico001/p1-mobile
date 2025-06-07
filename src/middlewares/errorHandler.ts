import { NextFunction, Request, Response } from 'express';

interface ErrorWithMessage extends Error {
  message: string;
}

/**
 * Zentrale Fehlerbehandlungs-Middleware.
 */
export default function errorHandler(
  err: ErrorWithMessage,
  req: Request,
  res: Response,
  next: NextFunction
): void {

  if (err.message === 'Nur .3mf-Dateien sind erlaubt!') {
    res.status(400).json({ message: 'Nur 3mf-Dateien sind erlaubt.' });
    return;
  }

  res.status(500).json({
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
}
