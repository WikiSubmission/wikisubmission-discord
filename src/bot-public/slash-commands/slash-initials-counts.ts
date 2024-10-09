import { EmbedBuilder } from 'discord.js';
import { WSlashCommand } from '../../types/WSlashCommand';

export default function command(): WSlashCommand {
  return {
    name: 'initials-counts',
    description: 'Info: the total counts of the Quranic Initials',
    handler: async (interaction) => {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Quranic Initials')
            .setDescription(
              `**Counts**\n\n'Alef Lam Meem' = 19874 = **19 x 1046**\n'Alef Lam Meem Saad' = 5320 = **19 x 280**\n'Alef Lam Ra' = 9462 = **19 x 498**\n'Alef Lam Meem Ra' = 1482 = **19 x 78**\n'Kaf Ha Ya Ayn Saad' = 798 = **19 x 42**\n'Ya Seen' = 285 = **19 x 15**\n'Saad' = 152 = **19 x 8**\n'HHa Meem' = 2147 = **19 x 113**\n'Ayn Seen Qaf' = 209 = **19 x 11**\n'Qaf' = 114 = **19 x 6**\n'Noon' = 133 = **19 x 7**\n['Ha, Ta Ha, Ta Seen, Ta Seen Meem' = 1767 = **19 x 93**]\n\n**Additional Resources**\n\n[Appendix 1](https://docs.wikisubmission.org/library/books/quran-the-final-testament-appendix-1)\n[Visual Presentation](https://docs.wikisubmission.org/library/books/visual-presentation-of-the-miracle)\n[Computer Speaks](https://docs.wikisubmission.org/library/books/the-computer-speaks)\n[**New:** Digitized Initial Counts](https://qurantalk.gitbook.io/quran-initial-count/)`,
            )
            .setColor('DarkButNotBlack'),
        ],
      });
    },
  };
}
