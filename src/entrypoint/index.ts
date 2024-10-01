import { loadEnvironmentVariables } from './environment-variables';
import { MainServer } from './main-server';
import { Host } from '../vars/host';
import { getCliParams } from '../utils/get-cli-params';
import { WBotManager } from '../core/bot-manager';
import { DiscordAPIError } from 'discord.js';
import { parseDiscordError } from '../utils/parse-discord-error';

(async () => {
  try {
    // Start server.
    await loadEnvironmentVariables();
    await MainServer.listen({ port: 3010, host: Host });

    // Start bots.
    const cliParams = getCliParams();

    if (cliParams.includes('public')) {
      await WBotManager.public.start();
    }

    if (cliParams.includes('private')) {
      await WBotManager.private.start();
    }

    if (!cliParams.includes('public') && !cliParams.includes('private')) {
      await WBotManager.public.start();
      await WBotManager.private.start();
    }
  } catch (error) {
    if (error instanceof DiscordAPIError) {
      MainServer.log.warn(`**Unresolved Discord Error**`);
      parseDiscordError(error);
    } else {
      MainServer.log.error(error);
    }
  }
})();
