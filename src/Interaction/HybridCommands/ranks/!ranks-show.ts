/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2024 iHorizon
*/

import {
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    GuildMember,
    Message,
    User,
} from 'discord.js';
import { LanguageData } from '../../../../types/languageData';
import { Command } from '../../../../types/command';
import { Option } from '../../../../types/option';
export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, lang: LanguageData, command: Option | Command | undefined, neededPerm: number, args?: string[]) => {

        // Guard's Typing
        if (!client.user || !interaction.member || !interaction.guild || !interaction.channel) return;

        if (interaction instanceof ChatInputCommandInteraction) {
            var user = interaction.options.getMember("user") as GuildMember || interaction.member;
        } else {
            var _ = await client.method.checkCommandArgs(interaction, command, args!, lang); if (!_) return;
            var user = client.method.member(interaction, args!, 0) || interaction.member;
        };

        let baselang = await client.db.get(`${interaction.guildId}.USER.${user.id}.XP_LEVELING`);
        var level = baselang?.level || 0;
        var currentxp = baselang?.xp || 0;

        var xpNeeded = level * 500 + 500;
        var expNeededForLevelUp = xpNeeded - currentxp;

        let nivEmbed = new EmbedBuilder()
            .setTitle(lang.level_embed_title
                .replace('${user.username}', String(user.user.globalName || user.displayName))
            )
            .setColor('#0014a8')
            .addFields(
                {
                    name: lang.level_embed_fields1_name, value: lang.level_embed_fields1_value
                        .replace('${currentxp}', currentxp)
                        .replace('${xpNeeded}', xpNeeded.toString()), inline: true
                },
                {
                    name: lang.level_embed_fields2_name, value: lang.level_embed_fields2_value
                        .replace('${level}', level), inline: true
                }
            )
            .setDescription(lang.level_embed_description.replace('${expNeededForLevelUp}', expNeededForLevelUp.toString())
            )
            .setTimestamp()
            .setThumbnail("https://cdn.discordapp.com/attachments/847484098070970388/850684283655946240/discord-icon-new-2021-logo-09772BF096-seeklogo.com.png")
            .setFooter(await client.method.bot.footerBuilder(interaction));

        await client.method.interactionSend(interaction, {
            embeds: [nivEmbed],
            allowedMentions: { repliedUser: false },
            files: [await client.method.bot.footerAttachmentBuilder(interaction)]
        });
        return;
    },
};