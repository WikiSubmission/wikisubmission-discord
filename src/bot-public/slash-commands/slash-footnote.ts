import { ApplicationCommandOptionType } from 'discord.js';
import { DiscordQuranRequest } from '../../core/discord-quran-request';
import { WSlashCommand } from '../../types/WSlashCommand';

export default function command(): WSlashCommand {
  return {
    name: 'footnote',
    description: 'Load a footnote from Quran: The Final Testament',
    name_localizations: {
      tr: 'dipnot',
    },
    description_localizations: {
      tr: 'Dipnot yükle',
    },
    options: [
      {
        name: 'verse',
        description: 'Verse #:# (or #:#-#)',
        type: ApplicationCommandOptionType.String,
        required: true,
        name_localizations: {
          tr: 'ayet',
        },
        description_localizations: {
          tr: 'Ayet numarasını girin',
        },
      },
    ],
    handler: async (interaction) => {
      await new DiscordQuranRequest(interaction, 1, {
        footnoteOnly: true,
      }).getResultsAndReply();
    },
  };
}
