import { connectDB } from './config/db';
import { env } from './config/env';
import { startCronJobs } from './services/cron.service';
import app from './app';

const startServer = async () => {
  const server = app.listen(env.PORT, () => {
    console.log(`ELV CONNECT API - ${env.NODE_ENV} - port ${env.PORT}`);
    console.log(`   Health: http://localhost:${env.PORT}/health`);
    console.log(`   API:    http://localhost:${env.PORT}/api/v1`);
  });

  const dbConnected = await connectDB();
  if (dbConnected) {
    startCronJobs();
    return;
  }

  console.warn(
    'API is running without MongoDB. Auth redirect/setup routes will work, but persistent data needs MongoDB access.'
  );

  return server;
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
