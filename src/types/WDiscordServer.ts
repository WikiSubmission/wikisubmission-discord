import {
  GuildChannelManager,
  GuildBasedChannel,
  GuildMember,
  GuildMemberManager,
} from 'discord.js';

export interface WDiscordServer {
  name: string;
  id: string;
  channels: () => Promise<GuildChannelManager | null>;
  channel: (channelId: string) => Promise<GuildBasedChannel | null>;
  members: () => Promise<GuildMemberManager | null>;
  member: (memberId: string) => Promise<GuildMember | null>;
}
