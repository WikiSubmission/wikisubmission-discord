import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { DiscordRequest } from './discord-command-request';
import type { WDiscordCommandResult } from '../types/WDiscordCommandResult';
import { Database } from '../types/generated/database.types';
import { getSupabaseClient } from '../utils/supabase-client';
import { serializedInteraction } from '../utils/discord-serialized-interaction';

export class DiscordQuranRequest extends DiscordRequest {
  constructor(
    public interaction: any,
    public page: number = 1,
    public options?: {
      footnoteOnly?: boolean;
    },
  ) {
    super(interaction);
  }

  async getResultsAndReply(): Promise<void> {
    try {
      const { embeds, components, content } = await this.getResults();
      await this.interaction.reply({
        content,
        embeds,
        components,
      });
    } catch (error: any) {
      await this.interaction.reply({
        content: `\`${error.message || 'Internal Server Error'}\``,
        ephemeral: true,
      });
    }
  }

  async getResults(): Promise<WDiscordCommandResult> {
    const query =
      this.interaction.commandName === 'chapter'
        ? this.getStringInput('chapter') // "/chapter"
        : this.interaction.commandName.startsWith('search')
          ? this.getStringInput('query') // "/search-quran"
          : this.getStringInput('verse'); // "/quran, /equran, etc"

    if (!query) throw new Error(`Missing query`);

    const path = this.isSearchRequest()
      ? `search/?q=${query}&highlight=true&ngc=true&iwo=${this.getStringInput('strict-search') === 'yes' ? 'false' : 'true'}`
      : `${query}?ngc=true`;

    const req = await fetch(`https://api.wikisubmission.org/quran/${path}`);

    const request: {
      results: Database['public']['Tables']['DataQuran']['Row'][];
      error?: { name: string; description: string };
    } = await req.json();

    if (request?.results && !request.error) {
      const title = this.title(request.results);
      const description = this.description(request.results);
      const footer = this.footer();

      // Multi-page? Cache interaction.
      if (description.length > 1) {
        const db = getSupabaseClient();
        await db.from('GlobalCache').insert({
          key: this.interaction.id,
          value: JSON.stringify(serializedInteraction(this.interaction)),
        });
      }

      if (this.page > description.length) {
        throw new Error(`You've reached the last page`);
      }

      if (this.page <= 0) {
        throw new Error(`You're on the first page`);
      }

      return {
        content: this.isSearchRequest()
          ? `Found **${request.results.length}** verses with \`${query}\``
          : undefined,
        embeds: [
          new EmbedBuilder()
            .setTitle(title)
            .setDescription(description[this.page - 1])
            .setFooter({
              text: `${footer}${description.length > 1 ? ` • Page ${this.page}/${description.length}` : ``}`,
            })
            .setColor('DarkButNotBlack'),
        ],
        components:
          description.length > 1
            ? [
                new ActionRowBuilder<any>().setComponents(
                  ...(this.page > 1
                    ? [
                        new ButtonBuilder()
                          .setLabel('Previous Page')
                          .setCustomId(`page_${this.page - 1}`)
                          .setStyle(2),
                      ]
                    : []),

                  ...(this.page !== description.length
                    ? [
                        new ButtonBuilder()
                          .setLabel('Next page')
                          .setCustomId(`page_${this.page + 1}`)
                          .setStyle(1),
                      ]
                    : []),
                ),
              ]
            : [],
      };
    } else {
      throw new Error(
        `${request?.error?.description || `No verse/(s) found with "${query}"`}`,
      );
    }
  }

  // Helper methods.

  private title(
    data: Database['public']['Tables']['DataQuran']['Row'][],
  ): string {
    const language = this.targetLanguage();
    if (!data || data.length === 0) return '--';

    if (this.options?.footnoteOnly) return 'Footnote(s)';

    if (this.interaction.commandName.startsWith('search')) {
      return `${this.getStringInput('query') || '*'} - Quran Search`;
    } else {
      const baseChapter = data[0].chapter_number;
      for (const verse of data) {
        if (verse.chapter_number !== baseChapter) return 'Multiple Chapters';
      }
      return `Sura ${data[0].chapter_number}, ${data[0][_resolveLanguageToChapterKey()]} (${data[0].chapter_title_arabic_transliteration})`;
    }

    function _resolveLanguageToChapterKey(): keyof Database['public']['Tables']['DataQuran']['Row'] {
      switch (language) {
        case 'englishAndArabic':
          return 'chapter_title_english';
        case 'tamil':
          return 'chapter_title_english';
        default:
          return `chapter_title_${language}` in data
            ? (`chapter_title_${language}` as keyof Database['public']['Tables']['DataQuran']['Row'])
            : `chapter_title_english`;
      }
    }
  }

