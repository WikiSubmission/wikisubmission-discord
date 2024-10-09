import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { WSlashCommand } from '../../types/WSlashCommand';
import { RawData } from './__raw_data';

export default function command(): WSlashCommand {
  return {
    name: 'appendix',
    description: 'Load an Appendix from Quran: The Final Testament',
    name_localizations: {
      tr: 'tr',
    },
    description_localizations: {
      tr: "Kuran'dan bir Ek Yükle: Son Ahit",
    },
    options: [
      {
        name: 'number',
        description: 'Appendix number?',
        type: ApplicationCommandOptionType.Integer,
        required: true,
        name_localizations: {
          tr: 'ek-numarası',
        },
        description_localizations: {
          tr: '0 - 38',
        },
      },
    ],
    handler: async (interaction) => {
      const appendixNumber = parseInt(
        `${interaction.options.get('number')?.value}`,
        10,
      );

      const appendix = RawData.DataAppendices.find(
        (i) => i.appendix_number === appendixNumber,
      );

      if (!appendix) {
        await interaction.reply({
          content: `\`Appendix # must be between 0 - 38\``,
          ephemeral: true,
        });
      } else {
        if (
          interaction.options.get('language')?.value === 'turkish' ||
          interaction.locale === 'tr'
        ) {
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(
                  `Ek ${appendix.appendix_number}, ${appendix.appendix_title_turkish}`,
                )
                .setDescription(
                  `${appendix.appendix_preview_turkish}\n\n
                Ekin tamamını okuyun:\n${appendix.appendix_url_turkish}\n\nİngilizce:\n${appendix.appendix_url_english}`,
                )
                .setFooter({ text: 'Kuran: Son Ahit • Ekler' })
                .setColor('DarkButNotBlack'),
            ],
          });
        } else {
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(
                  `Appendix ${appendix.appendix_number}, ${appendix.appendix_title_english}`,
                )
                .setDescription(
                  `${appendix.appendix_preview_english}\n\nRead full Appendix at:\n${appendix.appendix_url_english}`,
                )
                .setFooter({ text: 'Quran: The Final Testament • Appendices' })
                .setColor('DarkButNotBlack'),
            ],
          });
        }
      }
    },
  };
}
