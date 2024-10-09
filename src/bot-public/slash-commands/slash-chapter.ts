import { ApplicationCommandOptionType } from 'discord.js';
import { WSlashCommand } from '../../types/WSlashCommand';
import baseCommand from './slash-quran';
import { RawData } from './__raw_data';

export default function command(): WSlashCommand {
  return {
    ...baseCommand(),
    name: 'chapter',
    description: 'Quran | Load a chapter',
    options: [
      {
        name: 'chapter',
        description: 'Chapter # (1 - 114)',
        type: ApplicationCommandOptionType.String,
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
        name: 'transliteration',
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
      {
        name: 'with-arabic',
        description: 'Include Arabic?',
        type: ApplicationCommandOptionType.String,
        name_localizations: {
          tr: 'arapça',
        },
        description_localizations: {
          tr: 'Arapça içerir?',
        },
        choices: [
          {
            name: 'yes',
            value: 'yes',
          },
        ],
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
    ],
  };
}
