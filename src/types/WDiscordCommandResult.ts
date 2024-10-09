import { EmbedBuilder, ActionRowBuilder } from 'discord.js';

export interface WDiscordCommandResult {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<any>[];
  content?: string;
}
