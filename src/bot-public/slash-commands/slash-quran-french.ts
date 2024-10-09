import { WSlashCommand } from '../../types/WSlashCommand';
import baseCommand from './slash-quran';

export default function command(): WSlashCommand {
  return {
    ...baseCommand(),
    name: 'fquran',
    description: 'Quran | French 🇫🇷',
    options: [...(baseCommand().options || [])],
  };
}
