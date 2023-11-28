import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { applicationRouter } from './lambdas/index.js';


export class Application {
  #server;
  constructor() {
    this.#server = express();
    this.#server.set('host', 'localhost');
    this.#server.set('port', 8000);
    this.#server.use(bodyParser.json());
    this.#server.use(bodyParser.urlencoded({ extended: true }));
    this.#server.use(cors());
    this.#server.use(applicationRouter);
  }

  // later could be used to add more services when start the server
  startServer(services) {
    console.log('Starting server...');
    console.log(services);
    this.#server.listen(this.#server.get('port'), () => {
      console.log(`Server is listening on port: ${this.#server.get('port')}`);
    });
  }

  getServer() {
    return this.#server;
  }
}