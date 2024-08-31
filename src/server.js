// src/index.js
import https from 'https';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEV_CERT_PATH = path.resolve(__dirname, '../cert/development');
const PROD_CERT_PATH = path.resolve(__dirname, '../cert/production');

const CERT_PATHS = {
  development: {
    key: path.resolve(DEV_CERT_PATH, './key.pem'),
    cert: path.resolve(DEV_CERT_PATH, './cert.crt'),
  },
  production: {
    key: path.resolve(PROD_CERT_PATH, './key.pem'),
    cert: path.resolve(PROD_CERT_PATH, './cert.crt'),
  },
};

class Server {
  constructor() {
    this.ENVIRONMENT = process.env.NODE_ENV || 'development';
    const envFile = this.ENVIRONMENT === 'production' ? '.env.production.local' : '.env.development.local';
    dotenv.config({ path: envFile });

    this.PORT = process.env.PORT || 3000;
    this.CIPHERS = process.env.CIPHERS || 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';
  }

  getCertPaths(environment) {
    const paths = CERT_PATHS[environment];
    if (!paths) {
      throw new Error(`Invalid NODE_ENV value: ${environment}`);
    }
    return paths;
  }

  async loadCertificates() {
    const { key: keyPath, cert: certPath } = this.getCertPaths(this.ENVIRONMENT);

    try {
      await fs.access(keyPath);
      await fs.access(certPath);

      const key = await fs.readFile(keyPath);
      const cert = await fs.readFile(certPath);

      return { key, cert };
    } catch (error) {
      throw new Error(`Failed to load certificates for ${this.ENVIRONMENT} environment. ${error.message}`);
    }
  }

  async start() {
    try {
      this.checkEnvVariables();

      const options = await this.loadCertificates();
      options.honorCipherOrder = true;
      options.ciphers = this.CIPHERS;

      https.createServer(options, app).listen(this.PORT, () => {
        console.log(`Server is running on port ${this.PORT} with HTTPS in ${this.ENVIRONMENT} mode`);
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  checkEnvVariables() {
    if (!process.env.PORT) {
      throw new Error('PORT environment variable is not set');
    }
  }

  handleError(error) {
    console.error(error.message);
    process.exit(1);
  }

  handleUncaughtExceptions() {
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }
}

const server = new Server();
server.handleUncaughtExceptions();
server.start();