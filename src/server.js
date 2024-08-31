// src/index.js
import https from 'https';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from './app.js';

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define paths for development and production certificates
const DEV_CERT_PATH = path.resolve(__dirname, '../cert/development');
const PROD_CERT_PATH = path.resolve(__dirname, '../cert/production');

// Certificate paths based on environment
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
    // Set environment and load corresponding .env file
    this.ENVIRONMENT = process.env.NODE_ENV || 'development';
    const envFile = this.ENVIRONMENT === 'production' ? '.env.production.local' : '.env.development.local';
    dotenv.config({ path: envFile });

    // Set port and ciphers from environment variables or use defaults
    this.PORT = process.env.PORT || 3000;
    this.CIPHERS = process.env.CIPHERS || 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';
  }

  /**
   * Get certificate paths based on the environment
   * @param {string} environment - The current environment (development or production)
   * @returns {Object} - The paths to the key and certificate files
   * @throws {Error} - If the environment is invalid
   */
  getCertPaths(environment) {
    const paths = CERT_PATHS[environment];
    if (!paths) {
      throw new Error(`Invalid NODE_ENV value: ${environment}`);
    }
    return paths;
  }

  /**
   * Load certificates from the file system
   * @returns {Promise<Object>} - The key and certificate contents
   * @throws {Error} - If the certificates cannot be loaded
   */
  async loadCertificates() {
    const { key: keyPath, cert: certPath } = this.getCertPaths(this.ENVIRONMENT);

    try {
      // Check if the certificate files are accessible
      await fs.access(keyPath);
      await fs.access(certPath);

      // Read the certificate files
      const key = await fs.readFile(keyPath);
      const cert = await fs.readFile(certPath);

      return { key, cert };
    } catch (error) {
      throw new Error(`Failed to load certificates for ${this.ENVIRONMENT} environment. ${error.message}`);
    }
  }

  /**
   * Start the HTTPS server
   * @returns {Promise<void>}
   */
  async start() {
    try {
      // Check if required environment variables are set
      this.checkEnvVariables();

      // Load certificates and set server options
      const options = await this.loadCertificates();
      options.honorCipherOrder = true;
      options.ciphers = this.CIPHERS;

      // Create and start the HTTPS server
      https.createServer(options, app).listen(this.PORT, () => {
        console.log(`Server is running on port ${this.PORT} with HTTPS in ${this.ENVIRONMENT} mode`);
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Check if required environment variables are set
   * @throws {Error} - If the PORT environment variable is not set
   */
  checkEnvVariables() {
    if (!process.env.PORT) {
      throw new Error('PORT environment variable is not set');
    }
  }

  /**
   * Handle errors by logging and exiting the process
   * @param {Error} error - The error to handle
   */
  handleError(error) {
    console.error(error.message);
    process.exit(1);
  }

  /**
   * Handle uncaught exceptions and unhandled promise rejections
   */
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

// Create and start the server
const server = new Server();
server.handleUncaughtExceptions();
server.start();