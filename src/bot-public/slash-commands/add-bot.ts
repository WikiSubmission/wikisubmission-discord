import { EmbedBuilder } from "discord.js";
import { WSlashCommand } from "../../types/WSlashCommand";
import { WBotManager } from "../../core/bot-manager";

export default function command(): WSlashCommand {
  return {
    name: "add-bot",
    description: "Add the bot to your server",
    handler: async (interaction) => {
      const { clientId } = await WBotManager.public.getBotCredentials();
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Add this bot to your server")
            .setFields({
              name: "Link",
              value: `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=274877962240&integration_type=0&scope=bot`,
            })
            .setThumbnail(
                WBotManager.public.client.user?.displayAvatarURL() || null,
            )
            .setColor("DarkButNotBlack"),
        ],
      });
      return interaction;
    },
  };
}
