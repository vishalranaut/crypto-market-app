import { Application } from 'express';
import cryptoRouter from './api/controllers/crypto/router';
export default function routes(app: Application): void {
  app.use('/api', cryptoRouter);
}
