import { CommandInteractionOption } from 'discord.js';

export interface SerializedInteraction {
  type: number;
  id: string;
  channelId: string;
  guildId: string | null;
  user: string;
  locale: string;
  commandId: string;
  commandName: string;
  commandType: number;
  commandGuildId: string | null;
  deferred: boolean;
  replied: boolean;
  ephemeral: boolean | null;
  options: CommandInteractionOption[];
}

export function serializedInteraction(interaction: any): SerializedInteraction {
  return {
    type: interaction.type,
    id: interaction.id,
    channelId: interaction.channelId,
    guildId: interaction.guildId,
    user: interaction.user.id,
    locale: interaction.locale,
    commandId: interaction.commandId,
    commandName: interaction.commandName,
    commandType: interaction.commandType,
    commandGuildId: interaction.commandGuildId,
    deferred: interaction.deferred,
    replied: interaction.replied,
    ephemeral: interaction.ephemeral,
    options: interaction.options.data,
  };
}
