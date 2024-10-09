import { EmbedBuilder } from 'discord.js';
import { WSlashCommand } from '../../types/WSlashCommand';

export default function command(): WSlashCommand {
  return {
    name: 'initials-list',
    description: 'Info: a list of the 14 Quranic Initials',
    handler: async (interaction) => {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Quranic Initials')
            .setDescription(
              `**Chapter List**\n\nChapter 2: ا ل م Alef Lam Meem\nChapter 3: ا ل م Alef Lam Meem\nChapter 7: ا ل م ص Alef Lam Meem Saad\nChapter 10: ا ل ر Alef Lam Ra\nChapter 11: ا ل ر Alef Lam Ra\nChapter 12: ا ل ر Alef Lam Ra\nChapter 13: ا ل م ر Alef Lam Meem Ra \nChapter 14: ا ل ر Alef Lam Ra\nChapter 15: ا ل ر Alef Lam Ra\nChapter 19: ك ه ي ع ص Kaf Ha Ya Ayn Saad\nChapter 20: ط ه Ta Ha\nChapter 26: ط س م Ta Seen Meem\nChapter 27: ط س Ta Seen\nChapter 28: ط س م Ta Seen Meem\nChapter 29: ا ل م Alef Lam Meem\nChapter 30: ا ل م Alef Lam Meem\nChapter 31: ا ل م Alef Lam Meem\nChapter 32: ا ل م Alef Lam Meem\nChapter 36: ي س Ya Seen\nChapter 38: ص Saad\nChapter 40: ح م HHA Meem\nChapter 41: ح م HHA Meem \nChapter 42: ح م ع س ق HHA Meem, Ayn Seen Qaf\nChapter 43: ح م HHA Meem\nChapter 44: ح م HHA Meem\nChapter 45: ح م HHA Meem\nChapter 46: ح م HHA Meem\nChapter 50: ق Qaf\nChapter 68: ن Noon\n\n**Summary**\n\n**14 Initials**\nا – ل – م – ص – ر – ك – ه – ي – ع – ط – س – ح – ق – ن\n\n**14 Combinations**\nالم – المص – المر – الر – كهيعص – طه – طسم – طس – يس – ص – حم – عسق – ق – ن\n\n**29 Chapters**\n2, 3, 7, 10, 11, 12, 13, 14, 15, 19, 20, 26, 27, 28, 29, 30, 31, 32, 36, 38, 40, 41, 42, 43, 44, 45, 46, 50, 68\n\nIn short, there are **14** initial letters — found in **14** different combinations (‘initial sets’) — which prefix **29** different chapters.`,
            )
            .setColor('DarkButNotBlack'),
        ],
      });
    },
  };
}
