import { ApplicationCommandOptionType } from 'discord.js';
import { WSlashCommand } from '../../types/WSlashCommand';
import baseCommand from './slash-quran';

export default function command(): WSlashCommand {
  return {
    ...baseCommand(),
    name: 'tquran',
    description: 'Quran | Turkish 🇹🇷',
    name_localizations: {
      tr: 'kuran',
    },
    description_localizations: {
      tr: 'Kuran | Türkçe 🇹🇷',
    },
    options: [
      ...(baseCommand().options || []),
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
      },
    ],
  };
}
