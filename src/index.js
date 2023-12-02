import 'dotenv/config';
import serverless from 'serverless-http';
import { Application } from './app.js';

const app = new Application();

app.startServer();

export const  handler = serverless(app.getServer());
