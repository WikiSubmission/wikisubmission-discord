import { WSlashCommand } from '../../types/WSlashCommand';
import baseCommand from './slash-quran';

export default function command(): WSlashCommand {
  return {
    ...baseCommand(),
    name: 'tmquran',
    description: 'Quran | Tamil 🇮🇳',
    options: [...(baseCommand().options || [])],
  };
}
