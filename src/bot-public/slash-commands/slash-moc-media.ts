import { ApplicationCommandOptionType } from 'discord.js';
import { DiscordMediaRequest } from '../../core/discord-media-request';
import { WSlashCommand } from '../../types/WSlashCommand';

export default function command(): WSlashCommand {
  return {
    name: 'search-media',
    description: "Search through Dr. Khalifa's sermons, programs and audios",
    options: [
      {
        name: 'query',
        description: 'What are you looking for?',
        type: ApplicationCommandOptionType.String,
        required: true,
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
      {
        name: 'specific-category',
        description: 'Choose a specific category (sermons, programs, audios)',
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: 'sermons',
            value: 'sermons',
          },
          {
            name: 'programs',
            value: 'programs',
          },
          {
            name: 'audios',
            value: 'audios',
          },
        ],
      },
    ],
    handler: async (interaction) => {
      await new DiscordMediaRequest(interaction).getResultsAndReply();
    },
  };
}
