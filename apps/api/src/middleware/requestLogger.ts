import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, path } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const level = statusCode >= 400 ? 'warn' : 'info';

    if (process.env.NODE_ENV !== 'test') {
      console[level](
        `${method} ${path} ${statusCode} ${duration}ms${req.user ? ` [user:${req.user.id.slice(0, 8)}]` : ''}`,
      );
    }
  });

  next();
}
