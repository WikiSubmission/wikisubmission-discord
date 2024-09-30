import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { cloudEnv } from '../utils/cloud-env';
import { MainServer } from '../entrypoint/main-server';
import { DiscordServers } from '../vars/discord-servers';
import { WSlashCommand } from '../types/WSlashCommand';
import { WEventListener } from '../types/WEventListener';
import { FileUtils } from '../utils/file-utils';
import { parseDiscordError } from '../utils/parse-discord-error';
import { getCliParams } from '../utils/get-cli-params';
import { DiscordScheduledAction } from '../types/WScheduledAction';

export class WBotManager {
  static public = new this('PUBLIC');
  static private = new this('PRIVATE');

  public type: 'PRIVATE' | 'PUBLIC';
  public client: Client;

  constructor(type: WBotManager['type']) {
    this.type = type;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        ...(this.type === 'PRIVATE'
          ? [
              /** PRIVILEGED INTENTS: */
              GatewayIntentBits.GuildMembers,
              GatewayIntentBits.GuildMessages,
              GatewayIntentBits.GuildModeration,
              GatewayIntentBits.MessageContent,
              GatewayIntentBits.DirectMessages,
            ]
          : []),
      ],
      presence: {
        status: 'online',
        activities: [
          {
            name:
              this.type === 'PUBLIC'
                ? 'Righteousness'
                : 'The Submission Server',
            type: this.type === 'PUBLIC' ? 5 : 3,
          },
        ],
      },
    });
  }

  async start() {
    await this.login();
    await this.registerSlashCommands();
    await this.listenToClientEvents();
    await this.scheduleActions();
    MainServer.log.info(`Ready`);
  }

  private async login(): Promise<void> {
    const { token } = await this.getBotCredentials();
    this.client.login(token);
    MainServer.log.info(
      `Initialized client. Username: "${this.client.user?.username}". ${this.client.guilds.cache.size} guilds.`,
    );
  }

  private async getBotCredentials(): Promise<{
    token: string;
    clientId: string;
  }> {
    return this.type === 'PUBLIC'
      ? {
          token: await cloudEnv(
            process.env.NODE_ENV === 'production'
              ? 'DISCORD_WIKISUBMISSION_TOKEN'
              : 'DISCORD_TESTING_TOKEN',
          ),
          clientId: await cloudEnv(
            process.env.NODE_ENV === 'production'
              ? 'DISCORD_WIKISUBMISSION_CLIENT_ID'
              : 'DISCORD_TESTING_CLIENT_ID',
          ),
        }
      : {
          token: await cloudEnv('DISCORD_SUBMISSIONMOD_TOKEN'),
          clientId: await cloudEnv('DISCORD_SUBMISSIONMOD_CLIENT_ID'),
        };
  }

  private async registerSlashCommands(): Promise<void> {
    const cliParams = getCliParams();

    if (cliParams.includes('ncs') || cliParams.includes('no-command-sync')) {
      MainServer.log.warn(`Skipping command sync (as requested)`);
      return;
    }

    const slashCommands = await this.getSlashCommands();
    const { token, clientId } = await this.getBotCredentials();
    const rest = new REST().setToken(token);

    // Public bot commands are registered globally.
    if (this.type === 'PUBLIC') {
      try {
        await rest.put(Routes.applicationCommands(clientId), {
          body: slashCommands,
        });
        MainServer.log.info(
          `Private Bot Commands Synced: ${slashCommands
            .map((c) => `/${c.name}`)
            .join(', ')}`,
        );
      } catch (error) {
        parseDiscordError(error, `registerSlashCommands @ ${__dirname}`, true);
      }
    }

    // Private bot commands are registered only for Submission & Internal Dev server.
    if (this.type === 'PRIVATE') {
      try {
        await rest.put(
          Routes.applicationGuildCommands(
            clientId,
            DiscordServers.Submission.id,
          ),
          {
            body: slashCommands,
          },
        );
        await rest.put(
          Routes.applicationGuildCommands(
            clientId,
            DiscordServers.WikiSubmissionDevelopers.id,
          ),
          {
            body: slashCommands,
          },
        );
        MainServer.log.info(
          `Private Bot Commands Synced: ${slashCommands
            .map((c) => `/${c.name}`)
            .join(', ')}`,
        );
      } catch (error) {
        parseDiscordError(error, `registerSlashCommands @ ${__dirname}`, true);
      }
    }
  }

  async getSlashCommands(): Promise<WSlashCommand[]> {
    const slashCommands =
      this.type === 'PUBLIC'
        ? await FileUtils.getDefaultExportsFromDirectory<WSlashCommand>(
            '/bot-public/slash-commands',
          )
        : await FileUtils.getDefaultExportsFromDirectory<WSlashCommand>(
            '/bot-private/slash-commands',
          );

    return slashCommands;
  }

  private async listenToClientEvents(): Promise<void> {
    const eventListeners = await this.getEventListeners();

    for (const eventListener of eventListeners) {
      this.client[eventListener.once ? 'once' : 'on'](
        eventListener.name,
        async () => {
          try {
            // @ts-ignore
            await eventListener.handler();
          } catch (error) {
            parseDiscordError(error, `listenToClientEvents @ ${__dirname}`);
          }
        },
      );
    }
    MainServer.log.info(
      `Listening for events: ${eventListeners.map((e) => e.name).join(', ')}`,
    );
  }

  async getEventListeners(): Promise<WEventListener[]> {
    const eventListeners =
      this.type === 'PUBLIC'
        ? await FileUtils.getDefaultExportsFromDirectory<WEventListener>(
            '/bot-public/event-listeners',
          )
        : await FileUtils.getDefaultExportsFromDirectory<WEventListener>(
            '/bot-private/event-listeners',
          );

    return eventListeners;
  }

  private async scheduleActions(): Promise<void> {
    const scheduledActions = await this.getScheduledActions();

    for (const scheduledAction of scheduledActions) {
      scheduledAction.action();
    }
    MainServer.log.info(
      `Scheduled actions: ${scheduledActions.map((s) => s.id).join(', ')}`,
    );
  }

  async getScheduledActions(): Promise<DiscordScheduledAction[]> {
    const scheduledActions =
      this.type === 'PUBLIC'
        ? await FileUtils.getDefaultExportsFromDirectory<DiscordScheduledAction>(
            '/bot-public/scheduled-actions',
          )
        : await FileUtils.getDefaultExportsFromDirectory<DiscordScheduledAction>(
            '/bot-private/scheduled-actions',
          );

    return scheduledActions;
  }
}
