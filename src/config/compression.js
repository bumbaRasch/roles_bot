// src/config/compression.js
import compression from 'compression';

export function configureCompression(app) {
  app.use(compression({
    level: process.env.COMPRESSION_LEVEL ? parseInt(process.env.COMPRESSION_LEVEL, 10) : 6,
    threshold: process.env.COMPRESSION_THRESHOLD ? parseInt(process.env.COMPRESSION_THRESHOLD, 10) : 1024, // 1 KiB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    zlib: {
      level: process.env.ZLIB_COMPRESSION_LEVEL ? parseInt(process.env.ZLIB_COMPRESSION_LEVEL, 10) : 6,
      chunkSize: process.env.ZLIB_CHUNK_SIZE ? parseInt(process.env.ZLIB_CHUNK_SIZE, 10) : 16 * 1024, // 16 KiB
      maxOutputLength: process.env.ZLIB_MAX_OUTPUT_LENGTH ? parseInt(process.env.ZLIB_MAX_OUTPUT_LENGTH, 10) : 10 * 1024 * 1024 // 10 MiB
    }
  }));
}