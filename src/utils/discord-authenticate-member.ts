import { WBotManager } from '../core/bot-manager';
import { GuildMember, APIInteractionGuildMember } from 'discord.js';
import { WDiscordAccessControlList } from '../types/WDiscordAccessControlList';

export function authenticateMember(
  member: GuildMember | APIInteractionGuildMember | null,
  accessControlList: WDiscordAccessControlList
): boolean {
  if (!member || !member.roles) return false;

  const roles =
    member instanceof GuildMember
      ? new Set(member.roles.cache.map((r) => r.name))
      : new Set(member.roles);

  if (member?.user.id === WBotManager.private.client.user?.id) return true;

  let requiredRoles: Set<string> = new Set();

  // Determine required roles
  switch (accessControlList) {
    case 'VERIFIED_AND_ABOVE':
      requiredRoles.add('Verified');
      requiredRoles.add('Insider');
      requiredRoles.add('Moderator');
      requiredRoles.add('Administrator');
      requiredRoles.add('Developer');
      break;

    case 'INSIDER_AND_ABOVE':
      requiredRoles.add('Insider');
      requiredRoles.add('Moderator');
      requiredRoles.add('Administrator');
      requiredRoles.add('Developer');
      break;

    case 'MOD_AND_ABOVE':
      requiredRoles.add('Moderator');
      requiredRoles.add('Administrator');
      requiredRoles.add('Developer');
      break;

    case 'ADMIN':
      requiredRoles.add('Administrator');
      requiredRoles.add('Developer');
      break;

    default:
      // Validate against a custom string array
      if (Array.isArray(accessControlList)) {
        requiredRoles = new Set(accessControlList);
      }
      break;
  }

  return Array.from(roles).some((roleId) => requiredRoles.has(roleId));
}
