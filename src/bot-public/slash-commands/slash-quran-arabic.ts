import { WSlashCommand } from '../../types/WSlashCommand';
import baseCommand from './slash-quran';

export default function command(): WSlashCommand {
  return {
    ...baseCommand(),
    name: 'aquran',
    description: 'Quran | Arabic 🇪🇬',
    options: [...(baseCommand().options || [])],
  };
}
