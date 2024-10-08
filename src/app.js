// src/app.js
import express from 'express';
import routes from './routes/index.js';
import cors from 'cors';
import { configureCompression } from './config/compression.js';

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  /**
   * Set up middlewares for the Express application
   */
  middlewares() {
    this.app.use(cors());
    configureCompression(this.app);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }))
  }

  /**
   * Set up routes for the Express application
   */
  routes() {
    this.app.use('/', routes);
  }
}

export default new App().app;