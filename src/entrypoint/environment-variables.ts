import dotenv from 'dotenv';
import { MainServer } from './main-server';

/**
 * @function loadEnvironment
 * @description Sets the environment variables. Only Supabase credentials are required upfront. All others are fetched on-demand. NODE_ENV should be set to 'production' when needed.
 */
export async function loadEnvironmentVariables() {
  dotenv.config();
  if (process.env.SUPABASE_URL && process.env.SUPABASE_API_KEY) {
    MainServer.log.info(
      `NODE_ENV: ${process.env.NODE_ENV || 'development (default)'}`,
    );
    MainServer.log.info(`Environment variables loaded\n`);
  } else {
    MainServer.log.error(
      `Missing environment variables: SUPABASE_URL, SUPABASE_API_KEY`,
    );
    MainServer.close();
    process.exit(1);
  }
}
