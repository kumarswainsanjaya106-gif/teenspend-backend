import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` TeenSpend API Server Started Successfully`);
  console.log(` Mode: ${config.nodeEnv}`);
  console.log(` Port: ${PORT}`);
  console.log(` URL:  http://localhost:${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});

// Graceful shutdown handling
const shutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Closing HTTP server gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
