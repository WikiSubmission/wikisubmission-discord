import {
  ButtonInteraction,
  CommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';

// A combined type of the actual command payload and some internal properties.
export type WSlashCommand = RESTPostAPIApplicationCommandsJSONBody & {
  // Handler function to fire on a valid 'interactionCreate'.
  handler: (
    interaction: CommandInteraction,
  ) => Promise<CommandInteraction | ButtonInteraction>;

  // Access control to impose before the handler is executed. Tells the user "Unauthorized" if check is not passed.
  access_control?:
    | string[]
    | 'VERIFIED_AND_ABOVE'
    | 'INSIDER_AND_ABOVE'
    | 'MOD_AND_ABOVE'
    | 'ADMIN';

  // Enforce guild-only support before the handler is executed. Tells the user "This command has been disabled for DMs" if check is not passed.
  disabled_in_dm?: boolean;
};
