import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { applicationRouter } from './lambdas/index.js';


export class Application {
  #server;
  constructor() {
    this.#server = express();
    this.#server.use(bodyParser.json());
    this.#server.use(bodyParser.urlencoded({ extended: true }));
    this.#server.use(cors());
    this.#server.use(applicationRouter);
  }

  // later could be used to add more services when start the server
  startServer(services) {
    this.isRunning = true;
    console.log('Starting server...');
    console.log(services);
  }
  getServer() {
    return this.#server;
  }
}

