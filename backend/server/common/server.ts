import express, { Application } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import http from 'http';
import os from 'os';
import cookieParser from 'cookie-parser';
import l from './logger';
import cors from 'cors';
import errorHandler from '../api/middlewares/error.handler';
import WebSocketServer from '../api/websockets/cryptoWsServer'; // Adjust the path accordingly

const app = express();
const server = http.createServer(app);

// Initialize WebSocket Server
new WebSocketServer(server);

export default class ExpressServer {
  private routes: (app: Application) => void;

  constructor() {
    const root = path.normalize(__dirname + '/../..');
    app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: process.env.REQUEST_LIMIT || '100kb',
      })
    );
    app.use(bodyParser.text({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(cors());

    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(express.static(`${root}/public`));
    this.handleExit();
  }

  router(routes: (app: Application) => void): ExpressServer {
    routes(app);
    app.use(errorHandler);
    return this;
  }

  listen(port: number): Application {
    const welcome = (p: number) => (): void =>
      l.info(`up and running in @: ${os.hostname()} on port: ${p}`);

    server.listen(port, welcome(port));
    return app;
  }

  private handleExit(): void {
    process.on('exit', () => {
      l.info('Exiting...');
    });

    process.on('SIGINT', this.exitHandler.bind(this, { exit: true }));
    process.on('SIGTERM', this.exitHandler.bind(this, { exit: true }));
    process.on('uncaughtException', this.unexpectedErrorHandler.bind(this));
  }

  private exitHandler(options: { exit?: boolean }, exitCode?: number): void {
    server.close(() => {
      l.info('Server closed');
      if (options.exit) process.exit(exitCode || 1);
    });
  }

  private unexpectedErrorHandler(error: Error): void {
    l.error(`Unexpected error: ${error}`);
    this.exitHandler({ exit: true });
  }
}
