import { DiscordAPIError } from 'discord.js';
import { MainServer } from '../entrypoint/main-server';

export function parseDiscordError(
  error: any,
  source?: string,
  crash?: boolean,
): void {
  if (error instanceof DiscordAPIError) {
    const parsed = `${error.code} ${error.message} @ ${error.url}.${source ? ` (source: ${source}).` : ``}${crash ? ` TERMINATING.` : ``}`;
    MainServer.log[crash ? 'fatal' : 'error'](parsed);
    if (crash) process.exit(1);
  } else {
    const parsed = `${error.message || 'Unknown Internal Error'}`;
    MainServer.log[crash ? 'fatal' : 'error'](parsed);
    if (crash) process.exit(1);
  }
}
