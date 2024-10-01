import {
  Awaitable,
  Client,
  ClientEvents,
  GatewayIntentBits,
  REST,
  Routes,
} from 'discord.js';
import { cloudEnv } from '../utils/cloud-env';
import { MainServer } from '../entrypoint/main-server';
import { DiscordServers } from '../vars/discord-servers';
import { WSlashCommand } from '../types/WSlashCommand';
import { WEventListener } from '../types/WEventListener';
import { FileUtils } from '../utils/file-utils';
import { parseDiscordError } from '../utils/parse-discord-error';
import { getCliParams } from '../utils/get-cli-params';
import { WScheduledAction } from '../types/WScheduledAction';
import { authenticateMember } from '../utils/discord-verify-member';
import { parseInteraction } from '../utils/discord-parse-interaction';

export class WBotManager {
  public static public = new this('PUBLIC');
  public static private = new this('PRIVATE');

  public type: 'PRIVATE' | 'PUBLIC';
  public client: Client;

  public slashCommands: WSlashCommand[] = [];
  public eventListeners: WEventListener[] = [];
  public scheduledActions: WScheduledAction[] = [];

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
    MainServer.log.info(`---`);
    MainServer.log.info(`Launching Bot: ${this.type}`);
    
    // Login (initialize client).
    await this.login();
    
    // Configure slash commands.
    await this.setSlashCommands();
    await this.registerSlashCommands();
    await this.listenForSlashCommands();
    
    // Configure event listeners.
    await this.setEventListeners();
    await this.activateEventListeners();

    // Configure scheduled actions.
    await this.setScheduledActions();
    await this.activateScheduledActions();

    // Ready.
    MainServer.log.info(`Ready`);
    MainServer.log.info(`---`);
  }

  private async login(): Promise<void> {
    const { token } = await this.getBotCredentials();
    await this.client.login(token);
    MainServer.log.info(
      `Online as "${this.client.user?.username}". In ${this.client.guilds.cache.size} guilds.`,
    );
  }

  async getBotCredentials(): Promise<{
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

  private async setSlashCommands(): Promise<void> {
    this.slashCommands =
      this.type === 'PUBLIC'
        ? await FileUtils.getDefaultExportsFromDirectory<WSlashCommand>(
            '/bot-public/slash-commands',
          )
        : await FileUtils.getDefaultExportsFromDirectory<WSlashCommand>(
            '/bot-private/slash-commands',
          );
  }

  private async registerSlashCommands(): Promise<void> {
    const cliParams = getCliParams();

    if (cliParams.includes('ncs') || cliParams.includes('no-command-sync')) {
      MainServer.log.warn(`Skipping command sync (as requested)`);
      return;
    }

    if (this.slashCommands.length === 0) {
      MainServer.log.info(`No slash commands found`);
      return;
    }

    const { token, clientId } = await this.getBotCredentials();
    const rest = new REST().setToken(token);

    // Public bot commands are registered globally.
    if (this.type === 'PUBLIC') {
      try {
        await rest.put(Routes.applicationCommands(clientId), {
          body: this.slashCommands,
        });
        MainServer.log.info(
          `Private Bot Commands Synced: ${this.slashCommands
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
            body: this.slashCommands,
          },
        );
        await rest.put(
          Routes.applicationGuildCommands(
            clientId,
            DiscordServers.WikiSubmissionDevelopers.id,
          ),
          {
            body: this.slashCommands,
          },
        );
        MainServer.log.info(
          `Private Bot Commands Synced: ${this.slashCommands
            .map((c) => `/${c.name}`)
            .join(', ')}`,
        );
      } catch (error) {
        parseDiscordError(error, `registerSlashCommands @ ${__dirname}`, true);
      }
    }
  }

  private async setEventListeners(): Promise<void> {
    this.eventListeners =
      this.type === 'PUBLIC'
        ? await FileUtils.getDefaultExportsFromDirectory<WEventListener>(
            '/bot-public/event-listeners',
          )
        : await FileUtils.getDefaultExportsFromDirectory<WEventListener>(
            '/bot-private/event-listeners',
          );
  }

  private async activateEventListeners(): Promise<void> {
    if (this.eventListeners.length === 0) {
      MainServer.log.info(`No event listeners found`);
      return;
    }

    for (const eventListener of this.eventListeners) {
      this.addEventListener(
        eventListener.name,
        async () => {
          // @ts-ignore
          await eventListener.handler();
        },
        eventListener.once ? true : false,
      );
    }
    MainServer.log.info(
      `Listening for events: ${this.eventListeners
        .map((e) => e.name)
        .join(', ')}`,
    );
  }

  private async setScheduledActions(): Promise<void> {
    this.scheduledActions =
      this.type === 'PUBLIC'
        ? await FileUtils.getDefaultExportsFromDirectory<WScheduledAction>(
            '/bot-public/scheduled-actions',
          )
        : await FileUtils.getDefaultExportsFromDirectory<WScheduledAction>(
            '/bot-private/scheduled-actions',
          );
  }

  private async activateScheduledActions(): Promise<void> {
    if (this.scheduledActions.length === 0) {
      MainServer.log.info(`No scheduled actions found`);
      return;
    }

    for (const scheduledAction of this.scheduledActions) {
      scheduledAction.action();
    }
    MainServer.log.info(
      `Scheduled actions: ${this.scheduledActions.map((s) => s.id).join(', ')}`,
    );
  }

  async addEventListener<Event extends keyof ClientEvents>(
    event: Event,
    listener: (...args: ClientEvents[Event]) => Awaitable<void>,
    once?: boolean,
  ) {
    this.client[once ? 'once' : 'on'](
      event,
      async (...args: ClientEvents[Event]) => {
        try {
          await listener(...args);
        } catch (error) {
          parseDiscordError(error, `${__dirname} (Event Listener)`);
        }
      },
    );
  }

  private async listenForSlashCommands() {
    this.addEventListener('interactionCreate', async (interaction) => {
      if (interaction.isCommand()) {
        const startTime = Date.now();
        MainServer.log.info(parseInteraction(interaction));

        for (const slashCommand of this.slashCommands) {
          if (interaction.commandName === slashCommand.name) {
            try {
              // Early return case: unsupported DM use.
              if (slashCommand.disabled_in_dm && !interaction.guild) {
                await interaction.reply({
                  content:
                    '`This command has been disabled in DMs. Please try in a server.`',
                  ephemeral: true,
                });
                return;
              }

              // Early return case: unauthorized user.
              if (
                slashCommand.access_control &&
                !authenticateMember(
                  interaction.member,
                  slashCommand.access_control,
                )
              ) {
                await interaction.reply({
                  content: '`Unauthorized`',
                  ephemeral: true,
                });
                return;
              }

              // Run slash command handler.
              await slashCommand.handler(interaction);

              // Record ping.
              const endTime = Date.now();
              MainServer.log.info(
                `[${interaction.id}] completed in ${(
                  endTime - startTime
                ).toFixed(0)}ms`,
              );
            } catch (error) {
              parseDiscordError(error, `${__dirname} (Slash Command Handler)`);
            }
          }
        }
      }
    });
  }
}
