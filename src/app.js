// src/app.js
import express from 'express';
import routes from './routes/index.js';

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
    this.app.use(express.json());
  }

  /**
   * Set up routes for the Express application
   */
  routes() {
    this.app.use('/', routes);
  }
}

export default new App().app;