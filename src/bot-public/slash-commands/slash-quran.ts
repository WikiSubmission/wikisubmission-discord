import { WSlashCommand } from '../../types/WSlashCommand';
import { DiscordQuranRequest } from '../../core/discord-quran-request';
import { ApplicationCommandOptionType } from 'discord.js';

export default function command(): WSlashCommand {
  return {
    name: 'quran',
    description: 'Quran | English 🇺🇸',
    options: [
      {
        name: 'verse',
        description: 'Verse #:# (or #:#-#)',
        required: true,
        type: ApplicationCommandOptionType.String,
        name_localizations: {
          tr: 'ayet',
        },
        description_localizations: {
          tr: 'Ayet numarasını girin',
        },
      },
      {
        name: 'no-footnotes',
        description: 'Ignore subtitles & footnotes?',
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: 'yes',
            value: 'yes',
          },
        ],
        name_localizations: {
          tr: 'yorum-yok',
        },
        description_localizations: {
          tr: 'Altyazı ve dipnot yok mu?',
        },
      },
      {
        name: 'with-transliteration',
        description: 'Include Arabic transliteration?',
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: 'yes',
            value: 'yes',
          },
        ],
        name_localizations: {
          tr: 'transliterasyon',
        },
        description_localizations: {
          tr: 'transliterasyon içerir?',
        },
      },
    ],
    handler: async (interaction) => {
      await new DiscordQuranRequest(interaction).getResultsAndReply();
    },
  };
}
