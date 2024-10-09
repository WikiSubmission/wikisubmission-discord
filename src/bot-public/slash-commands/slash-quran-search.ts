import { ApplicationCommandOptionType } from 'discord.js';
import { WSlashCommand } from '../../types/WSlashCommand';
import baseCommand from './slash-quran';
import { DiscordQuranRequest } from '../../core/discord-quran-request';
import { RawData } from './__raw_data';

export default function command(): WSlashCommand {
  return {
    ...baseCommand(),
    name: 'search-quran',
    description: 'Quran | Search the text',
    options: [
      {
        name: 'query',
        type: ApplicationCommandOptionType.String,
        description: 'What are you looking for?',
        required: true,
        name_localizations: {
          tr: 'sure',
        },
        description_localizations: {
          tr: 'Sure numarasını girin',
        },
      },
      {
        name: 'no-footnotes',
        type: ApplicationCommandOptionType.String,
        description: 'Ignore subtitles & footnotes?',
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
        name: 'language',
        description: 'Which language?',
        type: ApplicationCommandOptionType.String,
        choices: RawData.QuranLanguages.map((i) => ({
          name: i,
          value: i,
        })),
      },
      {
        name: 'with-arabic',
        description: 'Include Arabic?',
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: 'yes',
            value: 'yes',
          },
        ],
        name_localizations: {
          tr: 'arapça',
        },
        description_localizations: {
          tr: 'Arapça içerir?',
        },
      },
      {
        name: 'strict-search',
        description:
          'Enforce the specific word order in the query to match in results',
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: 'yes',
            value: 'yes',
          },
        ],
      },
    ],
    handler: async (interaction) => {
      await new DiscordQuranRequest(interaction).getResultsAndReply();
    },
  };
}
