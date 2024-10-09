import { WSlashCommand } from '../../types/WSlashCommand';
import baseCommand from './slash-quran';

export default function command(): WSlashCommand {
  return {
    ...baseCommand(),
    name: 'bquran',
    description: 'Quran | Bashasa 🇲🇾',
    options: [...(baseCommand().options || [])],
  };
}