  private description(
    data: Database['public']['Tables']['DataQuran']['Row'][],
  ): string[] {
    const noCommentary = this.getStringInput('no-footnotes') === 'yes';
    const arabic = this.getStringInput('with-arabic') === 'yes';
    const transliteration =
      this.getStringInput('with-transliteration') === 'yes';

    let description = '';

    const westernNumeralsPreferenceUsers = [
      '835330532584980491',
      '771800475410497576',
    ];

    let [iteration, maxVerses, reachedLimit] = [0, 300, false];

    for (const i of data || []) {
      if (iteration < maxVerses) {
        if (
          !noCommentary &&
          i.verse_subtitle_english &&
          !this.options?.footnoteOnly
        ) {
          description += this.descriptionSubtitleComponent(i);
        }

        if (
          this.interaction.commandName !== 'aquran' &&
          !this.options?.footnoteOnly
        ) {
          description += this.descriptionTextComponent(i);
        }

        if (
          (arabic ||
            this.interaction.commandName === 'equran' ||
            this.interaction.commandName === 'aquran') &&
          !this.options?.footnoteOnly
        ) {
          description += `(${westernNumeralsPreferenceUsers.includes(this.interaction.user?.id) ? i.verse_id : i.verse_id_arabic}) ${i.verse_text_arabic}\n\n`;
        }

        if (transliteration && !this.options?.footnoteOnly) {
          description += `${i.verse_text_arabic_transliteration}\n\n`;
        }

        if (!noCommentary || this.options?.footnoteOnly) {
          description += this.descriptionFootnoteComponent(i);
        }
      } else {
        if (!reachedLimit) {
          description += `----- You have reached the maximum verse limit per single request (300) -----`;
          reachedLimit = true;
        }
      }
      iteration++;
    }

    return this._splitToChunks(description);
  }

  descriptionSubtitleComponent(
    i: Database['public']['Tables']['DataQuran']['Row'],
  ) {
    const language = this.targetLanguage();

    if (!i.verse_subtitle_english || !i.verse_subtitle_turkish) return '';

    switch (language) {
      case 'english':
        return this._safeMarkdown(
          `${this._codify(i.verse_subtitle_english, this.interaction.commandName === 'search-quran')}\n\n`,
        );
      case 'turkish':
        return this._safeMarkdown(
          `${this._codify(i.verse_subtitle_turkish, this.interaction.commandName === 'search-quran')}\n\n`,
        );
      case 'tamil':
        return this._safeMarkdown(
          `${this._codify(i.verse_subtitle_tamil, this.interaction.commandName === 'search-quran')}\n\n`,
        );
      default:
        return this._safeMarkdown(
          `${this._codify(i.verse_subtitle_english, this.interaction.commandName === 'search-quran')}\n\n`,
        );
    }
  }

  private descriptionTextComponent(
    i: Database['public']['Tables']['DataQuran']['Row'],
  ) {
    let descriptionKey: keyof Database['public']['Tables']['DataQuran']['Row'] =
      'verse_text_english';

    switch (this.targetLanguage()) {
      case 'english':
        descriptionKey = `verse_text_english`;
        break;
      case 'turkish':
        descriptionKey = `verse_text_turkish`;
        break;
      case 'arabic':
        descriptionKey = `verse_text_arabic`;
        break;
      case 'bahasa':
        descriptionKey = `verse_text_bahasa`;
        break;
      case 'french':
        descriptionKey = `verse_text_french`;
        break;
      case 'persian':
        descriptionKey = `verse_text_persian`;
        break;
      case 'russian':
        descriptionKey = `verse_text_russian`;
        break;
      case 'swedish':
        descriptionKey = `verse_text_swedish`;
        break;
      case 'tamil':
        descriptionKey = `verse_text_tamil`;
        break;
      default:
        descriptionKey = `verse_text_english`;
        break;
    }

    return (
      `**[${this.descriptionTextVerseIdComponent(i)}]** ` +
      this._safeMarkdown(`${i[descriptionKey]}\n\n`)
    );
  }

  private descriptionTextVerseIdComponent(
    i: Database['public']['Tables']['DataQuran']['Row'],
  ) {
    {
      switch (this.targetLanguage()) {
        case 'arabic':
          return i.verse_id_arabic;

        case 'persian':
          return i.verse_id_arabic;

        default:
          return i.verse_id;
      }
    }
  }

  private descriptionFootnoteComponent(
    i: Database['public']['Tables']['DataQuran']['Row'],
  ) {
    if (!i.verse_footnote_english || !i.verse_footnote_turkish) return '';

    switch (this.targetLanguage()) {
      case 'english':
        return (
          '*' + this._safeMarkdown(`${i.verse_footnote_english}`) + '*\n\n'
        );
      case 'turkish':
        return (
          '*' + this._safeMarkdown(`*${i.verse_footnote_turkish}*`) + '*\n\n'
        );
      case 'tamil':
        return (
          '*' + this._safeMarkdown(`*${i.verse_footnote_tamil}*`) + '*\n\n'
        );
      default:
        return (
          '*' + this._safeMarkdown(`*${i.verse_footnote_english}*`) + '*\n\n'
        );
    }
  }

  private footer() {
    switch (this.interaction.commandName) {
      case 'quran':
        return 'Quran: The Final Testament';
      case 'aquran':
        return 'Quran: The Final Testament';
      case 'equran':
        return 'Quran: The Final Testament';
      case 'bquran':
        return 'Quran: The Final Testament • Bahasa';
      case 'rquran':
        return 'Коран: Последний Завет • Russian';
      case 'pquran':
        return 'Quran: The Final Testament • Persian';
      case 'squran':
        return 'Koranen: Det Sista Testamentet • Swedish';
      case 'tquran':
        return 'Kuran: Son Ahit • Turkish';
      case 'fquran':
        return 'Quran: Le Testament Final • French';
      case 'tmquran':
        return 'Quran: The Final Testament இறுதி வேதம் • Tamil';
      default:
        return 'Quran: The Final Testament';
    }
  }
}
