// src/config/compression.js
import compression from 'compression';

/**
 * Configures compression middleware for the Express application.
 *
 * @param {Object} app - The Express application instance.
 */
export function configureCompression(app) {
  app.use(compression({
    // Compression level (0-9), where 0 is no compression and 9 is maximum compression
    level: process.env.COMPRESSION_LEVEL ? parseInt(process.env.COMPRESSION_LEVEL, 10) : 6,

    
    threshold: process.env.COMPRESSION_THRESHOLD ? parseInt(process.env.COMPRESSION_THRESHOLD, 10) : 1024, // 1 KiB

    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        // Don't compress responses if the client sent 'x-no-compression' header
        return false;
      }
      return compression.filter(req, res);
    },

    zlib: {
      // Compression level (0-9), where 0 is no compression and 9 is maximum compression
      level: process.env.ZLIB_COMPRESSION_LEVEL ? parseInt(process.env.ZLIB_COMPRESSION_LEVEL, 10) : 6,

      // Size of the buffer used for compression
      chunkSize: process.env.ZLIB_CHUNK_SIZE ? parseInt(process.env.ZLIB_CHUNK_SIZE, 10) : 16 * 1024, // 16 KiB

      // Maximum size of the compressed output
      maxOutputLength: process.env.ZLIB_MAX_OUTPUT_LENGTH ? parseInt(process.env.ZLIB_MAX_OUTPUT_LENGTH, 10) : 10 * 1024 * 1024 // 10 MiB
    }
  }));
}