import { SystemCache } from './system-cache';
import { MainServer } from '../entrypoint/main-server';
import { getSupabaseClient } from './supabase-client';

export type EnvironmentVariables =
  | 'NODE_ENV'
  | 'AWS_ACCESS_KEY'
  | 'AWS_SECRET_KEY'
  | 'DIGITALOCEAN_SPACES_SECRET_ACCESS_KEY'
  | 'DIGITALOCEAN_SPACES_ACCESS_KEY_ID'
  | 'AWS_REGION'
  | 'GOOGLE_API_KEY'
  | 'DISCORD_WIKISUBMISSION_TOKEN'
  | 'DISCORD_WIKISUBMISSION_CLIENT_ID'
  | 'DISCORD_SUBMISSIONMOD_TOKEN'
  | 'DISCORD_SUBMISSIONMOD_CLIENT_ID'
  | 'DISCORD_TESTING_TOKEN'
  | 'DISCORD_TESTING_CLIENT_ID'
  | 'DISCORD_WEBHOOK_API_ERROR_LOG'
  | 'DISCORD_WEBHOOK_SYSTEM_ERROR_LOG';

export async function cloudEnv(
  secret: EnvironmentVariables,
  critical: boolean = true,
): Promise<string> {
  const cached = SystemCache.get(secret);
  if (cached) {
    return cached as string;
  }
  const client = getSupabaseClient();
  const request = await client
    .from('Secrets')
    .select('*')
    .eq('key', secret)
    .single();

  if (request.status === 200 && request.data?.value) {
    SystemCache.set(secret, request.data.value);
    return request.data.value;
  } else {
    if (process.env[secret]) {
      MainServer.log.warn(
        `Failed to remotely fetch environment variable: ${secret} (${request.error?.message || '--'}). Returning from local .env file.`,
      );
      return process.env[secret];
    } else if (critical) {
      MainServer.log.fatal(
        `Failed to remotely fetch environment variable: ${secret} (${request.error?.message || '--'}). Crashing.`,
      );
      process.exit(1);
    } else {
      MainServer.log.warn(
        `Failed to remotely fetch environment variable: ${secret} (${request.error?.message || '--'}). Ensure available or store in .env file.`,
      );
      return '';
    }
  }
}
