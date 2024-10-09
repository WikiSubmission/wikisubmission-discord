export class DiscordRequest {
  constructor(public interaction: any) {
    this.interaction = interaction;
  }

  // Some helper methods.

  getStringInput(queryKey = 'query'): string | null {
    const q = Array.isArray(this.interaction.options)
      ? // Cached
        this.interaction.options.find(
          (i: { name: string; type: number; value: string }) =>
            i.name === queryKey,
        )?.value
      : // Resolvable
        this.interaction.options.get(queryKey)?.value?.toString();

    return q || null;
  }

  isSearchRequest(): boolean {
    return this.interaction.commandName.startsWith('search');
  }

  targetLanguage(): string {
    if (this.getStringInput('language')) {
      const forceLanguage = this.getStringInput('language');

      switch (forceLanguage) {
        case 'english':
          return 'english';
        case 'arabic':
          return 'arabic';
        case 'bahasa':
          return 'bahasa';
        case 'russian':
          return 'russian';
        case 'persian':
          return 'persian';
        case 'swedish':
          return 'swedish';
        case 'turkish':
          return 'turkish';
        case 'french':
          return 'french';
        case 'tamil':
          return 'tamil';
        default:
          return 'english';
      }
    }

    switch (this.interaction.commandName) {
      case 'quran':
        return 'english';
      case 'aquran':
        return 'arabic';
      case 'equran':
        return 'englishAndArabic';
      case 'bquran':
        return 'bahasa';
      case 'rquran':
        return 'russian';
      case 'pquran':
        return 'persian';
      case 'squran':
        return 'swedish';
      case 'tquran':
        return 'turkish';
      case 'fquran':
        return 'french';
      case 'tmquran':
        return 'tamil';
      default:
        return 'english';
    }
  }

  _safeMarkdown(s?: string | null): string {
    if (!s) return s || '';
    if (this.interaction.commandName.startsWith('search')) {
      return s;
    } else return s.replace(/(?<!\*)\*{1,2}(?!\*)/g, '±') ?? '';
  }

  _codify(s?: string | null, dismiss?: boolean): string {
    if (!s) return '';
    if (dismiss) return s;
    return `\`${s}\``;
  }

  _splitToChunks(inputString: string, maxChunkLength: number = 3000): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    const lines = inputString.split('\n');

    for (const line of lines) {
      const currentChunkLength = currentChunk.length + line.length + 1;

      if (currentChunkLength > maxChunkLength) {
        chunks.push(currentChunk.trim());
        currentChunk = line.trim();
      } else {
        currentChunk += '\n' + line;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}
