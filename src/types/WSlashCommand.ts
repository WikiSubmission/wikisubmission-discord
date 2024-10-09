import {
  CommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { WDiscordAccessControlList } from './WDiscordAccessControlList';

// A combined type of the actual command payload and some internal properties.
export type WSlashCommand = RESTPostAPIChatInputApplicationCommandsJSONBody & {
  // Handler function to fire on a valid 'interactionCreate'.
  handler: (interaction: CommandInteraction) => Promise<void>;

  // Access control to impose before the handler is executed. Tells the user "Unauthorized" if check is not passed.
  access_control?: WDiscordAccessControlList;

  // Enforce guild-only support before the handler is executed. Tells the user "This command has been disabled for DMs" if check is not passed.
  disabled_in_dm?: boolean;
};
