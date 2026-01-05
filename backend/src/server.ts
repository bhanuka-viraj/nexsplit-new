import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { Logger } from './config/logger';

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    Logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    Logger.info(`Swagger Docs available at http://localhost:${env.PORT}/api-docs`);
  });
};

startServer();
