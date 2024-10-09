import { EmbedBuilder } from 'discord.js';
import { WSlashCommand } from '../../types/WSlashCommand';

export default function command(): WSlashCommand {
  return {
    name: 'initials-about',
    description: 'Info: significance of the Quranic Initials',
    handler: async (interaction) => {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Quranic Initials')
            .setDescription(
              `The Quran is characterized by a unique phenomenon never found in any other book; 29 suras are prefixed with 14 different sets of "Quranic Initials,” consisting of one to five letters per set. Fourteen letters, half the Arabic alphabet, participate in these initials. The significance of the Quranic initials remained a divinely guarded secret for 14 centuries.\n\n**Historical Understanding**\nTraditional scholars unanimously claim the true wisdom behind these letters is unknown. Since the Quran's miracle was destined to be after Muhammed (10:20), this prolonged uncertainty was in accordance with God's will, preserved for the technologically sophisticated generations.\n\n> **[10:20]** They say, "How come no miracle came down to him from his Lord?" Say, "The future belongs to GOD; so wait, and I am waiting along with you."\n\n**Major Sign**\nThe very existence of these initials hint at a mathematical code. The phrase, “these are the miracles of this book” (10:1, 12:1, 13:1, 15:1, 26:2, 27:1, 28:2, 31:2) is found only in conjunction with the Quranic initials.\n\n **[10:1]** A. L. R. These (letters) are the proofs of this book of wisdom.\n\n**[12:1]** A. L. R. These (letters) are proofs of this profound scripture.\n\n**[13:1]** A. L. M. R. These (letters) are proofs of this scripture. What is revealed to you from your Lord is the truth, but most people do not believe.\n\n**[15:1]** A.L.R. These (letters) are proofs of this scripture; a profound Quran.\n\n**[26:2]** These (letters) constitute proofs of this clarifying scripture.\n\n **[27:1]** T. S. These (letters) constitute proofs of the Quran; a profound scripture.\n\n **[28:2]** These (letters) constitute proofs of this profound book.\n\n**[31:2]** These (letters) constitute proofs of this book of wisdom.\n\n**Quranic Challenge**\nAdditionally, the Quran’s challenge, to “produce a sura like it” is only found within initialed chapters: 2:23, 10:38, 11:13.`,
            )
            .setColor('DarkButNotBlack'),
        ],
      });
    },
  };
}
