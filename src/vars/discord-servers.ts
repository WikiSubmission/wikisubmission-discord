import {
  Guild,
  GuildChannelManager,
  GuildBasedChannel,
  GuildMember,
  GuildMemberManager,
  OAuth2Guild,
} from 'discord.js';
import { WBotManager } from '../core/bot-manager';
import { WDiscordServer } from '../types/WDiscordServer';

export class DiscordServers {
  static Submission: WDiscordServer = {
    name: 'Submission',
    id: '911268076933230662',
    channels: () => this.getChannelsFn(this.Submission.id),
    channel: (channelId) => this.getChannelFn(this.Submission.id, channelId),
    members: () => this.getMembersFn(this.Submission.id),
    member: (memberId) => this.getMemberFn(this.Submission.id, memberId),
  };

  static WikiSubmissionDevelopers: WDiscordServer = {
    name: 'WikiSubmission Developers',
    id: '1080271049377202177',
    channels: () => this.getChannelsFn(this.WikiSubmissionDevelopers.id),
    channel: (channelId) =>
      this.getChannelFn(this.WikiSubmissionDevelopers.id, channelId),
    members: () => this.getMembersFn(this.WikiSubmissionDevelopers.id),
    member: (memberId) =>
      this.getMemberFn(this.WikiSubmissionDevelopers.id, memberId),
  };

  private static async getChannelsFn(
    guildId: string,
  ): Promise<GuildChannelManager | null> {
    const guild = await this.resolveGuild(guildId);
    return guild?.channels || null;
  }

  private static async getChannelFn(
    guildId: string,
    channelId: string,
  ): Promise<GuildBasedChannel | null> {
    const guild = await this.resolveGuild(guildId);
    return (
      guild?.channels.cache.get(channelId) ||
      (await guild?.channels.fetch(channelId)) ||
      null
    );
  }

  private static async getMembersFn(
    guildId: string,
  ): Promise<GuildMemberManager | null> {
    const guild = await this.resolveGuild(guildId);
    return guild?.members || null;
  }

  private static async getMemberFn(
    guildId: string,
    memberId: string,
  ): Promise<GuildMember | null> {
    const guild = await this.resolveGuild(guildId);
    return (
      guild?.members.cache.get(memberId) ||
      (await guild?.members.fetch(memberId)) ||
      null
    );
  }

  private static async resolveGuild(guildId: string): Promise<Guild | null> {
    const bot = WBotManager.private;

    let guild =
      bot.client.guilds.cache.get(guildId) ||
      (await bot.client.guilds.fetch(guildId));

    if (!guild) return null;

    if (guild instanceof OAuth2Guild) {
      guild = await guild.fetch();
    }

    return guild;
  }
}
