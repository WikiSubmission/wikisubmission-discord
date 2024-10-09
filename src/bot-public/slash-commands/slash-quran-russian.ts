import { WSlashCommand } from '../../types/WSlashCommand';
import baseCommand from './slash-quran';

export default function command(): WSlashCommand {
  return {
    ...baseCommand(),
    name: 'rquran',
    description: 'Quran | Russian 🇷🇺',
    options: [...(baseCommand().options || [])],
  };
}
