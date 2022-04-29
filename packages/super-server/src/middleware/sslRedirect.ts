import { NextFunction, Request, Response } from 'express';

import config from '../config';

export default function sslRedirect(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.secure || !config.ssl.redirect) return next();

  return res.redirect(`https://${req.headers.host}${req.url}`);
}
