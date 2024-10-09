import { EmbedBuilder } from 'discord.js';
import { WSlashCommand } from '../../types/WSlashCommand';
import { RawData } from './__raw_data';

export default function command(): WSlashCommand {
  return {
    name: 'appendices',
    description: 'Load the 38 Appendices list from Quran: The Final Testament',
    name_localizations: {
      tr: 'ekler',
    },
    description_localizations: {
      tr: "Kur'an-ı Kerim'den 38 Ek Listesi",
    },
    handler: async (interaction) => {
      if (
        interaction.options.get('language')?.value === 'turkish' ||
        interaction.locale === 'tr'
      ) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Ekler')
              .setDescription(
                RawData.DataAppendices.map(
                  (i) =>
                    `${i.appendix_number}: [${i.appendix_title_turkish}](${i.appendix_url_turkish}) ([İngilizce](${i.appendix_url_english}))`,
                ).join('\n'),
              )
              .setFooter({ text: 'Kuran: Son Ahit • Ekler' })
              .setColor('DarkButNotBlack'),
          ],
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Appendices')
              .setDescription(
                RawData.DataAppendices.map(
                  (i) =>
                    `${i.appendix_number}: [${i.appendix_title_english}](${i.appendix_url_english})`,
                ).join('\n'),
              )
              .setFooter({ text: 'Quran: The Final Testament • Appendices' })
              .setColor('DarkButNotBlack'),
          ],
        });
      }
    },
  };
}
