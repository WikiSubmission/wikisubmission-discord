import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { WSlashCommand } from '../../types/WSlashCommand';
import { Database } from '../../types/generated/database.types';

export default function command(): WSlashCommand {
  return {
    name: 'random-verse',
    description: 'Get a random verse from the Quran',
    options: [
      {
        name: 'language',
        description: 'Choose another language',
        type: ApplicationCommandOptionType.String,
        choices: ['turkish'].map((i) => ({
          name: i,
          value: i,
        })),
        name_localizations: {
          tr: 'dil',
        },
        description_localizations: {
          tr: 'Farklı dil?',
        },
      },
    ],
    name_localizations: {
      tr: 'rastgele',
    },
    description_localizations: {
      tr: 'Rastgele ayet',
    },
    handler: async (interaction) => {
      const request = await fetch(
        `https://api.wikisubmission.org/quran/random-verse?ngc=true`,
      );

      const result: {
        results: Database['public']['Tables']['DataQuran']['Row'][];
        error?: { name: string; description: string };
      } = await request.json();

      if (result && result.results && !result.error) {
        let isTurkish =
          interaction.options.get('language')?.value === 'turkish' ||
          interaction.locale === 'tr';

        if (interaction.options.get('language')?.value === 'english') {
          isTurkish = false;
        }

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                isTurkish
                  ? `Sure ${result.results[0].chapter_number}, ${result.results[0].chapter_title_turkish}`
                  : `Sura ${result.results[0].chapter_number}, ${result.results[0].chapter_title_english}`,
              )
              .setDescription(
                `**[${result.results[0].verse_id}]** ${
                  result.results[0][
                    isTurkish ? 'verse_text_turkish' : 'verse_text_english'
                  ]
                }\n\n${result.results[0].verse_text_arabic}`,
              )
              .setFooter({
                text: isTurkish
                  ? 'Kuran: Son Ahit • Turkish'
                  : 'Quran: The Final Testament • Random Verse',
              })
              .setColor('DarkButNotBlack'),
          ],
        });
      } else {
        await interaction.reply({
          content: `\`API Error\``,
          ephemeral: true,
        });
      }
    },
  };
}
