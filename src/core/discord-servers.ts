import {
  Guild,
  GuildChannelManager,
  GuildBasedChannel,
  GuildMember,
  GuildMemberManager,
  OAuth2Guild,
} from 'discord.js';
import { WBotManager } from './bot-manager';
import { WDiscordServer } from '../types/WDiscordServer';

export class DiscordServers {
  static Submission: WDiscordServer = {
    name: 'Submission',
    id: '911268076933230662',
    channels: () => this.fnGetChannels(this.Submission.id),
    channel: (channelId) => this.fnGetChannel(this.Submission.id, channelId),
    members: () => this.fnGetMembers(this.Submission.id),
    member: (memberId) => this.fnGetMember(this.Submission.id, memberId),
  };

  static WikiSubmissionDevelopers: WDiscordServer = {
    name: 'WikiSubmission Developers',
    id: '1080271049377202177',
    channels: () => this.fnGetChannels(this.WikiSubmissionDevelopers.id),
    channel: (channelId) =>
      this.fnGetChannel(this.WikiSubmissionDevelopers.id, channelId),
    members: () => this.fnGetMembers(this.WikiSubmissionDevelopers.id),
    member: (memberId) =>
      this.fnGetMember(this.WikiSubmissionDevelopers.id, memberId),
  };

  private static async fnGetChannels(
    guildId: string,
  ): Promise<GuildChannelManager | null> {
    const guild = await this.fnResolveGuild(guildId);
    return guild?.channels || null;
  }

  private static async fnGetChannel(
    guildId: string,
    channelId: string,
  ): Promise<GuildBasedChannel | null> {
    const guild = await this.fnResolveGuild(guildId);
    return (
      guild?.channels.cache.get(channelId) ||
      (await guild?.channels.fetch(channelId)) ||
      null
    );
  }

  private static async fnGetMembers(
    guildId: string,
  ): Promise<GuildMemberManager | null> {
    const guild = await this.fnResolveGuild(guildId);
    return guild?.members || null;
  }

  private static async fnGetMember(
    guildId: string,
    memberId: string,
  ): Promise<GuildMember | null> {
    const guild = await this.fnResolveGuild(guildId);
    return (
      guild?.members.cache.get(memberId) ||
      (await guild?.members.fetch(memberId)) ||
      null
    );
  }

  private static async fnResolveGuild(guildId: string): Promise<Guild | null> {
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
