import { CommandInteraction, ButtonInteraction } from 'discord.js';

export function parseInteraction(
  interaction: CommandInteraction | ButtonInteraction,
): string | null {
  if (interaction instanceof CommandInteraction) {
    return `[${interaction.id}] /${interaction.commandName}${
      interaction.options.data.length > 0
        ? ` ${interaction.options.data
            .map((i) => `[${i.name}:${i.value}]`)
            .join(' ')}`
        : ''
    } @ ${
      interaction.guild
        ? `"${interaction.guild.name}" (${interaction.guild.id})`
        : 'N.A.'
    } / @${interaction.user.username} (${interaction.user.id})`;
  } else if (interaction instanceof ButtonInteraction) {
    return null;
  } else return null;
}
